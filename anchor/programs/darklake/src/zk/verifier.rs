use std::error::Error;

#[derive(Debug)]
pub struct PoolState {
    pub x: u64,
    pub y: u64,
    pub k: u64,
}

#[derive(Debug)]
pub struct ProofOutput {
    pub initial_point: u128,
    pub final_point: u128,
    pub commitment1: u64,
    pub commitment2: u64,
}

pub fn verify_transform(
    real_state: &PoolState,
    proof: &ProofOutput,
) -> Result<bool, Box<dyn Error>> {
    // Extract points from proof outputs - fix overflow by using u128
    let initial_point = proof.initial_point;
    let final_point = proof.final_point;
    
    let proof_x1 = (initial_point >> 64) as u64;
    let proof_y1 = (initial_point & 0xFFFFFFFFFFFFFFFF) as u64;
    let proof_y2 = (final_point & 0xFFFFFFFFFFFFFFFF) as u64;

    // Calculate transformation scalar
    let alpha = ((real_state.k as f64) / (proof_x1 * proof_y1) as f64).sqrt();

    // Transform points
    let transformed_x1 = (alpha * proof_x1 as f64) as u64;
    let transformed_y1 = (proof_y1 as f64 / alpha) as u64;
    let transformed_y2 = (proof_y2 as f64 / alpha) as u64;

    // Verify transformed points lie on real curve
    if transformed_x1 * transformed_y1 != real_state.k {
        return Ok(false);
    }

    // Verify transformed output maintains same ratio as committed
    let transformed_output = transformed_y2 - transformed_y1;
    
    // The ratio encoded in commitment2 should be preserved under transformation
    let output_ratio = transformed_output as f64 * alpha;
    
    // Compare with committed ratio (encoded in commitment2)
    if (output_ratio - proof.commitment2 as f64).abs() > 0.00001 {
        return Ok(false);
    }

    Ok(true)
}
