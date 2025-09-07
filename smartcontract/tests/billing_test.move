#[test_only]
module aptick_addr::billing_tests {
    use std::signer;
    use std::string;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptick_addr::billing_testable as billing;

    #[test(account = @0x1)]
    fun test_deposit_and_refund(account: &signer) {
        billing::init(account);

        // Mint 1 APT for testing
        coin::mint_for_testing<AptosCoin>(signer::address_of(account), 100000000);

        // Register provider
        billing::register_provider(account, 100, string::utf8(b"GB"));

        // Deposit 1000 Octas
        billing::deposit(account, 1, 1000);

        let bal = billing::user_balance(
            1,
            signer::address_of(account),
            signer::address_of(account)
        );
        assert!(bal == 1000, 0);

        billing::terminate_service(account, 1);

        let after = billing::user_balance(
            1,
            signer::address_of(account),
            signer::address_of(account)
        );
        assert!(after == 0, 1);
    }
}
