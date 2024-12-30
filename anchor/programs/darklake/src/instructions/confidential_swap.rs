use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use groth16_solana::{self, groth16::Groth16Verifier};

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
/// dev: invariant is increased due to ceil_div
/// dev: because of ceil_div the destination_amount_swapped is rounded down
pub fn swap(
    source_amount: u128,
    swap_source_amount: u128,
    swap_destination_amount: u128,
) -> Option<SwapWithoutFeesResult> {
    let invariant = swap_source_amount.checked_mul(swap_destination_amount)?;

    let new_swap_source_amount = swap_source_amount.checked_add(source_amount)?;
    
    // round up with checked math
    let qoutient = invariant.checked_div(new_swap_source_amount)?;
    let remainder = invariant.checked_rem(new_swap_source_amount)?;

    let new_swap_destination_amount = qoutient.checked_add(if remainder > 0 { 1 } else { 0 })?;
    
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
/// newReserveX:    0
/// newReserveY:    1
/// amountReceived: 2
/// inputAmount:    3
/// isSwapXtoY:     4
/// reserveX:       5
/// reserveY:       6
///
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

        let reserve_x = u64::from_be_bytes(public_signals[5][24..].try_into().unwrap());
        let reserve_y = u64::from_be_bytes(public_signals[6][24..].try_into().unwrap());
        msg!(
            "Pool reserves X: {} | Y: {}",
            pool.reserve_x,
            pool.reserve_y
        );

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

        let input_amount = u64::from_be_bytes(public_signals[3][24..].try_into().unwrap());

        // Enough to check that it's not zero
        let is_swap_x_to_y: bool = public_signals[4] != [0u8; 32];
        msg!("Is X -> Y swap? - {}", is_swap_x_to_y);

        // Currently not re-checked since we check output amount
        // let new_balance_x = u64::from_be_bytes(public_signals[4][24..].try_into().unwrap());
        // let new_balance_y = u64::from_be_bytes(public_signals[5][24..].try_into().unwrap());
        let amount_received = u64::from_be_bytes(public_signals[2][24..].try_into().unwrap());

        // Calculate the output amount using the constant product formula
        let output_amount: SwapWithoutFeesResult = if is_swap_x_to_y {
            // Swap X to Y
            swap(
                input_amount as u128,
                pool.reserve_x as u128,
                pool.reserve_y as u128,
            )
            .ok_or(ErrorCode::MathOverflow)?
        } else {
            // Swap Y to X
            swap(
                input_amount as u128,
                pool.reserve_y as u128,
                pool.reserve_x as u128,
            )
            .ok_or(ErrorCode::MathOverflow)?
        };

        msg!(
            "Proof input: {} | pool input {}",
            input_amount,
            (output_amount.source_amount_swapped as u64)
        );


        msg!(
            "Proof output: {} | pool output: {}",
            amount_received,
            (output_amount.destination_amount_swapped as u64)
        );

        // Both sanity checks which should never happen if circuit and pool correctly implemented
        if (output_amount.source_amount_swapped as u64) != input_amount {
            return Err(ErrorCode::PoolInputAmountMismatch.into());
        }

        if (output_amount.destination_amount_swapped as u64) < amount_received {
            return Err(ErrorCode::PoolOutputAmountTooLow.into());
        }

        // Update pool reserves
        pool.reserve_x = if is_swap_x_to_y {
            pool.reserve_x
                .checked_add(output_amount.source_amount_swapped as u64)
                .unwrap()
        } else {
            pool.reserve_x
                .checked_sub(output_amount.destination_amount_swapped as u64)
                .unwrap()
        };

        pool.reserve_y = if is_swap_x_to_y {
            pool.reserve_y
                .checked_sub(output_amount.destination_amount_swapped as u64)
                .unwrap()
        } else {
            pool.reserve_y
                .checked_add(output_amount.source_amount_swapped as u64)
                .unwrap()
        };

        msg!(
            "Pool reserves after swap X: {} | Y: {}",
            pool.reserve_x,
            pool.reserve_y
        );

        let pool_mint_x_key = self.pool.token_mint_x.key();
        let pool_mint_y_key = self.pool.token_mint_y.key();

        let pool_seeds = &[
            &b"pool"[..], 
            pool_mint_x_key.as_ref(), 
            pool_mint_y_key.as_ref(),
            &[self.pool.bump],
        ];

        let signer_seeds = &[&pool_seeds[..]];


        // Transfer tokens
        if is_swap_x_to_y {
            msg!("Transferring user X to pool");
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

            msg!("Transferring pool Y to user");
            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_mint_y_program.to_account_info(),
                    TransferChecked {
                        from: self.pool_token_account_y.to_account_info(),
                        mint: self.token_mint_y.to_account_info(),
                        to: self.user_token_account_y.to_account_info(),
                        authority: self.pool.to_account_info(),
                    },
                    signer_seeds
                ),
                output_amount.destination_amount_swapped as u64,
                self.token_mint_y.decimals,
            )?;
        } else {
            msg!("Transferring user Y to pool");
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

            msg!("Transferring pool X to user");
            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_mint_x_program.to_account_info(),
                    TransferChecked {
                        from: self.pool_token_account_x.to_account_info(),
                        mint: self.token_mint_x.to_account_info(),
                        to: self.user_token_account_x.to_account_info(),
                        authority: self.pool.to_account_info(),
                    },
                    signer_seeds
                ),
                output_amount.destination_amount_swapped as u64,
                self.token_mint_x.decimals,
            )?;
        }

        Ok(())
    }
}
