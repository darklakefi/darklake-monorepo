use trident_client::fuzzing::*;

/// FuzzInstruction contains all available Instructions.
/// Below, the instruction arguments (accounts and data) are defined.
#[derive(Arbitrary, DisplayIx, FuzzTestExecutor)]
pub enum FuzzInstruction {
    AddLiquidity(AddLiquidity),
    ConfidentialSwap(ConfidentialSwap),
    InitializePool(InitializePool),
    RemoveLiquidity(RemoveLiquidity),
    // UpgradePool(UpgradePool),
}
#[derive(Arbitrary, Debug)]
pub struct AddLiquidity {
    pub accounts: AddLiquidityAccounts,
    pub data: AddLiquidityData,
}
#[derive(Arbitrary, Debug)]
pub struct AddLiquidityAccounts {
    pub token_mint_x: AccountId,
    pub token_mint_y: AccountId,
    pub token_mint_x_program: AccountId,
    pub token_mint_y_program: AccountId,
    pub token_mint_lp: AccountId,
    pub token_mint_lp_program: AccountId,
    pub pool: AccountId,
    pub user_token_account_x: AccountId,
    pub user_token_account_y: AccountId,
    pub user_token_account_lp: AccountId,
    pub pool_token_account_x: AccountId,
    pub pool_token_account_y: AccountId,
    pub zero_token_account_lp: AccountId,
    pub user: AccountId,
    pub associated_token_program: AccountId,
    pub system_program: AccountId,
}
/// Custom data types must derive `Debug` and `Arbitrary`.
/// To do this, redefine the type in the fuzz test and implement the `From`
/// trait
/// to convert it into the type defined in the program.
/// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#custom-data-types
#[derive(Arbitrary, Debug)]
pub struct AddLiquidityData {
    pub amount_0: u64,
    pub amount_1: u64,
}
#[derive(Arbitrary, Debug)]
pub struct ConfidentialSwap {
    pub accounts: ConfidentialSwapAccounts,
    pub data: ConfidentialSwapData,
}
#[derive(Arbitrary, Debug)]
pub struct ConfidentialSwapAccounts {
    pub token_mint_x: AccountId,
    pub token_mint_y: AccountId,
    pub token_mint_x_program: AccountId,
    pub token_mint_y_program: AccountId,
    pub pool: AccountId,
    pub user_token_account_x: AccountId,
    pub user_token_account_y: AccountId,
    pub pool_token_account_x: AccountId,
    pub pool_token_account_y: AccountId,
    pub user: AccountId,
    pub associated_token_program: AccountId,
    pub system_program: AccountId,
}
/// Custom data types must derive `Debug` and `Arbitrary`.
/// To do this, redefine the type in the fuzz test and implement the `From`
/// trait
/// to convert it into the type defined in the program.
/// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#custom-data-types
#[derive(Arbitrary, Debug)]
pub struct ConfidentialSwapData {
    pub proof_a: [u8; 64usize],
    pub proof_b: [u8; 128usize],
    pub proof_c: [u8; 64usize],
    pub public_inputs: [[u8; 32usize]; 7usize],
}
#[derive(Arbitrary, Debug)]
pub struct InitializePool {
    pub accounts: InitializePoolAccounts,
    pub data: InitializePoolData,
}
#[derive(Arbitrary, Debug)]
pub struct InitializePoolAccounts {
    pub pool: AccountId,
    pub token_mint_x: AccountId,
    pub token_mint_y: AccountId,
    pub token_mint_lp: AccountId,
    pub metadata_account: AccountId,
    pub payer: AccountId,
    pub lp_token_program: AccountId,
    pub mpl_program: AccountId,
    pub system_program: AccountId,
    pub rent: AccountId,
}
/// Custom data types must derive `Debug` and `Arbitrary`.
/// To do this, redefine the type in the fuzz test and implement the `From`
/// trait
/// to convert it into the type defined in the program.
/// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#custom-data-types
#[derive(Arbitrary, Debug)]
pub struct InitializePoolData {}
#[derive(Arbitrary, Debug)]
pub struct RemoveLiquidity {
    pub accounts: RemoveLiquidityAccounts,
    pub data: RemoveLiquidityData,
}
#[derive(Arbitrary, Debug)]
pub struct RemoveLiquidityAccounts {
    pub token_mint_x: AccountId,
    pub token_mint_y: AccountId,
    pub token_mint_x_program: AccountId,
    pub token_mint_y_program: AccountId,
    pub token_mint_lp: AccountId,
    pub token_mint_lp_program: AccountId,
    pub pool: AccountId,
    pub user_token_account_x: AccountId,
    pub user_token_account_y: AccountId,
    pub user_token_account_lp: AccountId,
    pub pool_token_account_x: AccountId,
    pub pool_token_account_y: AccountId,
    pub user: AccountId,
    pub associated_token_program: AccountId,
    pub system_program: AccountId,
}
/// Custom data types must derive `Debug` and `Arbitrary`.
/// To do this, redefine the type in the fuzz test and implement the `From`
/// trait
/// to convert it into the type defined in the program.
/// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#custom-data-types
#[derive(Arbitrary, Debug)]
pub struct RemoveLiquidityData {
    pub amount: u64,
}
#[derive(Arbitrary, Debug)]
pub struct UpgradePool {
    pub accounts: UpgradePoolAccounts,
    pub data: UpgradePoolData,
}
#[derive(Arbitrary, Debug)]
pub struct UpgradePoolAccounts {
    pub pool: AccountId,
    pub token_mint_x: AccountId,
    pub token_mint_y: AccountId,
    pub token_mint_lp: AccountId,
    pub metadata_account: AccountId,
    pub payer: AccountId,
    pub lp_token_program: AccountId,
    pub mpl_program: AccountId,
    pub system_program: AccountId,
    pub rent: AccountId,
}
/// Custom data types must derive `Debug` and `Arbitrary`.
/// To do this, redefine the type in the fuzz test and implement the `From`
/// trait
/// to convert it into the type defined in the program.
/// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#custom-data-types
#[derive(Arbitrary, Debug)]
pub struct UpgradePoolData {}
///IxOps implementation for `AddLiquidity` with all required functions.
impl IxOps for AddLiquidity {
    type IxData = darklake::instruction::AddLiquidity;
    type IxAccounts = FuzzAccounts;
    /// Definition of the program ID that the Instruction is associated with.
    fn get_program_id(&self) -> solana_sdk::pubkey::Pubkey {
        darklake::ID
    }
    /// Definition of the Instruction data.
    /// Use randomly generated data from the fuzzer using `self.data.arg_name`
    /// or customize the data as needed.
    /// For more details, visit: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-data
    fn get_data(
        &self,
        _client: &mut impl FuzzClient,
        _fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<Self::IxData, FuzzingError> {
        let data = darklake::instruction::AddLiquidity {
            amount_0: self.data.amount_0,
            amount_1: self.data.amount_1,
        };
        Ok(data)
    }
    /// Definition of of the accounts required by the Instruction.
    /// To utilize accounts stored in `FuzzAccounts`, use
    /// `fuzz_accounts.account_name.get_or_create_account()`.
    /// If no signers are required, leave the vector empty.
    /// For AccountMetas use <program>::accounts::<corresponding_metas>
    /// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-accounts
    fn get_accounts(
        &self,
        client: &mut impl FuzzClient,
        fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<(Vec<Keypair>, Vec<AccountMeta>), FuzzingError> {
        let user = fuzz_accounts.user.get_or_create_account(
            self.accounts.user,
            client,
            5 * LAMPORTS_PER_SOL,
        );

        let token_mint_x = fuzz_accounts
            .token_mint_x
            .get_or_create_account(0, client, 6, &user.pubkey(), None);

        let token_mint_y = fuzz_accounts
            .token_mint_y
            .get_or_create_account(1, client, 6, &user.pubkey(), None);


        let pool = fuzz_accounts.pool.get_or_create_account(
            self.accounts.pool,
            client,
            &[b"pool", token_mint_x.key().as_ref(), token_mint_y.key().as_ref()],
            &darklake::ID,
        );

        let token_mint_lp = fuzz_accounts
            .token_mint_lp
            .get_or_create_account(2, client, 9, &pool, None);


        let user_token_account_x = fuzz_accounts
            .user_token_account_x
            .get_or_create_account(
                self.accounts.user_token_account_x,
                client,
                token_mint_x,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let user_token_account_y = fuzz_accounts
            .user_token_account_y
            .get_or_create_account(
                self.accounts.user_token_account_y,
                client,
                token_mint_y,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let user_token_account_lp = fuzz_accounts
            .user_token_account_lp
            .get_or_create_account(
                self.accounts.user_token_account_lp,
                client,
                token_mint_lp,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let pool_token_account_x = fuzz_accounts
            .pool_token_account_x
            .get_or_create_account(
                self.accounts.pool_token_account_x,
                client,
                token_mint_x,
                pool,
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let pool_token_account_y = fuzz_accounts
            .pool_token_account_y
            .get_or_create_account(
                self.accounts.pool_token_account_y,
                client,
                token_mint_y,
                pool,
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let zero_token_account_lp = fuzz_accounts
            .zero_token_account_lp
            .get_or_create_account(
                self.accounts.zero_token_account_lp,
                client,
                token_mint_lp,
                solana_sdk::system_program::id(),
                0,
                None,
                None,
                0,
                None
            );

        let signers = vec![user.clone()];
        let acc_meta = darklake::accounts::AddLiquidity {
            token_mint_x,
            token_mint_y,
            token_mint_lp,
            token_mint_x_program: anchor_spl::token::ID,
            token_mint_y_program: anchor_spl::token::ID,
            token_mint_lp_program: anchor_spl::token::ID,
            pool,
            user_token_account_x,
            user_token_account_y,
            user_token_account_lp,
            pool_token_account_x,
            pool_token_account_y,
            zero_token_account_lp,
            user: user.pubkey(),
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: solana_sdk::system_program::id(),
        }.to_account_metas(None);

        // 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        Ok((signers, acc_meta))
    }
}
///IxOps implementation for `ConfidentialSwap` with all required functions.
impl IxOps for ConfidentialSwap {
    type IxData = darklake::instruction::ConfidentialSwap;
    type IxAccounts = FuzzAccounts;
    /// Definition of the program ID that the Instruction is associated with.
    fn get_program_id(&self) -> solana_sdk::pubkey::Pubkey {
        darklake::ID
    }
    /// Definition of the Instruction data.
    /// Use randomly generated data from the fuzzer using `self.data.arg_name`
    /// or customize the data as needed.
    /// For more details, visit: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-data
    fn get_data(
        &self,
        _client: &mut impl FuzzClient,
        _fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<Self::IxData, FuzzingError> {
        let data = darklake::instruction::ConfidentialSwap {
            proof_a: self.data.proof_a,
            proof_b: self.data.proof_b,
            proof_c: self.data.proof_c,
            public_inputs: self.data.public_inputs,
        };
        Ok(data)
    }
    /// Definition of of the accounts required by the Instruction.
    /// To utilize accounts stored in `FuzzAccounts`, use
    /// `fuzz_accounts.account_name.get_or_create_account()`.
    /// If no signers are required, leave the vector empty.
    /// For AccountMetas use <program>::accounts::<corresponding_metas>
    /// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-accounts
    fn get_accounts(
        &self,
        client: &mut impl FuzzClient,
        fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<(Vec<Keypair>, Vec<AccountMeta>), FuzzingError> {
        let user = fuzz_accounts.user.get_or_create_account(
            self.accounts.user,
            client,
            5 * LAMPORTS_PER_SOL,
        );

        let token_mint_x = fuzz_accounts
            .token_mint_x
            .get_or_create_account(0, client, 6, &user.pubkey(), None);

        let token_mint_y = fuzz_accounts
            .token_mint_y
            .get_or_create_account(1, client, 6, &user.pubkey(), None);


        let pool = fuzz_accounts.pool.get_or_create_account(
            self.accounts.pool,
            client,
            &[b"pool", token_mint_x.key().as_ref(), token_mint_y.key().as_ref()],
            &darklake::ID,
        );

        let user_token_account_x = fuzz_accounts
            .user_token_account_x
            .get_or_create_account(
                self.accounts.user_token_account_x,
                client,
                token_mint_x,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let user_token_account_y = fuzz_accounts
            .user_token_account_y
            .get_or_create_account(
                self.accounts.user_token_account_y,
                client,
                token_mint_y,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let pool_token_account_x = fuzz_accounts
            .pool_token_account_x
            .get_or_create_account(
                self.accounts.pool_token_account_x,
                client,
                token_mint_x,
                pool,
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let pool_token_account_y = fuzz_accounts
            .pool_token_account_y
            .get_or_create_account(
                self.accounts.pool_token_account_y,
                client,
                token_mint_y,
                pool,
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let signers = vec![user.clone()];

        let acc_meta = darklake::accounts::ConfidentialSwap {
            token_mint_x,
            token_mint_y,
            token_mint_x_program: anchor_spl::token::ID,
            token_mint_y_program: anchor_spl::token::ID,
            pool,
            user_token_account_x,
            user_token_account_y,
            pool_token_account_x,
            pool_token_account_y,
            user: user.pubkey(),
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: solana_sdk::system_program::id(),
        }.to_account_metas(None);

        Ok((signers, acc_meta))
    }
}
///IxOps implementation for `InitializePool` with all required functions.
impl IxOps for InitializePool {
    type IxData = darklake::instruction::InitializePool;
    type IxAccounts = FuzzAccounts;
    /// Definition of the program ID that the Instruction is associated with.
    fn get_program_id(&self) -> solana_sdk::pubkey::Pubkey {
        darklake::ID
    }
    /// Definition of the Instruction data.
    /// Use randomly generated data from the fuzzer using `self.data.arg_name`
    /// or customize the data as needed.
    /// For more details, visit: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-data
    fn get_data(
        &self,
        _client: &mut impl FuzzClient,
        _fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<Self::IxData, FuzzingError> {
        let data = darklake::instruction::InitializePool {};
        Ok(data)
    }
    /// Definition of of the accounts required by the Instruction.
    /// To utilize accounts stored in `FuzzAccounts`, use
    /// `fuzz_accounts.account_name.get_or_create_account()`.
    /// If no signers are required, leave the vector empty.
    /// For AccountMetas use <program>::accounts::<corresponding_metas>
    /// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-accounts
    fn get_accounts(
        &self,
        client: &mut impl FuzzClient,
        fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<(Vec<Keypair>, Vec<AccountMeta>), FuzzingError> {

        let payer = fuzz_accounts.payer.get_or_create_account(
            self.accounts.payer,
            client,
            5 * LAMPORTS_PER_SOL,
        );


        let token_mint_x = fuzz_accounts
            .token_mint_x
            .get_or_create_account(0, client, 6, &payer.pubkey(), None);

        let token_mint_y = fuzz_accounts
            .token_mint_y
            .get_or_create_account(1, client, 6, &payer.pubkey(), None);

        let pool = fuzz_accounts.pool.get_or_create_account(
            self.accounts.pool,
            client,
            &[b"pool", token_mint_x.key().as_ref(), token_mint_y.key().as_ref()],
            &darklake::ID,
        );

        let token_mint_lp = fuzz_accounts
            .token_mint_lp
            .get_or_create_account(2, client, 9, &pool, None);

        let metadata_account = fuzz_accounts.metadata_account.get_or_create_account(
            self.accounts.metadata_account,
            client,
            &[b"metadata", mpl_token_metadata::ID.as_ref(), token_mint_lp.key().as_ref()],
            &mpl_token_metadata::ID
        );

        let signers = vec![payer.clone()];
        let acc_meta = darklake::accounts::InitializePool {
            pool,
            token_mint_x,
            token_mint_y,
            token_mint_lp,
            metadata_account,
            payer: payer.pubkey(),
            lp_token_program: anchor_spl::token::ID,
            mpl_program: mpl_token_metadata::ID,
            system_program: solana_sdk::system_program::id(),
            rent: solana_sdk::sysvar::rent::ID,
        }.to_account_metas(None);

        Ok((signers, acc_meta))
    }
}
///IxOps implementation for `RemoveLiquidity` with all required functions.
impl IxOps for RemoveLiquidity {
    type IxData = darklake::instruction::RemoveLiquidity;
    type IxAccounts = FuzzAccounts;
    /// Definition of the program ID that the Instruction is associated with.
    fn get_program_id(&self) -> solana_sdk::pubkey::Pubkey {
        darklake::ID
    }
    /// Definition of the Instruction data.
    /// Use randomly generated data from the fuzzer using `self.data.arg_name`
    /// or customize the data as needed.
    /// For more details, visit: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-data
    fn get_data(
        &self,
        _client: &mut impl FuzzClient,
        _fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<Self::IxData, FuzzingError> {
        let data = darklake::instruction::RemoveLiquidity {
            amount: self.data.amount,
        };
        Ok(data)
    }
    /// Definition of of the accounts required by the Instruction.
    /// To utilize accounts stored in `FuzzAccounts`, use
    /// `fuzz_accounts.account_name.get_or_create_account()`.
    /// If no signers are required, leave the vector empty.
    /// For AccountMetas use <program>::accounts::<corresponding_metas>
    /// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-accounts
    fn get_accounts(
        &self,
        client: &mut impl FuzzClient,
        fuzz_accounts: &mut FuzzAccounts,
    ) -> Result<(Vec<Keypair>, Vec<AccountMeta>), FuzzingError> {
        let user = fuzz_accounts.user.get_or_create_account(
            self.accounts.user,
            client,
            5 * LAMPORTS_PER_SOL,
        );

        let token_mint_x = fuzz_accounts
            .token_mint_x
            .get_or_create_account(0, client, 6, &user.pubkey(), None);

        let token_mint_y = fuzz_accounts
            .token_mint_y
            .get_or_create_account(1, client, 6, &user.pubkey(), None);


        let pool = fuzz_accounts.pool.get_or_create_account(
            self.accounts.pool,
            client,
            &[b"pool", token_mint_x.key().as_ref(), token_mint_y.key().as_ref()],
            &darklake::ID,
        );

        let token_mint_lp = fuzz_accounts
            .token_mint_lp
            .get_or_create_account(2, client, 9, &pool, None);


        let user_token_account_x = fuzz_accounts
            .user_token_account_x
            .get_or_create_account(
                self.accounts.user_token_account_x,
                client,
                token_mint_x,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let user_token_account_y = fuzz_accounts
            .user_token_account_y
            .get_or_create_account(
                self.accounts.user_token_account_y,
                client,
                token_mint_y,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let user_token_account_lp = fuzz_accounts
            .user_token_account_lp
            .get_or_create_account(
                self.accounts.user_token_account_lp,
                client,
                token_mint_lp,
                user.pubkey(),
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let pool_token_account_x = fuzz_accounts
            .pool_token_account_x
            .get_or_create_account(
                self.accounts.pool_token_account_x,
                client,
                token_mint_x,
                pool,
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let pool_token_account_y = fuzz_accounts
            .pool_token_account_y
            .get_or_create_account(
                self.accounts.pool_token_account_y,
                client,
                token_mint_y,
                pool,
                100e6 as u64,
                None,
                None,
                0,
                None
            );

        let signers = vec![user.clone()];
        let acc_meta = darklake::accounts::RemoveLiquidity {
            token_mint_x,
            token_mint_y,
            token_mint_lp,
            token_mint_x_program: anchor_spl::token::ID,
            token_mint_y_program: anchor_spl::token::ID,
            token_mint_lp_program: anchor_spl::token::ID,
            pool,
            user_token_account_x,
            user_token_account_y,
            user_token_account_lp,
            pool_token_account_x,
            pool_token_account_y,
            user: user.pubkey(),
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: solana_sdk::system_program::id(),
        }.to_account_metas(None);

        Ok((signers, acc_meta))
    }
}
///IxOps implementation for `UpgradePool` with all required functions.
// impl IxOps for UpgradePool {
//     type IxData = darklake::instruction::UpgradePool;
//     type IxAccounts = FuzzAccounts;
//     /// Definition of the program ID that the Instruction is associated with.
//     fn get_program_id(&self) -> solana_sdk::pubkey::Pubkey {
//         darklake::ID
//     }
//     /// Definition of the Instruction data.
//     /// Use randomly generated data from the fuzzer using `self.data.arg_name`
//     /// or customize the data as needed.
//     /// For more details, visit: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-data
//     fn get_data(
//         &self,
//         _client: &mut impl FuzzClient,
//         _fuzz_accounts: &mut FuzzAccounts,
//     ) -> Result<Self::IxData, FuzzingError> {
//         let data = darklake::instruction::UpgradePool {};
//         Ok(data)
//     }
//     /// Definition of of the accounts required by the Instruction.
//     /// To utilize accounts stored in `FuzzAccounts`, use
//     /// `fuzz_accounts.account_name.get_or_create_account()`.
//     /// If no signers are required, leave the vector empty.
//     /// For AccountMetas use <program>::accounts::<corresponding_metas>
//     /// For more details, see: https://ackee.xyz/trident/docs/latest/features/fuzz-instructions/#get-accounts
//     fn get_accounts(
//         &self,
//         client: &mut impl FuzzClient,
//         fuzz_accounts: &mut FuzzAccounts,
//     ) -> Result<(Vec<Keypair>, Vec<AccountMeta>), FuzzingError> {
//         let signers = vec![todo!()];
//         let acc_meta = todo!();
//         Ok((signers, acc_meta))
//     }
// }
/// Check supported AccountsStorages at
/// https://ackee.xyz/trident/docs/latest/features/account-storages/
#[derive(Default)]
pub struct FuzzAccounts {
    metadata_account: AccountsStorage<PdaStore>,
    payer: AccountsStorage<KeypairStore>,
    pool: AccountsStorage<PdaStore>,
    pool_token_account_x: AccountsStorage<TokenStore>,
    pool_token_account_y: AccountsStorage<TokenStore>,
    token_mint_lp: AccountsStorage<MintStore>,
    token_mint_x: AccountsStorage<MintStore>,
    token_mint_y: AccountsStorage<MintStore>,
    user: AccountsStorage<KeypairStore>,
    user_token_account_lp: AccountsStorage<TokenStore>,
    user_token_account_x: AccountsStorage<TokenStore>,
    user_token_account_y: AccountsStorage<TokenStore>,
    zero_token_account_lp: AccountsStorage<TokenStore>,
}
