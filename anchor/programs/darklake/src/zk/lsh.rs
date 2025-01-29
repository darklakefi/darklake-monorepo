use anchor_lang::prelude::*;

use ark_ff::{BigInteger, PrimeField};
use ark_bn254::Fr as Fp;  // Same field as Circom
use std::convert::TryInto;

use crate::zk::poseidon::poseidon_hash;

/// Constants matching our Circom circuit
const NUM_DIMENSIONS: usize = 3;
const NUM_PROJECTIONS: usize = 64;
const SCALE: u64 = 1_000_000_000;  // 10^9 for 9 decimal places
const SIGN_BIT: u32 = 63;  // For 64-bit values

/// Represents the pool state
#[derive(Clone, Debug)]
pub struct PoolState {
    pub x: u64,
    pub y: u64,
    pub trade_output: u64,
}

/// Generate random vector using Poseidon (matches SafeRandomVector in Circom)
fn generate_random_vector(salt: [u8; 32], index: u64, dim: usize) -> Vec<i64> {
    // Convert salt bytes to field element properly
    let salt_fp = Fp::from_le_bytes_mod_order(&salt);

    let mut result = Vec::with_capacity(dim);
    
    for i in 0..dim {
        // Match Circom's Poseidon(salt, index, i)
        let hash = poseidon_hash(&[
            salt_fp,  // Use the converted field element
            Fp::from(index),
            Fp::from(i as u64),
        ]);
        
        // Convert hash to integer and mod to get [-2^62, 2^62-1] range
        let hash_bits = hash.into_bigint().to_bytes_le();
        let hash_int = i64::from_le_bytes(hash_bits[0..8].try_into().unwrap());
        let mod_val = hash_int % (1 << 62);
        
        // Map to proper range and scale
        let scaled = (mod_val - (1 << 61)) * (SCALE as i64);
        result.push(scaled);
    }
    
    result
}

/// Safe multiply with range check (matches SafeMultiply in Circom)
fn safe_multiply(a: i64, b: i64) -> Option<i64> {
    // Check if multiplication would overflow
    let product = a.checked_mul(b)?;
    
    // Ensure result is within 128-bit range
    if product > i128::MAX as i64 || product < i128::MIN as i64 {
        return None;
    }
    
    Some(product)
}

/// Compute dot product (matches SafeFixedPointDotProduct in Circom)
fn compute_dot_product(a: &[i64], b: &[i64]) -> Option<i64> {
    let mut sum: i128 = 0;
    
    for i in 0..a.len() {
        let product = safe_multiply(a[i], b[i])?;
        sum = sum.checked_add(product as i128)?;
    }
    
    // Scale down by SCALE factor
    let result = sum / (SCALE as i128);
    
    // Ensure result fits in i64
    if result > i64::MAX as i128 || result < i64::MIN as i128 {
        return None;
    }
    
    Some(result as i64)
}

/// Extract sign bit (matches SignExtract in Circom)
fn extract_sign(value: i64) -> bool {
    value >= 0  // 1 for non-negative, 0 for negative
}

/// Generate LSH bits (matches our LSHGadget circuit)
pub fn generate_lsh_bits(
    state: &PoolState,
    salt: [u8; 32],
) -> Result<Vec<bool>> {
    let mut lsh_bits = Vec::with_capacity(NUM_PROJECTIONS);
    
    // Scale inputs to match circuit
    let input_vec = vec![
        state.x as i64,
        state.y as i64,
        state.trade_output as i64,
    ];
    
    // Generate random projections and compute LSH bits
    for i in 0..NUM_PROJECTIONS {
        let random_vec = generate_random_vector(salt, i as u64, NUM_DIMENSIONS);
        let dot_product = compute_dot_product(&input_vec, &random_vec).unwrap();
        lsh_bits.push(extract_sign(dot_product));
    }
    
    Ok(lsh_bits)
}

/// Compute Hamming distance between LSH bits (matches LSHDistance in Circom)
pub fn compute_hamming_distance(bits1: &[bool], bits2: &[bool]) -> u32 {
    bits1.iter()
        .zip(bits2.iter())
        .map(|(a, b)| (*a != *b) as u32)
        .sum()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_lsh_generation() {
        let state = PoolState {
            x: 1000 * SCALE,
            y: 500 * SCALE,
            trade_output: 100 * SCALE,
        };
        
        let salt = [42u8; 32];  // Use byte array for salt
        let lsh_bits = generate_lsh_bits(&state, salt).unwrap();
        
        // Should generate NUM_PROJECTIONS bits
        assert_eq!(lsh_bits.len(), NUM_PROJECTIONS);
        
        // Generate for slightly different state
        let state2 = PoolState {
            x: 1001 * SCALE,
            y: 500 * SCALE,
            trade_output: 100 * SCALE,
        };
        
        let lsh_bits2 = generate_lsh_bits(&state2, salt).unwrap();
        
        // Hamming distance should be small for similar states
        let distance = compute_hamming_distance(&lsh_bits, &lsh_bits2);
        assert!(distance < NUM_PROJECTIONS as u32 / 4);  // Should be relatively close
    }
}