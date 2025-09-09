module aptick_addr::billing_testable {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::table::{Self as Table, Table};

    /// Provider resource
    struct Provider has store, drop {
        provider_addr: address,
        price_per_unit: u64,
        unit: String,
        billing_id: u64,
        active: bool,
        total_revenue: u64,
    }

    /// Composite key for balances table
    struct BalanceKey has copy, drop, store {
        billing_id: u64,
        user: address,
    }

    /// Escrow holds Coin<AptosCoin>
    struct UserEscrow has store, key {
        coins: coin::Coin<AptosCoin>,
        usage_units: u64,
    }

    /// Global Aptick resource
    struct Aptick has key {
        next_billing_id: u64,
        providers: Table<u64, Provider>,            // billing_id -> Provider
        balances: Table<BalanceKey, UserEscrow>,    // (billing_id,user) -> escrow
    }

    /// Initialize Aptick under the admin’s address
    public entry fun init(admin: &signer) {
        let addr = signer::address_of(admin);
        assert!(!exists<Aptick>(addr), 0);
        move_to(admin, Aptick {
            next_billing_id: 1,
            providers: Table::new<u64, Provider>(),
            balances: Table::new<BalanceKey, UserEscrow>(),
        });
    }

    /// Register a provider
    public entry fun register_provider(
        provider: &signer,
        price_per_unit: u64,
        unit: String
    ) acquires Aptick {
        let addr = signer::address_of(provider);
        let aptick = borrow_global_mut<Aptick>(addr);

        let id = aptick.next_billing_id;
        aptick.next_billing_id = id + 1;

        let p = Provider {
            provider_addr: addr,
            price_per_unit,
            unit,
            billing_id: id,
            active: true,
            total_revenue: 0,
        };
        Table::add(&mut aptick.providers, id, p);
    }

    /// Toggle provider active/inactive
    public entry fun set_provider_active(
        admin: &signer,
        billing_id: u64,
        active: bool
    ) acquires Aptick {
        let addr = signer::address_of(admin);
        let aptick = borrow_global_mut<Aptick>(addr);
        let p_ref = Table::borrow_mut(&mut aptick.providers, billing_id);
        p_ref.active = active;
    }

    /// Deposit prepaid APT into escrow
    public entry fun deposit(user: &signer, billing_id: u64, amount: u64) acquires Aptick {
        let addr = signer::address_of(user);
        let aptick = borrow_global_mut<Aptick>(addr);

        // Ensure provider exists
        let _ = Table::borrow(&aptick.providers, billing_id);

        // Withdraw from user wallet
        let coins = coin::withdraw<AptosCoin>(user, amount);

        let key = BalanceKey { billing_id, user: addr };
        if (Table::contains(&aptick.balances, key)) {
            let esc = Table::borrow_mut(&mut aptick.balances, key);
            coin::merge(&mut esc.coins, coins);
        } else {
            let esc = UserEscrow { coins, usage_units: 0 };
            Table::add(&mut aptick.balances, key, esc);
        }
    }

    /// Record usage (provider deducts units)
    public entry fun record_usage(
        provider: &signer,
        billing_id: u64,
        user_addr: address,
        units: u64
    ) acquires Aptick {
        let addr = signer::address_of(provider);
        let aptick = borrow_global_mut<Aptick>(addr);

        let p_ref = Table::borrow_mut(&mut aptick.providers, billing_id);
        assert!(p_ref.active, 10);
        assert!(addr == p_ref.provider_addr, 2);

        let key = BalanceKey { billing_id, user: user_addr };
        assert!(Table::contains(&aptick.balances, key), 3);
        let esc = Table::borrow_mut(&mut aptick.balances, key);

        let cost = units * p_ref.price_per_unit;
        let esc_val = coin::value<AptosCoin>(&esc.coins);
        assert!(esc_val >= cost, 11);

        let pay = coin::extract<AptosCoin>(&mut esc.coins, cost);
        coin::deposit<AptosCoin>(p_ref.provider_addr, pay);

        esc.usage_units = esc.usage_units + units;
        p_ref.total_revenue = p_ref.total_revenue + cost;
    }

    /// Terminate service → refund escrow
    public entry fun terminate_service(user: &signer, billing_id: u64) acquires Aptick {
        let addr = signer::address_of(user);
        let aptick = borrow_global_mut<Aptick>(addr);

        let key = BalanceKey { billing_id, user: addr };
        assert!(Table::contains(&aptick.balances, key), 4);

        let UserEscrow { coins, usage_units: _ } = Table::remove(&mut aptick.balances, key);

        let refund_amt = coin::value<AptosCoin>(&coins);
        if (refund_amt > 0) {
            coin::deposit<AptosCoin>(addr, coins);
        } else {
            coin::destroy_zero(coins);
        }
    }

    /// View helpers
    public fun provider_price_per_unit(billing_id: u64, admin: address): u64 acquires Aptick {
        let aptick = borrow_global<Aptick>(admin);
        Table::borrow(&aptick.providers, billing_id).price_per_unit
    }

    public fun user_balance(billing_id: u64, user: address, admin: address): u64 acquires Aptick {
        let aptick = borrow_global<Aptick>(admin);
        let key = BalanceKey { billing_id, user };
        if (Table::contains(&aptick.balances, key)) {
            coin::value<AptosCoin>(&Table::borrow(&aptick.balances, key).coins)
        } else { 0 }
    }

    public fun user_usage_units(billing_id: u64, user: address, admin: address): u64 acquires Aptick {
        let aptick = borrow_global<Aptick>(admin);
        let key = BalanceKey { billing_id, user };
        if (Table::contains(&aptick.balances, key)) {
            Table::borrow(&aptick.balances, key).usage_units
        } else { 0 }
    }
}
