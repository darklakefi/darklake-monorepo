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
    #[msg("Math underflow")]
    MathUnderflow,
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
    #[msg("Pool reserve and public signals mismatch")]
    PublicSignalAndPoolReserveMismatch,
    #[msg("Proof amount received exceeds pool output")]
    PoolAmountOutputTooLow,
    #[msg("Unable to parse public signals")]
    InvalidPublicSignals,
    #[msg("LP mint already initialized")]
    LpMintAlreadyInitialized,
}
