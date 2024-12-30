use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{
    mint_to as spl_mint_to, Mint as SplMint, MintTo as SplMintTo, Token as SplToken,
};
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use num::integer::Roots; 

use crate::errors::ErrorCode;
use crate::events::LiquidityAdded;
use crate::state::Pool;

const MIN_LIQUIDITY: u64 = 1000;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    pub token_mint_x: Box<InterfaceAccount<'info, Mint>>,
    pub token_mint_y: Box<InterfaceAccount<'info, Mint>>,
    pub token_mint_x_program: Interface<'info, TokenInterface>,
    pub token_mint_y_program: Interface<'info, TokenInterface>,
    #[account(
        mut,
        seeds = [b"lp", token_mint_x.key().as_ref(), token_mint_y.key().as_ref()],
        bump
    )]
    pub token_mint_lp: Account<'info, SplMint>,
    pub token_mint_lp_program: Program<'info, SplToken>,
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
    pub user_token_account_x: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut,
        associated_token::mint = token_mint_y,
        associated_token::authority = user, 
        associated_token::token_program = token_mint_y_program.key(),
    )]
    pub user_token_account_y: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        associated_token::mint = token_mint_lp,
        associated_token::authority = user,
        associated_token::token_program = token_mint_lp_program,
        payer = user
    )]
    pub user_token_account_lp: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut,
        associated_token::mint = token_mint_x,
        associated_token::authority = pool,
        associated_token::token_program = token_mint_x_program.key(),
    )]
    pub pool_token_account_x: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut,
        associated_token::mint = token_mint_y,
        associated_token::authority = pool,
        associated_token::token_program = token_mint_y_program.key(),
    )]
    pub pool_token_account_y: Box<InterfaceAccount<'info, TokenAccount>>,
    // burner account for LPs owned by system 
    #[account(
        init_if_needed,
        associated_token::mint = token_mint_lp,
        associated_token::authority = system_program,
        associated_token::token_program = token_mint_lp_program,
        payer = user
    )]
    pub zero_token_account_lp: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> AddLiquidity<'info> {
    pub fn add_liquidity(&mut self, amount_x: u64, amount_y: u64) -> Result<()> {
        // Add this check at the beginning of the function
        if self.token_mint_x.key() >= self.token_mint_y.key() {
            return Err(ErrorCode::InvalidTokenOrder.into());
        }

        let pool = &mut self.pool;

        let lp_token_supply = self.token_mint_lp.supply;
        msg!("LP Token Supply: {}", lp_token_supply);

        // Calculate the liquidity to be added
        let liquidity = if pool.reserve_x == 0 && pool.reserve_y == 0 {
            (amount_x as u128).checked_mul(amount_y as u128).unwrap().sqrt()
                .checked_sub(MIN_LIQUIDITY as u128).ok_or(ErrorCode::LiquidityTooLow)? as u64
        } else {
            // only allow to add same ratio as the pool
            let liquidity_x = (amount_x as u128)
                .checked_mul(lp_token_supply as u128)
                .and_then(|x| x.checked_div(pool.reserve_x as u128))
                .ok_or(ErrorCode::MathOverflow)? as u64;

            let liquidity_y = (amount_y as u128)
                .checked_mul(lp_token_supply as u128)
                .and_then(|y| y.checked_div(pool.reserve_y as u128))
                .ok_or(ErrorCode::MathOverflow)? as u64;

            liquidity_x.min(liquidity_y)
        };

        if liquidity == 0 {
            return Err(ErrorCode::LiquidityTooLow.into());
        }

        msg!("Estimated liquidity: {}", liquidity);

        // Update pool reserves
        pool.reserve_x = pool.reserve_x.checked_add(amount_x).unwrap();
        pool.reserve_y = pool.reserve_y.checked_add(amount_y).unwrap();

        // Transfer tokens from user to pool
        transfer_checked(
            CpiContext::new(
                self.token_mint_x_program.to_account_info(),
                TransferChecked {
                    from: self.user_token_account_x.to_account_info(),
                    to: self.pool_token_account_x.to_account_info(),
                    authority: self.user.to_account_info(),
                    mint: self.token_mint_x.to_account_info(),
                },
            ),
            amount_x,
            self.token_mint_x.decimals,
        )?;

        transfer_checked(
            CpiContext::new(
                self.token_mint_y_program.to_account_info(),
                TransferChecked {
                    from: self.user_token_account_y.to_account_info(),
                    to: self.pool_token_account_y.to_account_info(),
                    authority: self.user.to_account_info(),
                    mint: self.token_mint_y.to_account_info(),
                },
            ),
            amount_y,
            self.token_mint_y.decimals,
        )?;

        let token_mint_x_key = self.token_mint_x.key();
        let token_mint_y_key = self.token_mint_y.key();

        let pool_signer_seeds = &[
            b"pool",
            token_mint_x_key.as_ref(),
            token_mint_y_key.as_ref(),
            &[pool.bump],
        ];

        msg!("Minting LP tokens");
        msg!("Mint: {}", self.token_mint_lp.key().to_string());
        msg!("To: {}", self.user_token_account_lp.key().to_string());
        msg!("Authority: {}", self.pool.key().to_string());

        // If first liquidity added, mint minimum liquidity
        if lp_token_supply == 0 {
            spl_mint_to(
                CpiContext::new_with_signer(
                    self.token_mint_lp_program.to_account_info(),
                    SplMintTo {
                        mint: self.token_mint_lp.to_account_info(),
                        to: self.zero_token_account_lp.to_account_info(),
                        authority: self.pool.to_account_info(),
                    },
                    &[&pool_signer_seeds[..]],
                ),
                MIN_LIQUIDITY,
            )?;
        }

        spl_mint_to(
            CpiContext::new_with_signer(
                self.token_mint_lp_program.to_account_info(),
                SplMintTo {
                    mint: self.token_mint_lp.to_account_info(),
                    to: self.user_token_account_lp.to_account_info(),
                    authority: self.pool.to_account_info(),
                },
                &[&pool_signer_seeds[..]],
            ),
            liquidity,
        )?;

        self.pool.liquidity = self.pool.liquidity.checked_add(liquidity.into()).unwrap();

        emit!(LiquidityAdded {
            user: self.user.key(),
            amount_x,
            amount_y,
            liquidity,
        });

        Ok(())
    }
}
