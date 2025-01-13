use trident_client::fuzzing::*;
use ark_circom::{CircomConfig, CircomBuilder,CircomReduction,read_zkey};
use ark_bn254::{Bn254};
use ark_groth16::{Groth16};
use ark_std::{rand::thread_rng, log2};


use ark_crypto_primitives::snark::SNARK;


// For zkey reading from file
use std::{
    collections::HashMap,
    // io::{Read, Seek, SeekFrom},
    fs::File
};

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
                .get_or_create_account(10, client, 6, &user.pubkey(), None);

        let mut token_mint_y =
            fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, client, 6, &user.pubkey(), None);

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

        if let Err(pool_token_account_x) = pool_token_account_x {
            // failed parsing
            return Err(FuzzingError::Custom(1));
        }

        if let Err(pool_token_account_y) = pool_token_account_y {
            // failed parsing
            return Err(FuzzingError::Custom(2));
        }

        if let Err(lp_token_mint) = lp_token_mint {
            // failed parsing
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

// -- proof generation helper functions START --
// type IoResult<T> = Result<T, SerializationError>;

// #[derive(Clone, Debug)]
// struct Section {
//     position: u64,
//     #[allow(dead_code)]
//     size: usize,
// }

// #[derive(Debug)]
// struct BinFile<'a, R> {
//     #[allow(dead_code)]
//     ftype: String,
//     #[allow(dead_code)]
//     version: u32,
//     sections: HashMap<u32, Vec<Section>>,
//     reader: &'a mut R,
// }

// impl<'a, R: Read + Seek> BinFile<'a, R> {
//     fn new(reader: &'a mut R) -> IoResult<Self> {
//         let mut magic = [0u8; 4];
//         reader.read_exact(&mut magic)?;

//         let version = reader.read_u32::<LittleEndian>()?;

//         let num_sections = reader.read_u32::<LittleEndian>()?;

//         let mut sections = HashMap::new();
//         for _ in 0..num_sections {
//             let section_id = reader.read_u32::<LittleEndian>()?;
//             let section_length = reader.read_u64::<LittleEndian>()?;

//             let section = sections.entry(section_id).or_insert_with(Vec::new);
//             section.push(Section {
//                 position: reader.stream_position()?,
//                 size: section_length as usize,
//             });

//             reader.seek(SeekFrom::Current(section_length as i64))?;
//         }

//         Ok(Self {
//             ftype: std::str::from_utf8(&magic[..]).unwrap().to_string(),
//             version,
//             sections,
//             reader,
//         })
//     }

//     fn proving_key(&mut self) -> IoResult<ProvingKey<Bn254>> {
//         let header = self.groth_header()?;
//         let ic = self.ic(header.n_public)?;

//         let a_query = self.a_query(header.n_vars)?;
//         let b_g1_query = self.b_g1_query(header.n_vars)?;
//         let b_g2_query = self.b_g2_query(header.n_vars)?;
//         let l_query = self.l_query(header.n_vars - header.n_public - 1)?;
//         let h_query = self.h_query(header.domain_size as usize)?;

//         let vk = VerifyingKey::<Bn254> {
//             alpha_g1: header.verifying_key.alpha_g1,
//             beta_g2: header.verifying_key.beta_g2,
//             gamma_g2: header.verifying_key.gamma_g2,
//             delta_g2: header.verifying_key.delta_g2,
//             gamma_abc_g1: ic,
//         };

//         let pk = ProvingKey::<Bn254> {
//             vk,
//             beta_g1: header.verifying_key.beta_g1,
//             delta_g1: header.verifying_key.delta_g1,
//             a_query,
//             b_g1_query,
//             b_g2_query,
//             h_query,
//             l_query,
//         };

//         Ok(pk)
//     }

//     fn get_section(&self, id: u32) -> Section {
//         self.sections.get(&id).unwrap()[0].clone()
//     }

//     fn groth_header(&mut self) -> IoResult<HeaderGroth> {
//         let section = self.get_section(2);
//         let header = HeaderGroth::new(&mut self.reader, &section)?;
//         Ok(header)
//     }

//     fn ic(&mut self, n_public: usize) -> IoResult<Vec<G1Affine>> {
//         // the range is non-inclusive so we do +1 to get all inputs
//         self.g1_section(n_public + 1, 3)
//     }

//     /// Returns the [`ConstraintMatrices`] corresponding to the zkey
//     pub fn matrices(&mut self) -> IoResult<ConstraintMatrices<Fr>> {
//         let header = self.groth_header()?;

//         let section = self.get_section(4);
//         self.reader.seek(SeekFrom::Start(section.position))?;
//         let num_coeffs: u32 = self.reader.read_u32::<LittleEndian>()?;

//         // insantiate AB
//         let mut matrices = vec![vec![vec![]; header.domain_size as usize]; 2];
//         let mut max_constraint_index = 0;
//         for _ in 0..num_coeffs {
//             let matrix: u32 = self.reader.read_u32::<LittleEndian>()?;
//             let constraint: u32 = self.reader.read_u32::<LittleEndian>()?;
//             let signal: u32 = self.reader.read_u32::<LittleEndian>()?;

//             let value: Fr = deserialize_field_fr(&mut self.reader)?;
//             max_constraint_index = std::cmp::max(max_constraint_index, constraint);
//             matrices[matrix as usize][constraint as usize].push((value, signal as usize));
//         }

//         let num_constraints = max_constraint_index as usize - header.n_public;
//         // Remove the public input constraints, Arkworks adds them later
//         matrices.iter_mut().for_each(|m| {
//             m.truncate(num_constraints);
//         });
//         // This is taken from Arkworks' to_matrices() function
//         let a = matrices[0].clone();
//         let b = matrices[1].clone();
//         let a_num_non_zero: usize = a.iter().map(|lc| lc.len()).sum();
//         let b_num_non_zero: usize = b.iter().map(|lc| lc.len()).sum();
//         let matrices = ConstraintMatrices {
//             num_instance_variables: header.n_public + 1,
//             num_witness_variables: header.n_vars - header.n_public,
//             num_constraints,

//             a_num_non_zero,
//             b_num_non_zero,
//             c_num_non_zero: 0,

//             a,
//             b,
//             c: vec![],
//         };

//         Ok(matrices)
//     }

//     fn a_query(&mut self, n_vars: usize) -> IoResult<Vec<G1Affine>> {
//         self.g1_section(n_vars, 5)
//     }

//     fn b_g1_query(&mut self, n_vars: usize) -> IoResult<Vec<G1Affine>> {
//         self.g1_section(n_vars, 6)
//     }

//     fn b_g2_query(&mut self, n_vars: usize) -> IoResult<Vec<G2Affine>> {
//         self.g2_section(n_vars, 7)
//     }

//     fn l_query(&mut self, n_vars: usize) -> IoResult<Vec<G1Affine>> {
//         self.g1_section(n_vars, 8)
//     }

//     fn h_query(&mut self, n_vars: usize) -> IoResult<Vec<G1Affine>> {
//         self.g1_section(n_vars, 9)
//     }

//     fn g1_section(&mut self, num: usize, section_id: usize) -> IoResult<Vec<G1Affine>> {
//         let section = self.get_section(section_id as u32);
//         self.reader.seek(SeekFrom::Start(section.position))?;
//         deserialize_g1_vec(self.reader, num as u32)
//     }

//     fn g2_section(&mut self, num: usize, section_id: usize) -> IoResult<Vec<G2Affine>> {
//         let section = self.get_section(section_id as u32);
//         self.reader.seek(SeekFrom::Start(section.position))?;
//         deserialize_g2_vec(self.reader, num as u32)
//     }
// }


// #[derive(Clone, Debug)]
// struct HeaderGroth {
//     #[allow(dead_code)]
//     n8q: u32,
//     #[allow(dead_code)]
//     q: BigInteger256,
//     #[allow(dead_code)]
//     n8r: u32,
//     #[allow(dead_code)]
//     r: BigInteger256,

//     n_vars: usize,
//     n_public: usize,

//     domain_size: u32,
//     #[allow(dead_code)]
//     power: u32,

//     verifying_key: ZVerifyingKey,
// }

// impl HeaderGroth {
//     fn new<R: Read + Seek>(reader: &mut R, section: &Section) -> IoResult<Self> {
//         reader.seek(SeekFrom::Start(section.position))?;
//         Self::read(reader)
//     }

//     fn read<R: Read>(mut reader: &mut R) -> IoResult<Self> {
//         // TODO: Impl From<u32> in Arkworks
//         let n8q: u32 = u32::deserialize_uncompressed(&mut reader)?;
//         // group order r of Bn254
//         let q = BigInteger256::deserialize_uncompressed(&mut reader)?;

//         let n8r: u32 = u32::deserialize_uncompressed(&mut reader)?;
//         // Prime field modulus
//         let r = BigInteger256::deserialize_uncompressed(&mut reader)?;

//         let n_vars = u32::deserialize_uncompressed(&mut reader)? as usize;
//         let n_public = u32::deserialize_uncompressed(&mut reader)? as usize;

//         let domain_size: u32 = u32::deserialize_uncompressed(&mut reader)?;
//         let power = log2(domain_size as usize);

//         let verifying_key = ZVerifyingKey::new(&mut reader)?;

//         Ok(Self {
//             n8q,
//             q,
//             n8r,
//             r,
//             n_vars,
//             n_public,
//             domain_size,
//             power,
//             verifying_key,
//         })
//     }
// }


// #[derive(Default, Clone, Debug, CanonicalDeserialize)]
// pub struct ZVerifyingKey {
//     alpha_g1: G1Affine,
//     beta_g1: G1Affine,
//     beta_g2: G2Affine,
//     gamma_g2: G2Affine,
//     delta_g1: G1Affine,
//     delta_g2: G2Affine,
// }

// impl ZVerifyingKey {
//     fn new<R: Read>(reader: &mut R) -> IoResult<Self> {
//         let alpha_g1 = deserialize_g1(reader)?;
//         let beta_g1 = deserialize_g1(reader)?;
//         let beta_g2 = deserialize_g2(reader)?;
//         let gamma_g2 = deserialize_g2(reader)?;
//         let delta_g1 = deserialize_g1(reader)?;
//         let delta_g2 = deserialize_g2(reader)?;

//         Ok(Self {
//             alpha_g1,
//             beta_g1,
//             beta_g2,
//             gamma_g2,
//             delta_g1,
//             delta_g2,
//         })
//     }
// }

// // need to divide by R, since snarkjs outputs the zkey with coefficients
// // multiplieid by R^2
// fn deserialize_field_fr<R: Read>(reader: &mut R) -> IoResult<Fr> {
//     let bigint = BigInteger256::deserialize_uncompressed(reader)?;
//     Ok(Fr::new_unchecked(Fr::new_unchecked(bigint).into_bigint()))
// }

// // skips the multiplication by R because Circom points are already in Montgomery form
// fn deserialize_field<R: Read>(reader: &mut R) -> IoResult<Fq> {
//     let bigint = BigInteger256::deserialize_uncompressed(reader)?;
//     // if you use Fq::new it multiplies by R
//     Ok(Fq::new_unchecked(bigint))
// }

// pub fn deserialize_field2<R: Read>(reader: &mut R) -> IoResult<Fq2> {
//     let c0 = deserialize_field(reader)?;
//     let c1 = deserialize_field(reader)?;
//     Ok(Fq2::new(c0, c1))
// }

// fn deserialize_g1<R: Read>(reader: &mut R) -> IoResult<G1Affine> {
//     let x = deserialize_field(reader)?;
//     let y = deserialize_field(reader)?;
//     let infinity = x.is_zero() && y.is_zero();
//     if infinity {
//         Ok(G1Affine::identity())
//     } else {
//         Ok(G1Affine::new(x, y))
//     }
// }

// fn deserialize_g2<R: Read>(reader: &mut R) -> IoResult<G2Affine> {
//     let f1 = deserialize_field2(reader)?;
//     let f2 = deserialize_field2(reader)?;
//     let infinity = f1.is_zero() && f2.is_zero();
//     if infinity {
//         Ok(G2Affine::identity())
//     } else {
//         Ok(G2Affine::new(f1, f2))
//     }
// }

// fn deserialize_g1_vec<R: Read>(reader: &mut R, n_vars: u32) -> IoResult<Vec<G1Affine>> {
//     (0..n_vars).map(|_| deserialize_g1(reader)).collect()
// }

// fn deserialize_g2_vec<R: Read>(reader: &mut R, n_vars: u32) -> IoResult<Vec<G2Affine>> {
//     (0..n_vars).map(|_| deserialize_g2(reader)).collect()
// }


type G1 = ark_bn254::g1::G1Affine;
type G2 = ark_bn254::g2::G2Affine;

// fn compress_g1_be(g1: ) -> [u8; 32] {
//     let g1 = convert_endianness::<32, 64>(g1);
//     let mut compressed = [0u8; 32];
//     let g1 = G1::deserialize_with_mode(g1.as_slice(), Compress::No, Validate::Yes).unwrap();
//     G1::serialize_with_mode(&g1, &mut compressed[..], Compress::Yes).unwrap();

//     convert_endianness::<32, 32>(&compressed)
//         .try_into()
//         .unwrap()
// }

// fn compress_g2_be(g2: &[u8; 128]) -> [u8; 64] {
//     let g2: [u8; 128] = convert_endianness::<64, 128>(g2);

//     let mut compressed = [0u8; 64];
//     let g2 = G2::deserialize_with_mode(g2.as_slice(), Compress::No, Validate::Yes).unwrap();
//     G2::serialize_with_mode(&g2, &mut compressed[..], Compress::Yes).unwrap();
//     convert_endianness::<64, 64>(&compressed)
//         .try_into()
//         .unwrap()
// }
// -- proof generation helper functions END --

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

        // Load the WASM and R1CS for witness and proof generation
        let path = "./groth16/swap_final.zkey";
        let mut file = File::open(path).unwrap();
        let (params, _matrices) = read_zkey(&mut file).unwrap(); // binfile.proving_key().unwrap();

        let cfg = CircomConfig::<Bn254>::new(
            "./groth16/swap.wasm",
            "./groth16/swap.r1cs",
        )
        .unwrap();
        let mut builder = CircomBuilder::new(cfg);
        builder.push_input("privateMinReceived", 0);
        builder.push_input("inputAmount", 11);
        builder.push_input("isSwapXtoY", 1);
        builder.push_input("reserveX", 1);
        builder.push_input("reserveY", 1);

        let circom = builder.build().unwrap();

        let inputs = circom.get_public_inputs().unwrap();

        let mut rng = thread_rng();
        let proof = Groth16::<Bn254, CircomReduction>::prove(&params, circom, &mut rng).unwrap();

        // let proof_a = proof.a.deserialize();

        let data = darklake::instruction::ConfidentialSwap {

            proof_a: [0u8; 64],
            
            proof_b: [0u8; 128],
            proof_c: [0u8; 64],
            public_inputs: [[0u8; 32]; 7],
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
        
        let pool_token_account_x =
            anchor_spl::associated_token::get_associated_token_address(&pool.key(), &token_mint_x);

        let pool_token_account_y =
            anchor_spl::associated_token::get_associated_token_address(&pool.key(), &token_mint_y);


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
                .get_or_create_account(10, client, 6, &user.pubkey(), None);

        let mut token_mint_y =
            fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, client, 6, &user.pubkey(), None);

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

        if let Err(post_pool) = post_pool {
            // failed parsing
            return Err(FuzzingError::Custom(1));
        }

        if let Ok(post_pool) = post_pool {
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
                .get_or_create_account(10, _client, 6, &user.pubkey(), None);

        let mut token_mint_y =
        _fuzz_accounts
                .token_mint_y
                .get_or_create_account(11, _client, 6, &user.pubkey(), None);

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

        let pool_token_account_y =
            anchor_spl::token::TokenAccount::try_deserialize(&mut post_ix[11].data());

        if let Err(pool_token_account_x) = pool_token_account_x {
            // failed parsing
            return Err(FuzzingError::Custom(1));
        }

        if let Err(pool_token_account_y) = pool_token_account_y {
            // failed parsing
            return Err(FuzzingError::Custom(2));
        }

        if let Err(lp_token_mint) = lp_token_mint {
            // failed parsing
            return Err(FuzzingError::Custom(3));
        }

        if let Err(user_token_account_lp) = user_token_account_lp {
            // failed parsing
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
