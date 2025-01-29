use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid input")]
    InvalidInput,
    #[msg("Invalid proof")]
    InvalidProof,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unable to create Groth16Verifier")]
    InvalidGroth16Verifier,
    #[msg("Invalid token order")]
    InvalidTokenOrder,
    #[msg("Invalid swap amount")]
    InvalidSwapAmount,
    #[msg("Invalid LP mint")]
    InvalidLpMint,
    #[msg("Invalid metadata account")]
    InvalidMetadataAccount,
    #[msg("LP mint already initialized")]
    LpMintAlreadyInitialized,
    #[msg("Invalid proof size")]
    InvalidProofSize,
    #[msg("Invalid number of public inputs")]
    InvalidInputSize,
    #[msg("Proof verification failed")]
    ProofVerificationFailed,
    #[msg("Invalid verifying key")]
    InvalidVerifyingKey,
    #[msg("Invalid LSH commitment")]
    InvalidLSHCommitment,
}
