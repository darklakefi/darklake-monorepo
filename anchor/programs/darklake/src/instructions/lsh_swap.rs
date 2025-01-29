use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use groth16_solana::groth16::Groth16Verifier;

use crate::constants::{VERIFYINGKEY, LSH_THRESHOLD};
use crate::debug;
use crate::state::Pool;
use crate::errors::ErrorCode;
use crate::zk::*;

#[derive(Accounts)]
pub struct LshSwap<'info> {
    #[account(mut)]
    pub token_mint_x: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub token_mint_y: InterfaceAccount<'info, Mint>,
    pub token_mint_x_program: Interface<'info, TokenInterface>,
    pub token_mint_y_program: Interface<'info, TokenInterface>,
    #[account(mut,
        seeds = [b"pool", pool.token_mint_x.key().as_ref(), pool.token_mint_y.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut,
        associated_token::mint = token_mint_x,
        associated_token::authority = user,
        associated_token::token_program = token_mint_x_program.key(),
    )]
    pub user_token_account_x: InterfaceAccount<'info, TokenAccount>,
    #[account(mut,
        associated_token::mint = token_mint_y,
        associated_token::authority = user,
        associated_token::token_program = token_mint_y_program.key(),
    )]
    pub user_token_account_y: InterfaceAccount<'info, TokenAccount>,
    #[account(mut,
        associated_token::mint = token_mint_x,
        associated_token::authority = pool,
        associated_token::token_program = token_mint_x_program.key(),
    )]
    pub pool_token_account_x: InterfaceAccount<'info, TokenAccount>,
    #[account(mut,
        associated_token::mint = token_mint_y,
        associated_token::authority = pool,
        associated_token::token_program = token_mint_y_program.key(),
    )]
    pub pool_token_account_y: InterfaceAccount<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> LshSwap<'info> {
    pub fn lsh_swap(
        &self,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        input_signals: [[u8; 32]; VERIFYINGKEY.nr_pubinputs],
        salt: [u8; 32]
    ) -> Result<()> {
        // Check at the beginning of the function
        if self.token_mint_x.key() >= self.token_mint_y.key() {
            return Err(ErrorCode::InvalidTokenOrder.into());
        }

        msg!("Confidential swap started");

        // Create a new Groth16Verifier instance
        let mut verifier_result = Groth16Verifier::new(
            &proof_a,
            &proof_b,
            &proof_c,
            &input_signals,
            &VERIFYINGKEY,
        ).map_err(|_| ErrorCode::InvalidGroth16Verifier)?;

        // Verify the proof
        let verified = verifier_result.verify().map_err(|_| ErrorCode::InvalidProof)?;
        require!(verified, ErrorCode::InvalidProof);

        debug!("Proof verified, trying transform");
        
        // Extract the circuit outputs correctly
        let initial_point = u128::from_be_bytes(input_signals[0][16..].try_into().unwrap());
        let final_point = u128::from_be_bytes(input_signals[1][16..].try_into().unwrap());
        let k_ratio_commitment = &input_signals[2][..32]; // Take first 32 bytes of the commitment
        
        let current_state = PoolState {
            x: self.pool.reserve_x,
            y: self.pool.reserve_y,
            trade_output: 0,
        };

        // Extract initial x, y from initial_point
        let initial_x = (initial_point >> 64) as u64;
        let initial_y = (initial_point & ((1u128 << 64) - 1)) as u64;
        
        // Extract final x, y from final_point to calculate trade amount
        let final_x = (final_point >> 64) as u64;
        let trade_amount = final_x.checked_sub(initial_x)
            .ok_or(ErrorCode::InvalidProof)?;
        
        let proof_output = ProofOutput {
            k_ratio_commitment: u32::from_be_bytes(k_ratio_commitment[28..32].try_into().unwrap()),
            trade_amount,
        };
        
        debug!("Initial point: {}", initial_point);
        debug!("Final point: {}", final_point);
        debug!("Trade amount: {}", trade_amount);

        let reference_lsh = generate_lsh_bits(&current_state, salt)?.try_into().unwrap();

        let result = verify_and_check_distance(
            proof_a,
            proof_b,
            proof_c,
            input_signals,
            reference_lsh,
            LSH_THRESHOLD,
        )
            .map_err(|_| ErrorCode::InvalidProof)?;
        require!(result, ErrorCode::InvalidProof);

        Ok(())
    }
}