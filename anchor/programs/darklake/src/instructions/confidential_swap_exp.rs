use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked};
use anchor_spl::associated_token::AssociatedToken;
use groth16_solana::{self, groth16::Groth16Verifier};

use crate::state::Pool;
use crate::errors::ErrorCode;
use crate::constants::VERIFYINGKEYEXP;

#[derive(Accounts)]
pub struct ConfidentialSwapExp<'info> {
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

impl<'info> ConfidentialSwapExp<'info> {
    pub fn confidential_swap_exp(
        &mut self,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        public_signals: [[u8; 32]; 4],
    ) -> Result<()> {
        // Check at the beginning of the function
        if self.token_mint_x.key() >= self.token_mint_y.key() {
            return Err(ErrorCode::InvalidTokenOrder.into());
        }

        let pool = &mut self.pool;
        msg!("ACTUAL pool reserves X: {} | Y: {}", pool.reserve_x, pool.reserve_y);

        msg!("Confidential swap EXP started");
        msg!("Original Public signal 2: {:?}", public_signals[2]);
        msg!("Original Public signal 3: {:?}", public_signals[3]);

        // Test overriding values
        let mut current_reserve_x: u64 = pool.reserve_x + 1;
        let mut current_reserve_x_bytes = current_reserve_x.to_be_bytes();
        let mut current_reserve_x_fixed_bytes: [u8; 32] = [0; 32];
        current_reserve_x_fixed_bytes[24..].copy_from_slice(&current_reserve_x_bytes);

        let mut current_reserve_y: u64 = pool.reserve_y + 1;
        let mut current_reserve_y_bytes = current_reserve_y.to_be_bytes();
        let mut current_reserve_y_fixed_bytes: [u8; 32] = [0; 32];
        current_reserve_y_fixed_bytes[24..].copy_from_slice(&current_reserve_y_bytes);

        let mut public_signals = public_signals;
        public_signals[2] = current_reserve_x_fixed_bytes;
        public_signals[3] = current_reserve_y_fixed_bytes;

        msg!("Final overridden");
        msg!("Public signal 2: {:?}", public_signals[2]);
        msg!("Public signal 3: {:?}", public_signals[3]);
        // Create a new Groth16Verifier instance
        let mut verifier_result = Groth16Verifier::new(
            &proof_a,
            &proof_b,
            &proof_c,
            &public_signals,
            &VERIFYINGKEYEXP,
        ).map_err(|_| ErrorCode::InvalidGroth16Verifier)?;

        // Verify the proof
        let verified = verifier_result.verify().map_err(|_| ErrorCode::InvalidProof)?;

        if verified {
            msg!("VERY OKAY");
            Ok(())
        } else {
            msg!("NOT OKAY");
            
            Err(ErrorCode::InvalidProof.into())
        }
    }
}

