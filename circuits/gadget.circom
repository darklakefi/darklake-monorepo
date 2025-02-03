pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "division.circom";

/*
 * Configuration Constants
 * - Using 64-bit integers for main values
 * - Supporting up to 128-bit intermediates for products
 * - Fixed-point scaling with 9 decimals (typical for Solana tokens)
 */
function NUM_DIMENSIONS() { return 3; }
function NUM_PROJECTIONS() { return 64; }
function MAIN_BITS() { return 64; }  // Main values use 64 bits
function DOUBLE_BITS() { return 128; }  // Products/sums may need 128 bits
function DECIMAL_PLACES() { return 9; }  // Number of decimal places for fixed-point
function SCALE() { return 1000000000; }  // 10^9 for fixed-point arithmetic
function SIGN_BIT() { return 63; }  // MSB for 64-bit values
function DOUBLE_SIGN_BIT() { return 127; }  // MSB for 128-bit values

// Helper to check if a number needs double-width representation
function needsDoubleBits(a, b) {
    return (a > (1 << (MAIN_BITS() - 1))) || (b > (1 << (MAIN_BITS() - 1)));
}

// Template for 128-bit range check for large intermediates
template EnforceRange128() {
    signal input in;
    
    component bits = Num2Bits(DOUBLE_BITS());
    bits.in <== in + (1 << DOUBLE_SIGN_BIT());
    
    signal accumulator[DOUBLE_BITS()];
    accumulator[0] <== bits.out[0];
    
    for (var i = 1; i < DOUBLE_BITS(); i++) {
        accumulator[i] <== accumulator[i-1] + (bits.out[i] * (1 << i));
    }
    
    accumulator[DOUBLE_BITS()-1] === in + (1 << DOUBLE_SIGN_BIT());
}


// Template to properly implement modulo 2^k
template Mod2K(k) {
    signal input in;
    signal output out;
    
    // Decompose full field element
    component bits = Num2Bits(254);
    bits.in <== in;
    
    // Take only lower k bits
    signal accumulator[k];
    accumulator[0] <== bits.out[0];
    
    for (var i = 1; i < k; i++) {
        accumulator[i] <== accumulator[i-1] + (bits.out[i] * (1 << i));
    }
    
    out <== accumulator[k-1];
}

// Template for 64-bit range check
template EnforceRange64() {
    signal input in;
    
    // Increase bits to 254 to handle potential large field elements
    component bits = Num2Bits(MAIN_BITS());
    bits.in <== in;
    
    // Only take the lower 64 bits for the actual range check
    signal accumulator[MAIN_BITS()];
    accumulator[0] <== bits.out[0];
    
    for (var i = 1; i < MAIN_BITS(); i++) {
        accumulator[i] <== accumulator[i-1] + (bits.out[i] * (1 << i));
    }
    
    // Ensure the value matches the lower 64 bits
    accumulator[MAIN_BITS()-1] === in;
}

// Two-limb representation for large numbers
template TwoLimbNumber() {
    signal input lowLimb;  // Lower 64 bits
    signal input highLimb; // Upper 64 bits
    signal output value;   // Combined value
    
    // Enforce range on each limb
    component lowCheck = EnforceRange64();
    component highCheck = EnforceRange64();
    lowCheck.in <== lowLimb;
    highCheck.in <== highLimb;
    
    value <== lowLimb + (highLimb * (1 << MAIN_BITS()));
}

// Safe multiplication with 128-bit intermediate
template SafeMultiply() {
    signal input a;
    signal input b;
    signal output out;
    
    // Perform multiplication
    signal product <== a * b;
    
    // Enforce 128-bit range on result
    component rangeCheck = EnforceRange128();
    rangeCheck.in <== product;
    
    out <== product;
}

