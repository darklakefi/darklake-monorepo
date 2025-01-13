use trident_client::fuzzing::*;
use crate::utils::{get_token_x_decimals, get_token_y_decimals};

/// FuzzInstruction contains all available Instructions.
/// Below, the instruction arguments (accounts and data) are defined.
#[derive(Arbitrary, DisplayIx, FuzzTestExecutor)]
pub enum FuzzInstruction {
    AddLiquidity(AddLiquidity),
    // ConfidentialSwap(ConfidentialSwap),
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
    pub user: AccountId,
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




// ADD LIQUIDITY

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
            amount_0:  if self.data.amount_0 < 1001 {
                1001
            } else {
                self.data.amount_0
            } as u64, // force minimum
            amount_1:  if self.data.amount_1 < 1001 {
                1001
            } else {
                self.data.amount_1
            } as u64, // force minimum
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
            5, // self.accounts.user,
            client,
            5 * LAMPORTS_PER_SOL,
        );

        let mut token_mint_x =
            fuzz_accounts
                .token_mint_x
                .get_or_create_account(10, client, get_token_x_decimals(), &user.pubkey(), None);

        let mut token_mint_y =
            fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, client, get_token_y_decimals(), &user.pubkey(), None);

        if token_mint_x.key() > token_mint_y.key() {
            std::mem::swap(&mut token_mint_x, &mut token_mint_y);
        }

        // TODO: for some reason native trident methods create invalid associated token accounts
        // investigate where the difference in program and trident is

        // Native method fails with 2009 violation of constraint (could be owner key related)
        // let user_token_account_y = fuzz_accounts.user_token_account_y.get_or_create_account(
        //     31,
        //     client,
        //     token_mint_y,
        //     user.pubkey(),
        //     0 as u64,
        //     None,
        //     None,
        //     0,
        //     None,
        // );

        // User token account X
        let user_token_account_x = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_x,
        );

        let ix_create_associated_x = anchor_spl::associated_token::spl_associated_token_account::instruction::create_associated_token_account(
            &user.pubkey(),
            &user.pubkey(),
            &token_mint_x.key(),
            &anchor_spl::token::ID,
        );

        // User token account Y
        let user_token_account_y = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_y,
        );

        let ix_create_associated_y = anchor_spl::associated_token::spl_associated_token_account::instruction::create_associated_token_account(
            &user.pubkey(),
            &user.pubkey(),
            &token_mint_y.key(),
            &anchor_spl::token::ID,
        );

        // Give the user some tokens
        let ix_mint_x = anchor_spl::token::spl_token::instruction::mint_to(
            // token_program_id, mint_pubkey, account_pubkey, owner_pubkey, signer_pubkeys, amount
            &anchor_spl::token::ID,
            &token_mint_x.key(),
            &user_token_account_x.key(),
            &user.pubkey(),
            &[&user.pubkey()],
            if self.data.amount_0 < 1001 {
                1001
            } else {
                self.data.amount_0
            } as u64,
        )
        .unwrap();

        let ix_mint_y = anchor_spl::token::spl_token::instruction::mint_to(
            // token_program_id, mint_pubkey, account_pubkey, owner_pubkey, signer_pubkeys, amount
            &anchor_spl::token::ID,
            &token_mint_y.key(),
            &user_token_account_y.key(),
            &user.pubkey(),
            &[&user.pubkey()],
            if self.data.amount_1 < 1001 {
                1001
            } else {
                self.data.amount_1
            } as u64,
        )
        .unwrap();

        client
            .process_transaction(solana_sdk::transaction::Transaction::new_signed_with_payer(
                &[
                    ix_create_associated_x,
                    ix_create_associated_y,
                    ix_mint_x,
                    ix_mint_y,
                ],
                Some(&user.pubkey()),
                &[&user],
                client.get_last_blockhash(),
            ))
            .unwrap();

        let pool = fuzz_accounts.pool.get_or_create_account(
            20,
            client,
            &[
                b"pool",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let token_mint_lp = Pubkey::find_program_address(
            &[
                b"lp",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let pool_token_account_x =
            anchor_spl::associated_token::get_associated_token_address(&pool.key(), &token_mint_x);

        let pool_token_account_y =
            anchor_spl::associated_token::get_associated_token_address(&pool.key(), &token_mint_y);

        // print!("user_token_account_y: {:?}", user_token_account_y);

        let user_token_account_lp = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_lp.0,
        );

        let zero_token_account_lp = anchor_spl::associated_token::get_associated_token_address(
            &solana_sdk::system_program::id(),
            &token_mint_lp.0,
        );

        let signers = vec![user.clone()];
        let acc_meta = darklake::accounts::AddLiquidity {
            token_mint_x,
            token_mint_y,
            token_mint_lp: token_mint_lp.0,
            token_mint_x_program: anchor_spl::token::spl_token::ID,
            token_mint_y_program: anchor_spl::token::spl_token::ID,
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
        }
        .to_account_metas(None);

        // 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        Ok((signers, acc_meta))
    }

    fn check(
        &self,
        pre_ix: &[SnapshotAccount],
        post_ix: &[SnapshotAccount],
        _ix_data: Self::IxData,
    ) -> Result<(), FuzzingError> {
        // pool info

        let lp_token_mint = anchor_spl::token::Mint::try_deserialize(&mut post_ix[4].data());
        let pool_token_account_x =
            anchor_spl::token::TokenAccount::try_deserialize(&mut post_ix[10].data());
        let pool_token_account_y =
            anchor_spl::token::TokenAccount::try_deserialize(&mut post_ix[11].data());

        // failed parsing
        if pool_token_account_x.is_err() {
            return Err(FuzzingError::Custom(1));
        }

        if pool_token_account_y.is_err() {
            return Err(FuzzingError::Custom(2));
        }

        if lp_token_mint.is_err() {
            return Err(FuzzingError::Custom(3));
        }

        let lp_token_mint = lp_token_mint.unwrap();
        let pool_token_account_x = pool_token_account_x.unwrap();
        let pool_token_account_y = pool_token_account_y.unwrap();

        // pool amount should never be 0 after adding liquidity
        if pool_token_account_x.amount == 0 {
            return Err(FuzzingError::Custom(4));
        }

        // pool amount should never be 0 after adding liquidity
        if pool_token_account_y.amount == 0 {
            return Err(FuzzingError::Custom(5));
        }

        // total LP supply should never be 0 after adding liquidity
        if lp_token_mint.supply == 0 {
            return Err(FuzzingError::Custom(6));
        }

        Ok(())
    }
}

// CONFIDENTIAL SWAP

// ///IxOps implementation for `ConfidentialSwap` with all required functions.
// impl IxOps for ConfidentialSwap {
//     type IxData = darklake::instruction::ConfidentialSwap;
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
//         let data = darklake::instruction::ConfidentialSwap {
//             proof_a: self.data.proof_a,
//             proof_b: self.data.proof_b,
//             proof_c: self.data.proof_c,
//             public_inputs: self.data.public_inputs,
//         };
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
//         let user = fuzz_accounts.user.get_or_create_account(
//             self.accounts.user,
//             client,
//             5 * LAMPORTS_PER_SOL,
//         );

//         let token_mint_x = fuzz_accounts
//             .token_mint_x
//             .get_or_create_account(0, client, 6, &user.pubkey(), None);

//         let token_mint_y = fuzz_accounts
//             .token_mint_y
//             .get_or_create_account(1, client, 6, &user.pubkey(), None);

//         let pool = fuzz_accounts.pool.get_or_create_account(
//             self.accounts.pool,
//             client,
//             &[b"pool", token_mint_x.key().as_ref(), token_mint_y.key().as_ref()],
//             &darklake::ID,
//         );

//         let user_token_account_x = fuzz_accounts
//             .user_token_account_x
//             .get_or_create_account(
//                 self.accounts.user_token_account_x,
//                 client,
//                 token_mint_x,
//                 user.pubkey(),
//                 100e6 as u64,
//                 None,
//                 None,
//                 0,
//                 None
//             );

//         let user_token_account_y = fuzz_accounts
//             .user_token_account_y
//             .get_or_create_account(
//                 self.accounts.user_token_account_y,
//                 client,
//                 token_mint_y,
//                 user.pubkey(),
//                 100e6 as u64,
//                 None,
//                 None,
//                 0,
//                 None
//             );

//         let pool_token_account_x = fuzz_accounts
//             .pool_token_account_x
//             .get_or_create_account(
//                 self.accounts.pool_token_account_x,
//                 client,
//                 token_mint_x,
//                 pool,
//                 100e6 as u64,
//                 None,
//                 None,
//                 0,
//                 None
//             );

//         let pool_token_account_y = fuzz_accounts
//             .pool_token_account_y
//             .get_or_create_account(
//                 self.accounts.pool_token_account_y,
//                 client,
//                 token_mint_y,
//                 pool,
//                 100e6 as u64,
//                 None,
//                 None,
//                 0,
//                 None
//             );

//         let signers = vec![user.clone()];

//         let acc_meta = darklake::accounts::ConfidentialSwap {
//             token_mint_x,
//             token_mint_y,
//             token_mint_x_program: anchor_spl::token::ID,
//             token_mint_y_program: anchor_spl::token::ID,
//             pool,
//             user_token_account_x,
//             user_token_account_y,
//             pool_token_account_x,
//             pool_token_account_y,
//             user: user.pubkey(),
//             associated_token_program: anchor_spl::associated_token::ID,
//             system_program: solana_sdk::system_program::id(),
//         }.to_account_metas(None);

//         Ok((signers, acc_meta))
//     }
// }

// INITIALIZE POOL

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
        let user = fuzz_accounts.user.get_or_create_account(
            5, // self.accounts.user,
            client,
            5 * LAMPORTS_PER_SOL,
        );

        let mut token_mint_x =
            fuzz_accounts
                .token_mint_x
                .get_or_create_account(10, client, get_token_x_decimals(), &user.pubkey(), None);

        let mut token_mint_y =
            fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, client, get_token_y_decimals(), &user.pubkey(), None);

        if token_mint_x.key() > token_mint_y.key() {
            std::mem::swap(&mut token_mint_x, &mut token_mint_y);
        }

        let pool = fuzz_accounts.pool.get_or_create_account(
            20,
            client,
            &[
                b"pool",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let token_mint_lp = Pubkey::find_program_address(
            &[
                b"lp",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let metadata_account = Pubkey::find_program_address(
            &[
                b"metadata",
                mpl_token_metadata::ID.as_ref(),
                token_mint_lp.0.as_ref(),
            ],
            &mpl_token_metadata::ID,
        );

        let signers = vec![user.clone()];
        let acc_meta = darklake::accounts::InitializePool {
            pool,
            token_mint_x,
            token_mint_y,
            token_mint_lp: token_mint_lp.0,
            metadata_account: metadata_account.0,
            user: user.pubkey(),
            lp_token_program: anchor_spl::token::ID,
            mpl_program: mpl_token_metadata::ID,
            system_program: solana_sdk::system_program::id(),
            rent: solana_sdk::sysvar::rent::ID,
        }
        .to_account_metas(None);

        Ok((signers, acc_meta))
    }

    fn check(
        &self,
        pre_ix: &[SnapshotAccount],
        post_ix: &[SnapshotAccount],
        _ix_data: Self::IxData,
    ) -> Result<(), FuzzingError> {
        
        // pool info
        let post_pool = darklake::state::Pool::try_deserialize(&mut post_ix[0].data());

        // failed parsing
        if post_pool.is_err() {
            return Err(FuzzingError::Custom(1));
        }

        let post_pool = post_pool.unwrap();

        // did set token mint x
        if post_pool.token_mint_x == Pubkey::default() {
            return Err(FuzzingError::Custom(2));
        }

        // did set token mint y
        if post_pool.token_mint_y == Pubkey::default() {
            return Err(FuzzingError::Custom(3));
        }

        // reserve x should be 0 after initialization
        if post_pool.reserve_x != 0 {
            return Err(FuzzingError::Custom(4));
        }

        // reserve y should be 0 after initialization
        if post_pool.reserve_y != 0 {
            return Err(FuzzingError::Custom(5));
        }

        Ok(())
    }
}

// REMOVE LIQUIDITY

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

        let user = _fuzz_accounts.user.get_or_create_account(
            5, // self.accounts.user,
            _client,
            5 * LAMPORTS_PER_SOL,
        );

        let mut token_mint_x =
        _fuzz_accounts
                .token_mint_x
                .get_or_create_account(10, _client, get_token_x_decimals(), &user.pubkey(), None);

        let mut token_mint_y =
        _fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, _client, get_token_y_decimals(), &user.pubkey(), None);

        if token_mint_x.key() > token_mint_y.key() {
            std::mem::swap(&mut token_mint_x, &mut token_mint_y);
        }

        let token_mint_lp = Pubkey::find_program_address(
            &[
                b"lp",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let user_token_account_lp = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_lp.0,
        );

        let user_token_account_lp_data = anchor_spl::token::TokenAccount::try_deserialize(
            &mut _client.get_account(&user_token_account_lp).data()
        );

        // set test data amount to all user tokens
        let user_lp_balance = match user_token_account_lp_data {
            Ok(user_token_account_lp_data) => user_token_account_lp_data.amount,
            Err(_) => 0,
        };

        let data = darklake::instruction::RemoveLiquidity {
            amount: user_lp_balance,
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
            5, // self.accounts.user,
            client,
            5 * LAMPORTS_PER_SOL,
        );

        let mut token_mint_x =
            fuzz_accounts
                .token_mint_x
                .get_or_create_account(10, client, 6, &user.pubkey(), None);

        let mut token_mint_y =
            fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, client, 6, &user.pubkey(), None);

        if token_mint_x.key() > token_mint_y.key() {
            std::mem::swap(&mut token_mint_x, &mut token_mint_y);
        }

        let token_mint_lp = Pubkey::find_program_address(
            &[
                b"lp",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        // TODO: for some reason native trident methods create invalid associated token accounts
        // investigate where the difference in program and trident is

        // Native method fails with 2009 violation of constraint (could be owner key related)
        // let user_token_account_y = fuzz_accounts.user_token_account_y.get_or_create_account(
        //     31,
        //     client,
        //     token_mint_y,
        //     user.pubkey(),
        //     0 as u64,
        //     None,
        //     None,
        //     0,
        //     None,
        // );

        // User token account X
        let user_token_account_x = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_x,
        );

        // User token account Y
        let user_token_account_y = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_y,
        );

        let user_token_account_lp = anchor_spl::associated_token::get_associated_token_address(
            &user.pubkey(),
            &token_mint_lp.0,
        );

        let pool = fuzz_accounts.pool.get_or_create_account(
            20,
            client,
            &[
                b"pool",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let token_mint_lp = Pubkey::find_program_address(
            &[
                b"lp",
                token_mint_x.key().as_ref(),
                token_mint_y.key().as_ref(),
            ],
            &darklake::ID,
        );

        let pool_token_account_x =
            anchor_spl::associated_token::get_associated_token_address(&pool.key(), &token_mint_x);

        let pool_token_account_y =
            anchor_spl::associated_token::get_associated_token_address(&pool.key(), &token_mint_y);

        let signers = vec![user.clone()];
        let acc_meta = darklake::accounts::RemoveLiquidity {
            token_mint_x,
            token_mint_y,
            token_mint_lp: token_mint_lp.0,
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
        }
        .to_account_metas(None);

        Ok((signers, acc_meta))
    }

    fn check(
        &self,
        pre_ix: &[SnapshotAccount],
        post_ix: &[SnapshotAccount],
        _ix_data: Self::IxData,
    ) -> Result<(), FuzzingError> {
        // pool info

        let lp_token_mint = anchor_spl::token::Mint::try_deserialize(&mut post_ix[4].data());
        let user_token_account_lp =
            anchor_spl::token::TokenAccount::try_deserialize(&mut post_ix[9].data());
        let pool_token_account_x =
            anchor_spl::token::TokenAccount::try_deserialize(&mut post_ix[10].data());
        let pool_token_account_y =
            anchor_spl::token::TokenAccount::try_deserialize(&mut post_ix[11].data());

        // failed parsing
        if pool_token_account_x.is_err() {
            return Err(FuzzingError::Custom(1));
        }

        if pool_token_account_y.is_err() {
            return Err(FuzzingError::Custom(2));
        }

        if lp_token_mint.is_err() {
            return Err(FuzzingError::Custom(3));
        }

        if user_token_account_lp.is_err() {
            return Err(FuzzingError::Custom(4));
        }

        let lp_token_mint = lp_token_mint.unwrap();
        let user_token_account_lp = user_token_account_lp.unwrap();
        let pool_token_account_x = pool_token_account_x.unwrap();
        let pool_token_account_y = pool_token_account_y.unwrap();

        // pool amount should never be 0 after add/remove liquidity due to burning
        if pool_token_account_x.amount == 0 {
            return Err(FuzzingError::Custom(5));
        }

        // pool amount should never be 0 after add/remove liquidity due to burning
        if pool_token_account_y.amount == 0 {
            return Err(FuzzingError::Custom(6));
        }

        // total LP supply should never become 0 after adding/remove liquidity
        // due to burning
        if lp_token_mint.supply == 0 {
            return Err(FuzzingError::Custom(7));
        }

        // user burns all lps to reclaim tokens
        if user_token_account_lp.amount != 0 {
            return Err(FuzzingError::Custom(8));
        }

        Ok(())
    }
}

// UPGRADE POOL

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
    // metadata_account: AccountsStorage<PdaStore>,
    pool: AccountsStorage<PdaStore>,
    pool_token_account_x: AccountsStorage<PdaStore>, // TokenStore
    pool_token_account_y: AccountsStorage<PdaStore>, // TokenStore
    // token_mint_lp: AccountsStorage<PdaStore>, // MintStore
    token_mint_x: AccountsStorage<MintStore>, // MintStore
    token_mint_y: AccountsStorage<MintStore>, // MintStore
    user: AccountsStorage<KeypairStore>,
    user_token_account_lp: AccountsStorage<TokenStore>, // TokenStore
    user_token_account_x: AccountsStorage<TokenStore>,  // TokenStore
    user_token_account_y: AccountsStorage<TokenStore>,  // TokenStore
    zero_token_account_lp: AccountsStorage<TokenStore>, // TokenStore
}
