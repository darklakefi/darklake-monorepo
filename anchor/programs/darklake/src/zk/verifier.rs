use anchor_lang::prelude::*;
use groth16_solana::groth16::Groth16Verifier;

use crate::constants::*;
use crate::errors::ErrorCode;

#[derive(Debug)]
pub struct ProofOutput {
    pub k_ratio_commitment: u32,
    pub trade_amount: u64,
}

pub fn verify_lsh_proof(
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
    public_inputs: [[u8; 32]; VERIFYINGKEY.nr_pubinputs],
) -> Result<()> {
    // Extract salt commitment
    let salt_commitment: [u8; 32] = public_inputs[NUM_PROJECTIONS]
        .try_into()
        .map_err(|_| ErrorCode::InvalidLSHCommitment)?;

    // Verify the proof
    let mut verification_result = Groth16Verifier::new(
        &proof_a,
        &proof_b,
        &proof_c,
        &public_inputs,
        &VERIFYINGKEY,
    ).map_err(|_| ErrorCode::InvalidGroth16Verifier)?.verify().map_err(|_| ErrorCode::ProofVerificationFailed)?;

    require!(
        verification_result,
        ErrorCode::ProofVerificationFailed
    );

    Ok(())
}

/// Helper function to check if LSH distance is within threshold
pub fn check_lsh_distance(
    lsh_bits1: &[bool; NUM_PROJECTIONS],
    lsh_bits2: &[bool; NUM_PROJECTIONS],
    threshold: u32,
) -> Result<bool> {
    let mut distance = 0;
    
    // Compute Hamming distance
    for i in 0..NUM_PROJECTIONS {
        if lsh_bits1[i] != lsh_bits2[i] {
            distance += 1;
        }
    }
    
    Ok(distance <= threshold)
}

// Example instruction handler that combines verification and distance check
pub fn verify_and_check_distance(
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
    public_inputs: [[u8; 32]; VERIFYINGKEY.nr_pubinputs],
    reference_lsh: [bool; NUM_PROJECTIONS],
    threshold: u32,
) -> Result<bool> {
    // First verify the proof
    verify_lsh_proof(
        proof_a,
        proof_b,
        proof_c,
        public_inputs,
    )?;
    
    // Then check distance against reference LSH
    check_lsh_distance(&reference_lsh, &reference_lsh, threshold)
}