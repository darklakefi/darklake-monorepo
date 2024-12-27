use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use groth16_solana::{self, groth16::Groth16Verifier};
use spl_math::checked_ceil_div::CheckedCeilDiv;

use crate::constants::VERIFYINGKEY;
use crate::errors::ErrorCode;
use crate::state::Pool;

#[derive(Accounts)]
pub struct ConfidentialSwap<'info> {
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

// Helpers for swapping from solana token-swap

#[derive(Debug)]
pub struct SwapWithoutFeesResult {
    /// Amount of source token swapped
    pub source_amount_swapped: u128,
    /// Amount of destination token swapped
    pub destination_amount_swapped: u128,
}

pub fn map_zero_to_none(x: u128) -> Option<u128> {
    if x == 0 {
        None
    } else {
        Some(x)
    }
}

/// This is guaranteed to work for all values such that:
///  - 1 <= swap_source_amount * swap_destination_amount <= u128::MAX
///  - 1 <= source_amount <= u64::MAX
pub fn swap(
    source_amount: u128,
    swap_source_amount: u128,
    swap_destination_amount: u128,
) -> Option<SwapWithoutFeesResult> {
    let invariant = swap_source_amount.checked_mul(swap_destination_amount)?;

    let new_swap_source_amount = swap_source_amount.checked_add(source_amount)?;
    let (new_swap_destination_amount, new_swap_source_amount) =
        invariant.checked_ceil_div(new_swap_source_amount)?;

    let source_amount_swapped = new_swap_source_amount.checked_sub(swap_source_amount)?;
    let destination_amount_swapped =
        map_zero_to_none(swap_destination_amount.checked_sub(new_swap_destination_amount)?)?;

    Some(SwapWithoutFeesResult {
        source_amount_swapped,
        destination_amount_swapped,
    })
}

/// ---Public signals---
///
/// inputAmount
/// isSwapXtoY
/// currentReserveX
/// currentReserveY
/// newBalanceX
/// newBalanceY
/// amountReceived
impl<'info> ConfidentialSwap<'info> {
    pub fn confidential_swap(
        &mut self,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        public_signals: [[u8; 32]; 7],
    ) -> Result<()> {
        // Check at the beginning of the function
        if self.token_mint_x.key() >= self.token_mint_y.key() {
            return Err(ErrorCode::InvalidTokenOrder.into());
        }

        let pool = &mut self.pool;
        msg!(
            "Pool reserves X: {} | Y: {}",
            pool.reserve_x,
            pool.reserve_y
        );

        let reserve_x = u64::from_be_bytes(public_signals[2][24..].try_into().unwrap());
        let reserve_y = u64::from_be_bytes(public_signals[3][24..].try_into().unwrap());

        msg!("Proof pool reserves X: {} | Y: {}", reserve_x, reserve_y);

        if pool.reserve_x != reserve_x || pool.reserve_y != reserve_y {
            return Err(ErrorCode::PublicSignalAndPoolReserveMismatch.into());
        }

        // Create a new Groth16Verifier instance
        let mut verifier_result =
            Groth16Verifier::new(&proof_a, &proof_b, &proof_c, &public_signals, &VERIFYINGKEY)
                .map_err(|_| ErrorCode::InvalidGroth16Verifier)?;

        // Verify the proof
        let verified = verifier_result
            .verify()
            .map_err(|_| ErrorCode::InvalidProof)?;

        if !verified {
            return Err(ErrorCode::InvalidProof.into());
        }

        let input_amount = u64::from_be_bytes(public_signals[0][1..].try_into().unwrap());
        let is_swap_x_to_y: bool =
            u64::from_be_bytes(public_signals[1][1..].try_into().unwrap()) > 0;
        
        // Currently not re-checked since we check output amount
        // let new_balance_x = u64::from_be_bytes(public_signals[4][24..].try_into().unwrap());
        // let new_balance_y = u64::from_be_bytes(public_signals[5][24..].try_into().unwrap());
        let amount_received = u64::from_be_bytes(public_signals[6][24..].try_into().unwrap());

        // Calculate the output amount using the constant product formula
        let output_amount :SwapWithoutFeesResult = if is_swap_x_to_y {
            // Swap X to Y
            swap(input_amount as u128, pool.reserve_x as u128, pool.reserve_y as u128)
                .ok_or(ErrorCode::MathOverflow)?
        } else {
            // Swap Y to X
            swap(input_amount as u128, pool.reserve_y as u128, pool.reserve_x as u128)
                .ok_or(ErrorCode::MathOverflow)?
        };

        // Sanity check which should be true if the circuit is correct
        if (output_amount.destination_amount_swapped as u64) < amount_received {
            return Err(ErrorCode::PoolAmountOutputTooLow.into());
        }

        // Update pool reserves
        let new_balance_x = if is_swap_x_to_y {
            pool.reserve_x.checked_add(output_amount.source_amount_swapped as u64).unwrap()
        } else {
            pool.reserve_x.checked_sub(output_amount.destination_amount_swapped as u64).unwrap()
        };

        let new_balance_y = if is_swap_x_to_y {
            pool.reserve_y.checked_sub(output_amount.destination_amount_swapped as u64).unwrap()
        } else {
            pool.reserve_y.checked_add(output_amount.source_amount_swapped as u64).unwrap()
        };

        pool.reserve_x = new_balance_x;
        pool.reserve_y = new_balance_y;


        // Transfer tokens
        if is_swap_x_to_y {
            transfer_checked(
                CpiContext::new(
                    self.token_mint_x_program.to_account_info(),
                    TransferChecked {
                        from: self.user_token_account_x.to_account_info(),
                        mint: self.token_mint_x.to_account_info(),
                        to: self.pool_token_account_x.to_account_info(),
                        authority: self.user.to_account_info(),
                    },
                ),
                output_amount.source_amount_swapped as u64,
                self.token_mint_x.decimals,
            )?;

            transfer_checked(
                CpiContext::new(
                    self.token_mint_y_program.to_account_info(),
                    TransferChecked {
                        from: self.pool_token_account_y.to_account_info(),
                        mint: self.token_mint_y.to_account_info(),
                        to: self.user_token_account_y.to_account_info(),
                        authority: pool.to_account_info(),
                    },
                ),
                output_amount.destination_amount_swapped as u64,
                self.token_mint_y.decimals,
            )?;
        } else {
            transfer_checked(
                CpiContext::new(
                    self.token_mint_y_program.to_account_info(),
                    TransferChecked {
                        from: self.user_token_account_y.to_account_info(),
                        mint: self.token_mint_y.to_account_info(),
                        to: self.pool_token_account_y.to_account_info(),
                        authority: self.user.to_account_info(),
                    },
                ),
                output_amount.source_amount_swapped as u64,
                self.token_mint_y.decimals,
            )?;

            transfer_checked(
                CpiContext::new(
                    self.token_mint_x_program.to_account_info(),
                    TransferChecked {
                        from: self.pool_token_account_x.to_account_info(),
                        mint: self.token_mint_x.to_account_info(),
                        to: self.user_token_account_x.to_account_info(),
                        authority: pool.to_account_info(),
                    },
                ),
                output_amount.destination_amount_swapped as u64,
                self.token_mint_x.decimals,
            )?;
        }

        Ok(())
    }
}
