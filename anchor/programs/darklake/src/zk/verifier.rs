#[allow(unused_imports)]
use std::error::Error;
use poseidon_rs::Poseidon;
use poseidon_rs::{Fr, FrRepr};
use ff::*;
use ff_ce::*;

use std::error::Error;

const FIXED_POINT_FACTOR: u128 = 1 << 64;

#[derive(Debug)]
pub struct PoolState {
    pub x: u64,
    pub y: u64,
    pub k: u64,
}

#[derive(Debug)]
pub struct ProofOutput {
    pub k_ratio_commitment: u32,
    pub trade_amount: u64,
}

pub fn verify_transform(
    current_state: &PoolState,
    initial_state: &PoolState,
    proof: &ProofOutput,
) -> Result<bool, Box<dyn Error>> {
    // Calculate transformation scalar
    let alpha = (current_state.k as f64 / initial_state.k as f64).sqrt();
    
    // Transform trade amount
    let transformed_trade = (proof.trade_amount as f64 * alpha) as u64;
    
    // Calculate new position after transformed trade
    let new_x = current_state.x + transformed_trade;
    let new_y = current_state.k / new_x;
    let output_amount = current_state.y - new_y;

    // Calculate actual k ratio in current state
    let actual_k_ratio = (output_amount as u128 * FIXED_POINT_FACTOR) / current_state.k as u128;

    // Generate commitment for actual ratio
    let actual_commitment = poseidon_hash(actual_k_ratio as u64);

    // The committed minimum ratio should still be valid
    // If actual_k_ratio ≥ min_k_ratio in initial state
    // Then it should still be ≥ in current state due to k-relative scaling
    if actual_commitment < proof.k_ratio_commitment {
        return Ok(false);
    }

    Ok(true)
}

fn poseidon_hash(input: u64) -> Fr {
    let poseidon = Poseidon::new();
    // Create FrRepr with input in the lowest 64 bits
    let repr = FrRepr([input, 0, 0, 0]);
    let input_fr = Fr::from_raw_repr(repr).unwrap();
    poseidon.hash(vec![input_fr]).unwrap()
}