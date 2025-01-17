#![allow(unused_imports)]
#![allow(dead_code)]

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use ark_ff::PrimeField;
use jf_plonk::{
    proof_system::{PlonkKzgSnark, UniversalSNARK},
    transcript::StandardTranscript,
};
use jf_relation::constraint_system::{Circuit, PlonkCircuit, Arithmetization};
use ark_bls12_381::{Bls12_381, Fr};
use rand_core::{RngCore, CryptoRng};
use rand_chacha::ChaCha8Rng;
use rand_chacha::rand_core::SeedableRng;
use ark_ec::pairing::Pairing;

use crate::state::Pool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ConfidentialSwap<'info> {
    // Account struct remains the same as your original implementation
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
impl<'info> ConfidentialSwap<'info> {
    pub fn confidential_swap(
        &mut self,
        _proof: Vec<u8>,
        _public_inputs: Vec<u8>,
    ) -> Result<()> {
        if self.token_mint_x.key() >= self.token_mint_y.key() {
            return Err(ErrorCode::InvalidTokenOrder.into());
        }
        require!(false, ErrorCode::NotImplemented);
        Ok(())
    }
}

fn build_amm_circuit(
    slippage: u64,
    reserve_x: u64,
    reserve_y: u64,
    amount: u64,
) -> Result<PlonkCircuit<Fr>> {
    let mut circuit = PlonkCircuit::new_turbo_plonk();
    
    // Use Fr::from explicitly
    let slippage_var = circuit.create_variable(Fr::from(slippage))
        .map_err(|_| ErrorCode::InvalidProof)?;
    
    let reserve_x_var = circuit.create_public_variable(Fr::from(reserve_x))
        .map_err(|_| ErrorCode::InvalidProof)?;
    let reserve_y_var = circuit.create_public_variable(Fr::from(reserve_y))
        .map_err(|_| ErrorCode::InvalidProof)?;
    let amount_var = circuit.create_public_variable(Fr::from(amount))
        .map_err(|_| ErrorCode::InvalidProof)?;

    // Calculate k = x * y (constant product)
    let k = circuit.mul(reserve_x_var, reserve_y_var).map_err(|_| ErrorCode::InvalidProof)?;

    // Calculate new_reserve_x = reserve_x + amount
    let new_reserve_x = circuit.add(reserve_x_var, amount_var).map_err(|_| ErrorCode::InvalidProof)?;
    
    // For division operations, we need to create witness variables for the results
    let new_reserve_y = circuit.create_variable(Fr::from(reserve_y)).map_err(|_| ErrorCode::InvalidProof)?;
    
    // Calculate new_reserve_x * new_reserve_y
    let product = circuit.mul(new_reserve_x, new_reserve_y).map_err(|_| ErrorCode::InvalidProof)?;
    
    // Enforce k = new_reserve_x * new_reserve_y
    circuit.enforce_equal(k, product).map_err(|_| ErrorCode::InvalidProof)?;

    // Create witness variables for prices
    let price_before = circuit.create_variable(Fr::from(reserve_y / reserve_x)).map_err(|_| ErrorCode::InvalidProof)?;
    let price_after = circuit.create_variable(Fr::from(reserve_y / (reserve_x + amount))).map_err(|_| ErrorCode::InvalidProof)?;

    // Calculate price difference
    let price_diff = circuit.sub(price_before, price_after).map_err(|_| ErrorCode::InvalidProof)?;

    // Enforce price impact is within slippage
    circuit.enforce_leq(price_diff, slippage_var).map_err(|_| ErrorCode::InvalidProof)?;

    circuit.finalize_for_arithmetization().map_err(|_| ErrorCode::InvalidProof)?;
    Ok(circuit)
}

#[allow(clippy::all)]
#[allow(unused_variables)]
#[test]
fn test_amm_plonk() -> Result<()> {
    let mut rng = ChaCha8Rng::from_seed([0; 32]);
    
    // Test parameters
    let initial_reserve_x = 1_000_000u64;
    let initial_reserve_y = 1_000_000u64;
    let amount_in = 10_000u64;
    let slippage = 100u64;

    // Create circuit using E::ScalarField directly
    let mut circuit: PlonkCircuit<<Bls12_381 as ark_ec::pairing::Pairing>::ScalarField> = 
        PlonkCircuit::new_turbo_plonk();
    
    // Create variables using the scalar field
    let slippage_var = circuit.create_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(slippage)
    ).map_err(|_| ErrorCode::InvalidProof)?;
    
    let reserve_x_var = circuit.create_public_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(initial_reserve_x)
    ).map_err(|_| ErrorCode::InvalidProof)?;
    
    let reserve_y_var = circuit.create_public_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(initial_reserve_y)
    ).map_err(|_| ErrorCode::InvalidProof)?;
    
    let amount_var = circuit.create_public_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(amount_in)
    ).map_err(|_| ErrorCode::InvalidProof)?;

    // Calculate k = x * y (constant product)
    let k = circuit.mul(reserve_x_var, reserve_y_var).map_err(|_| ErrorCode::InvalidProof)?;

    // Calculate new_reserve_x = reserve_x + amount
    let new_reserve_x = circuit.add(reserve_x_var, amount_var).map_err(|_| ErrorCode::InvalidProof)?;
    
    // For division operations, we need to create witness variables for the results
    let new_reserve_y = circuit.create_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(initial_reserve_y)
    ).map_err(|_| ErrorCode::InvalidProof)?;
    
    // Calculate new_reserve_x * new_reserve_y
    let product = circuit.mul(new_reserve_x, new_reserve_y).map_err(|_| ErrorCode::InvalidProof)?;
    
    // Enforce k = new_reserve_x * new_reserve_y
    circuit.enforce_equal(k, product).map_err(|_| ErrorCode::InvalidProof)?;

    // Create witness variables for prices
    let price_before = circuit.create_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(initial_reserve_y / initial_reserve_x)
    ).map_err(|_| ErrorCode::InvalidProof)?;
    let price_after = circuit.create_variable(
        <Bls12_381 as ark_ec::pairing::Pairing>::ScalarField::from(initial_reserve_y / (initial_reserve_x + amount_in))
    ).map_err(|_| ErrorCode::InvalidProof)?;

    // Calculate price difference
    let price_diff = circuit.sub(price_before, price_after).map_err(|_| ErrorCode::InvalidProof)?;

    // Enforce price impact is within slippage
    circuit.enforce_leq(price_diff, slippage_var).map_err(|_| ErrorCode::InvalidProof)?;

    circuit.finalize_for_arithmetization().map_err(|_| ErrorCode::InvalidProof)?;

    let srs_size = circuit.srs_size().map_err(|_| ErrorCode::InvalidProof)?;
    let srs = PlonkKzgSnark::<Bls12_381>::universal_setup(srs_size, &mut rng)
        .map_err(|_| ErrorCode::InvalidProof)?;

    let (pk, vk) = PlonkKzgSnark::<Bls12_381>::preprocess(&srs, &circuit)
        .map_err(|_| ErrorCode::InvalidProof)?;

    let proof = PlonkKzgSnark::<Bls12_381>::prove::<_, _, StandardTranscript>(
        &mut rng,
        &circuit,
        &pk,
        None,
    ).map_err(|_| ErrorCode::InvalidProof)?;

    let public_inputs = circuit.public_input().map_err(|_| ErrorCode::InvalidProof)?;

    let verified = PlonkKzgSnark::<Bls12_381>::verify::<StandardTranscript>(
        &vk,
        &public_inputs,
        &proof,
        None,
    ).map_err(|_| ErrorCode::InvalidProof)?;

    Ok(())
}