// Fixed-point dot product with 128-bit intermediates
template SafeFixedPointDotProduct(n) {
    signal input a[n];
    signal input b[n];
    signal output out;
    
    // Range check inputs (64-bit)
    component rangeChecksA[n];
    component rangeChecksB[n];
    component products[n];
    component sumChecks[n+1];
    signal partialSums[n+1];
    
    partialSums[0] <== 0;
    
    for (var i = 0; i < n; i++) {
        rangeChecksA[i] = EnforceRange64();
        rangeChecksB[i] = EnforceRange64();
        rangeChecksA[i].in <== a[i];
        rangeChecksB[i].in <== b[i];
        
        // Multiply with proper scaling
        products[i] = SafeMultiply();
        products[i].a <== a[i];
        products[i].b <== b[i];
        
        // Accumulate sum (staying in 128 bits)
        partialSums[i+1] <== partialSums[i] + products[i].out;
        
        // Use pre-declared component
        sumChecks[i] = EnforceRange128();
        sumChecks[i].in <== partialSums[i+1];
    }
    
    // Replace direct division with Division component
    component divider = Division(DOUBLE_BITS());
    divider.dividend <== partialSums[n];
    divider.divisor <== SCALE();
    out <== divider.quotient;
}

// Sign extraction for 64-bit values
template SignExtract64() {
    signal input in;
    signal output sign; // 1 for non-negative, 0 for negative
    
    component bits = Num2Bits(MAIN_BITS());
    bits.in <== in + (1 << SIGN_BIT());
    
    sign <== bits.out[SIGN_BIT()];
}

// Improved random vector generation with proper scaling
template SafeRandomVector(dim) {
    signal input salt;
    signal input index;
    signal output vector[dim];
    
    component hashers[dim];
    component mods[dim];
    component rangeChecks[dim];
    
    for (var i = 0; i < dim; i++) {
        hashers[i] = Poseidon(3);
        hashers[i].inputs[0] <== salt;
        hashers[i].inputs[1] <== index;
        hashers[i].inputs[2] <== i;
        
        // Modify range to ensure values stay within safe bounds
        // Generate random value in [-2^60, 2^60-1] * SCALE to provide more safety margin
        mods[i] = Mod2K(60);
        mods[i].in <== hashers[i].out;
        vector[i] <== (mods[i].out - (1 << 59)) * SCALE();
        
        // Enforce 64-bit range
        rangeChecks[i] = EnforceRange64();
        rangeChecks[i].in <== vector[i];
    }
}

// Main LSH template with fixed-point support
template LSHGadget() {
    signal input x;       // Scaled by SCALE
    signal input y;       // Scaled by SCALE
    signal input tradeOutput; // Scaled by SCALE
    signal input salt;
    signal output lshBits[NUM_PROJECTIONS()];
    signal output salt_output;
    
    // Enforce 64-bit range on inputs
    component inputRangeChecks[3];
    for (var i = 0; i < 3; i++) {
        inputRangeChecks[i] = EnforceRange64();
    }
    inputRangeChecks[0].in <== x;
    inputRangeChecks[1].in <== y;
    inputRangeChecks[2].in <== tradeOutput;
    
    signal inputVec[NUM_DIMENSIONS()];
    inputVec[0] <== x;
    inputVec[1] <== y;
    inputVec[2] <== tradeOutput;
    
    // Generate projections and compute dot products
    component randVecs[NUM_PROJECTIONS()];
    component dotProducts[NUM_PROJECTIONS()];
    component signExtracts[NUM_PROJECTIONS()];
    
    for (var i = 0; i < NUM_PROJECTIONS(); i++) {
        randVecs[i] = SafeRandomVector(NUM_DIMENSIONS());
        randVecs[i].salt <== salt;
        randVecs[i].index <== i;
        
        // Fixed-point dot product
        dotProducts[i] = SafeFixedPointDotProduct(NUM_DIMENSIONS());
        for (var j = 0; j < NUM_DIMENSIONS(); j++) {
            dotProducts[i].a[j] <== inputVec[j];
            dotProducts[i].b[j] <== randVecs[i].vector[j];
        }
        
        // Extract sign from scaled result
        signExtracts[i] = SignExtract64();
        signExtracts[i].in <== dotProducts[i].out;
        lshBits[i] <== signExtracts[i].sign;
    }

    salt_output <== salt;
}
