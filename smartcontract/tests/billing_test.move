#[test_only]
module aptick_addr::billing_test {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use std::string;
    
    // Test the main contract
    #[test(aptos_framework = @0x1, admin = @aptick_addr, provider = @0x123, user = @0x456)]
    public entry fun test_basic_flow(
        aptos_framework: &signer,
        admin: &signer, 
        provider: &signer, 
        user: &signer
    ) {
        // Set up accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(provider));
        account::create_account_for_test(signer::address_of(user));
        
        // Set up AptosCoin
        timestamp::set_time_has_started_for_testing(aptos_framework);
        aptos_coin::initialize_for_test(aptos_framework);
        
        // Initialize billing module
        aptick_addr::billing::init(admin);
        
        // Register provider
        let price_per_unit = 1000000; // 0.01 APT
        let unit_name = string::utf8(b"API_CALL");
        let billing_id = aptick_addr::billing::register_provider(provider, price_per_unit, unit_name);
        
        // Set up user with coins
        let deposit_amount = 50000000; // 0.5 APT
        coin::register<AptosCoin>(user);
        aptos_coin::mint(aptos_framework, signer::address_of(user), deposit_amount);
        
        // User deposits funds
        aptick_addr::billing::deposit(user, billing_id, deposit_amount);
        
        // Check balance
        let balance = aptick_addr::billing::user_balance(billing_id, signer::address_of(user));
        assert!(balance == deposit_amount, 101);
        
        // Record usage
        let usage_units = 10;
        aptick_addr::billing::record_usage(billing_id, signer::address_of(user), usage_units);
        
        // Check updated balance
        let cost = usage_units * price_per_unit;
        let expected_balance = deposit_amount - cost;
        let new_balance = aptick_addr::billing::user_balance(billing_id, signer::address_of(user));
        assert!(new_balance == expected_balance, 102);
        
        // Check provider received payment
        let provider_balance = coin::balance<AptosCoin>(signer::address_of(provider));
        assert!(provider_balance == cost, 103);
        
        // Terminate service (refund)
        aptick_addr::billing::terminate_service(user, billing_id);
        
        // Check user got refund
        let user_balance = coin::balance<AptosCoin>(signer::address_of(user));
        assert!(user_balance == expected_balance, 104);
        
        // Check escrow is empty
        let final_balance = aptick_addr::billing::user_balance(billing_id, signer::address_of(user));
        assert!(final_balance == 0, 105);
    }
    
    // Test insufficient funds scenario
    #[test(aptos_framework = @0x1, admin = @aptick_addr, provider = @0x123, user = @0x456)]
    #[expected_failure(abort_code = 11)]
    public entry fun test_insufficient_funds(
        aptos_framework: &signer,
        admin: &signer, 
        provider: &signer, 
        user: &signer
    ) {
        // Set up accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(provider));
        account::create_account_for_test(signer::address_of(user));
        
        // Set up AptosCoin
        timestamp::set_time_has_started_for_testing(aptos_framework);
        aptos_coin::initialize_for_test(aptos_framework);
        
        // Initialize billing module
        aptick_addr::billing::init(admin);
        
        // Register provider
        let price_per_unit = 1000000; // 0.01 APT
        let unit_name = string::utf8(b"API_CALL");
        let billing_id = aptick_addr::billing::register_provider(provider, price_per_unit, unit_name);
        
        // Set up user with SMALL amount of coins
        coin::register<AptosCoin>(user);
        aptos_coin::mint(aptos_framework, signer::address_of(user), price_per_unit * 5); // Only enough for 5 units
        
        // User deposits funds
        aptick_addr::billing::deposit(user, billing_id, price_per_unit * 5);
        
        // Try to record more usage than funds allow (10 units but only paid for 5)
        aptick_addr::billing::record_usage(billing_id, signer::address_of(user), 10);
        // This should abort with error code 11
    }
}
