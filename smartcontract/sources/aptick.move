module aptick_addr::billing {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self as Table, Table};

    // Provider resource
    struct Provider has store, drop {
        provider_addr: address,
        price_per_unit: u64,
        unit: String,
        billing_id: u64,
        active: bool,
        total_revenue: u64,
    }

    // Composite key for balances table
    struct BalanceKey has copy, drop, store {
        billing_id: u64,
        user: address,
    }

    // Escrow holds Coin<AptosCoin>
    // must have `key` ability so it can be stored in Table values
    struct UserEscrow has store, key {
        coins: coin::Coin<AptosCoin>,
        usage_units: u64,
    }

    // Global Aptick resource
    struct Aptick has key {
        next_billing_id: u64,
        providers: Table<u64, Provider>,            // billing_id -> Provider
        balances: Table<BalanceKey, UserEscrow>,    // (billing_id,user) -> escrow
    }

    /// init: publish Aptick resource under module account
    public entry fun init(admin: &signer) {
        assert!(!exists<Aptick>(signer::address_of(admin)), 0);
        move_to(admin, Aptick {
            next_billing_id: 1,
            providers: Table::new<u64, Provider>(),
            balances: Table::new<BalanceKey, UserEscrow>(),
        });
    }

    /// register_provider: provider creates a service and gets billing_id
   public entry fun register_provider(
    provider: &signer,
    price_per_unit: u64,
    unit: String
) acquires Aptick {
    let aptick = borrow_global_mut<Aptick>(module_address());
    let id = aptick.next_billing_id;
    aptick.next_billing_id = id + 1;
    let p = Provider {
        provider_addr: signer::address_of(provider),
        price_per_unit,
        unit,
        billing_id: id,
        active: true,
        total_revenue: 0,
    };
    Table::add(&mut aptick.providers, id, p);
}


    /// set_provider_active: optional admin-only toggle
    public entry fun set_provider_active(admin: &signer, billing_id: u64, active: bool) acquires Aptick {
        // require caller is module owner
        assert!(signer::address_of(admin) == module_address(), 1);
        let aptick = borrow_global_mut<Aptick>(module_address());
        let p_ref = Table::borrow_mut(&mut aptick.providers, billing_id);
        p_ref.active = active;
    }

    /// deposit: user prepays APT into escrow for a given billing_id
    public entry fun deposit(user: &signer, billing_id: u64, amount: u64) acquires Aptick {
        let aptick = borrow_global_mut<Aptick>(module_address());
        // ensure provider exists
        let _ = Table::borrow(&aptick.providers, billing_id);

        // withdraw coins from user
        let coins = coin::withdraw<AptosCoin>(user, amount);

        let key = BalanceKey { billing_id, user: signer::address_of(user) };
        if (Table::contains(&aptick.balances, key)) {
            let esc = Table::borrow_mut(&mut aptick.balances, key);
            coin::merge(&mut esc.coins, coins);
        } else {
            let esc = UserEscrow { coins, usage_units: 0 };
            Table::add(&mut aptick.balances, key, esc);
        }
    }

    /// record_usage: called by provider to debit escrow and pay provider
    public entry fun record_usage(
        provider: &signer,
        billing_id: u64,
        user_addr: address,
        units: u64
    ) acquires Aptick {
        let aptick = borrow_global_mut<Aptick>(module_address());

        let p_ref = Table::borrow_mut(&mut aptick.providers, billing_id);
        assert!(p_ref.active, 10);
        // ensure caller is the registered provider for this billing_id
        assert!(signer::address_of(provider) == p_ref.provider_addr, 2);

        let key = BalanceKey { billing_id, user: user_addr };
        assert!(Table::contains(&aptick.balances, key), 3);
        let esc = Table::borrow_mut(&mut aptick.balances, key);

        // cost calculation
        let cost = units * p_ref.price_per_unit;
        let esc_val = coin::value<AptosCoin>(&esc.coins);
        assert!(esc_val >= cost, 11);

        // extract payment and deposit to provider
        let pay = coin::extract<AptosCoin>(&mut esc.coins, cost);
        coin::deposit<AptosCoin>(p_ref.provider_addr, pay);

        // update bookkeeping
        esc.usage_units = esc.usage_units + units;
        p_ref.total_revenue = p_ref.total_revenue + cost;

        // you may later add event emission here once event API is matched to your framework
    }

    /// terminate_service: refund remaining escrow to user
   public entry fun terminate_service(user: &signer, billing_id: u64) acquires Aptick {
    let aptick = borrow_global_mut<Aptick>(module_address());
    let key = BalanceKey { billing_id, user: signer::address_of(user) };
    assert!(Table::contains(&aptick.balances, key), 4);

    let UserEscrow { coins, usage_units: _ } = Table::remove(&mut aptick.balances, key);

    let refund_amt = coin::value<AptosCoin>(&coins);
    if (refund_amt > 0) {
        coin::deposit<AptosCoin>(signer::address_of(user), coins);
    } else {
        coin::destroy_zero(coins);
    }
}


    /// View helpers
    public fun provider_price_per_unit(billing_id: u64): u64 acquires Aptick {
        let aptick = borrow_global<Aptick>(module_address());
        Table::borrow(&aptick.providers, billing_id).price_per_unit
    }

    public fun provider_addr(billing_id: u64): address acquires Aptick {
        let aptick = borrow_global<Aptick>(module_address());
        Table::borrow(&aptick.providers, billing_id).provider_addr
    }

    public fun user_balance(billing_id: u64, user: address): u64 acquires Aptick {
        let aptick = borrow_global<Aptick>(module_address());
        let key = BalanceKey { billing_id, user };
        if (Table::contains(&aptick.balances, key)) {
            coin::value<AptosCoin>(&Table::borrow(&aptick.balances, key).coins)
        } else { 0 }
    }

    public fun user_usage_units(billing_id: u64, user: address): u64 acquires Aptick {
        let aptick = borrow_global<Aptick>(module_address());
        let key = BalanceKey { billing_id, user };
        if (Table::contains(&aptick.balances, key)) {
            Table::borrow(&aptick.balances, key).usage_units
        } else { 0 }
    }

    inline fun module_address(): address {
        @aptick_addr
    }
}
