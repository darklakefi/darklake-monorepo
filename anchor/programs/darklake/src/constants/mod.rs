pub mod verifying_key;

pub use verifying_key::VERIFYINGKEY;

// Constants for LSH verification
pub const NUM_PROJECTIONS: usize = 64;

pub const NUM_PUBLIC_INPUTS: usize = NUM_PROJECTIONS + 1; // lshBits + salt commitment

pub const PROOF_SIZE: usize = 192; // 3 curve points in compressed form

pub const VK_SIZE: usize = 896; // Size of serialized verifying key

pub const LSH_THRESHOLD: u32 = 1000;