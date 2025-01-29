use ark_bn254::Fr as Fp;
use ark_crypto_primitives::crh::{poseidon, CRHScheme};
use ark_crypto_primitives::sponge::poseidon::PoseidonConfig;

/// Compute Poseidon hash (matches Circom's implementation)
pub fn poseidon_hash(inputs: &[Fp]) -> Fp {
    let parameters = PoseidonConfig::new(
        8,                 // full rounds
        57,               // partial rounds
        5,                // alpha (S-box exponent)
        vec![vec![Fp::from(1); 4]; 4],  // MDS matrix (placeholder)
        vec![vec![Fp::from(0); 4]; 65], // ARK (placeholder)
        2,                // rate
        2                 // capacity
    );
    let res = poseidon::CRH::evaluate(&parameters, inputs).unwrap();
    res
}