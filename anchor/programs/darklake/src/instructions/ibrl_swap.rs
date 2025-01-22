use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use groth16_solana::groth16::Groth16Verifier;

use crate::debug;
use crate::state::Pool;
use crate::errors::ErrorCode;
use crate::constants::IBRL_VERIFYINGKEY;
use crate::zk::*;

#[derive(Accounts)]
pub struct IbrlSwap<'info> {
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

impl<'info> IbrlSwap<'info> {
    pub fn ibrl_swap(
        &self,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        output_signals: [[u8; 32]; 3],
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
            &output_signals,
            &IBRL_VERIFYINGKEY,
        ).map_err(|_| ErrorCode::InvalidGroth16Verifier)?;

        // Verify the proof
        let verified = verifier_result.verify().map_err(|_| ErrorCode::InvalidProof)?;
        require!(verified, ErrorCode::InvalidProof);

        debug!("Proof verified, trying transform");
        
        // Extract the circuit outputs correctly
        let initial_point = u128::from_be_bytes(output_signals[0][16..].try_into().unwrap());
        let final_point = u128::from_be_bytes(output_signals[1][16..].try_into().unwrap());
        let commitment2 = u64::from_be_bytes(output_signals[2][24..].try_into().unwrap());
        
        let current_state = PoolState {
            x: self.pool.reserve_x,
            y: self.pool.reserve_y,
            k: self.pool.reserve_x * self.pool.reserve_y,
        };

        // Extract initial x, y from initial_point
        let initial_x = (initial_point >> 64) as u64;
        let initial_y = (initial_point & ((1u128 << 64) - 1)) as u64;
        
        let initial_state = PoolState {
            x: initial_x,
            y: initial_y,
            k: initial_x * initial_y,
        };
        
        let proof_output = ProofOutput {
            k_ratio_commitment: commitment2 as u32,
            trade_amount: initial_point as u64,
        };
        
        debug!("Initial point: {}", initial_point);
        debug!("Final point: {}", final_point);
        debug!("Commitment2: {}", commitment2);

        let result = verify_transform(&current_state, &initial_state, &proof_output)
            .map_err(|_| ErrorCode::InvalidProof)?;
        require!(result, ErrorCode::InvalidProof);

        Ok(())
    }
}