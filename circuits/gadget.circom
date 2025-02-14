pragma circom 2.0.0;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";
include "circomlib/bitify.circom";
include "circomlib/mux2.circom";
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
    
    // sums back to a number
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
    bits.in <== in;                             // FAILS here
    
    // Only take the lower 64 bits for the actual range check
    signal accumulator[MAIN_BITS()];
    accumulator[0] <== bits.out[0];
    
    for (var i = 1; i < MAIN_BITS(); i++) {
        accumulator[i] <== accumulator[i-1] + (bits.out[i] * (1 << i));
    }
    
    // Ensure the value matches the lower 64 bits
    accumulator[MAIN_BITS()-1] === in;
}

// Not used
// Two-limb representation for large numbers
// template TwoLimbNumber() {
//     signal input lowLimb;  // Lower 64 bits
//     signal input highLimb; // Upper 64 bits
//     signal output value;   // Combined value
    
//     // Enforce range on each limb
//     component lowCheck = EnforceRange64();
//     component highCheck = EnforceRange64();
//     lowCheck.in <== lowLimb;
//     highCheck.in <== highLimb;
    
//     value <== lowLimb + (highLimb * (1 << MAIN_BITS()));
// }

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
template SafeSignedIntegerDotProduct(n) {
    signal input a[n];
    signal input b[n];
    signal output signOut;
    signal output out;
    
    // Range check inputs (64-bit)
    component rangeChecksA[n];
    component rangeChecksB[n];
    component products[n];
    component sumChecks[n+1];

    // comparators
    component lessThan[n];
    component areSignsEqual[n];
    component amountsLessThan[n];
    component mux2[n];
    component mux2Sign[n];

    // helper signals
    signal isBNegative[n];
    signal isSumNegative[n+1];
    signal bWithoutSign[n];
    // signal multiplier2[n];
    // signal multiplier3[n];

    signal partialSums[n+1];
    
    partialSums[0] <== 0;
    isSumNegative[0] <== 0;

    for (var i = 0; i < n; i++) {
        rangeChecksA[i] = EnforceRange64();
        rangeChecksB[i] = EnforceRange64();
        rangeChecksA[i].in <== a[i];
        rangeChecksB[i].in <== b[i];
        
        lessThan[i] = LessThan(252);
        // half of 64 bit range (63bit value)
        lessThan[i].in[0] <== 9223372036854775808;
        lessThan[i].in[1] <== b[i];

        isBNegative[i] <== lessThan[i].out;
        bWithoutSign[i] <== b[i] - (9223372036854775808 * isBNegative[i]);

        // Multiply with a magnitude value of b (without sign)
        products[i] = SafeMultiply();
        products[i].a <== a[i];
        products[i].b <== bWithoutSign[i];


        areSignsEqual[i] = IsEqual();
        areSignsEqual[i].in[0] <== isSumNegative[i];
        areSignsEqual[i].in[1] <== isBNegative[i];

        amountsLessThan[i] = LessThan(252);
        amountsLessThan[i].in[0] <== partialSums[i];
        amountsLessThan[i].in[1] <== products[i].out;
        

        // multiplier2[i] <== (1 - areSignsEqual[i].out) * amountsLessThan[i].out;
        // multiplier3[i] <== (1 - areSignsEqual[i].out) * (1 - amountsLessThan[i].out);

        // if (areSignsEqual[i].out == 0 && amountsLessThan[i].out == 1) {
        //     partialSums[i+1] <== products[i].out - partialSums[i];
        //     isSumNegative <== isBNegative;
        // } else if (areSignsEqual[i].out == 0 && amountsLessThan[i].out == 0) {
        //     partialSums[i+1] <== partialSums[i] - products[i].out;
        // } else {
        //     partialSums[i+1] <== partialSums[i] + products[i].out;
        // }

        // i - below imitates above

        mux2[i] = Mux2();
        mux2[i].c[0] <== (partialSums[i] + products[i].out);
        mux2[i].c[1] <== (partialSums[i] + products[i].out);
        mux2[i].c[2] <== (products[i].out - partialSums[i]);
        mux2[i].c[3] <== (partialSums[i] - products[i].out);
        mux2[i].s[0] <== areSignsEqual[i].out;
        mux2[i].s[1] <== amountsLessThan[i].out;
        
        partialSums[i+1] <== mux2[i].out;

        
        // Accumulate sum (staying in 128 bits)

        // Use pre-declared component
        sumChecks[i] = EnforceRange128();
        sumChecks[i].in <== partialSums[i+1];

        // using the same logic as previous Mux2 just for sign
        mux2Sign[i] = Mux2();
        mux2Sign[i].c[0] <== isSumNegative[i];
        mux2Sign[i].c[1] <== isSumNegative[i];
        mux2Sign[i].c[2] <== isBNegative[i];
        mux2Sign[i].c[3] <== isSumNegative[i];
        mux2Sign[i].s[0] <== areSignsEqual[i].out;
        mux2Sign[i].s[1] <== amountsLessThan[i].out;

        isSumNegative[i+1] <== mux2Sign[i].out;
    }
    
    // partial sum is currently not used on the output
    out <== partialSums[n];
    // for now we only care if the final sum is negative/positive
    signOut <== isSumNegative[n];
}

// Sign extraction for 64-bit values
template SignExtract64() {
    signal input in;
    signal output sign; // 1 for non-negative, 0 for negative
    
    // MAIN_BITS - 64
    component bits = Num2Bits(MAIN_BITS());
    // SIGN_BIT - 63
    bits.in <== in + (1 << SIGN_BIT());
    
    sign <== bits.out[SIGN_BIT()];
}

// Sign extraction for 128-bit values
template SignExtract128() {
    signal input in;
    signal output sign; // 1 for non-negative, 0 for negative
    
    component bits = Num2Bits(DOUBLE_BITS());
    bits.in <== in + (1 << DOUBLE_SIGN_BIT());
    
    sign <== bits.out[DOUBLE_SIGN_BIT()];
}

// Improved random vector generation with proper scaling
template SafeRandomVector(dim) {
    signal input salt;
    signal input index;
    signal output vector[dim];
    
    component hashers[dim];
    component mods[dim];
    component rangeChecks[dim];
    
    // [0 -> 3)
    for (var i = 0; i < dim; i++) {
        hashers[i] = Poseidon(3);
        hashers[i].inputs[0] <== salt;
        hashers[i].inputs[1] <== index;
        hashers[i].inputs[2] <== i;
        
        mods[i] = Mod2K(64); // originaly 60
        mods[i].in <== hashers[i].out;

        // we pretend the MSB is the sign
        vector[i] <== mods[i].out; 
        
        // Check 64-bit range
        rangeChecks[i] = EnforceRange64();
        rangeChecks[i].in <== vector[i];
    }
}

// Main LSH template with fixed-point support
template LSHGadget() {
    signal input x;
    signal input y;
    signal input tradeOutput;
    signal input salt;
    signal output lshBits[NUM_PROJECTIONS()];
    signal output salt_output;
    
    // Enforce 64-bit range on inputs
    component inputRangeChecks[3];
    for (var i = 0; i < 3; i++) {
        inputRangeChecks[i] = EnforceRange64();
    }
    // creates three EnforceRange64 and checks that all values fit in 64 bits
    inputRangeChecks[0].in <== x;
    inputRangeChecks[1].in <== y;
    inputRangeChecks[2].in <== tradeOutput;
    
    // groups the inputs into a vector
    signal inputVec[NUM_DIMENSIONS()];
    inputVec[0] <== x;
    inputVec[1] <== y;
    inputVec[2] <== tradeOutput;
    
    // Generate projections and compute dot products
    // creates an array of components for each dimension (3)
    component randVecs[NUM_PROJECTIONS()];
    component dotProducts[NUM_PROJECTIONS()];
    component signExtracts[NUM_PROJECTIONS()];
    
    // NUM_PROJECTIONS = 64
    for (var i = 0; i < NUM_PROJECTIONS(); i++) {
        // NUM_DIMENSIONS = 3
        randVecs[i] = SafeRandomVector(NUM_DIMENSIONS());
        randVecs[i].salt <== salt;
        randVecs[i].index <== i; 
        // Signed integer dot product
        // all x/y/tradeOutput are dot "producted" with a DIFFERENT random vector
        dotProducts[i] = SafeSignedIntegerDotProduct(NUM_DIMENSIONS());
        for (var j = 0; j < NUM_DIMENSIONS(); j++) {
            dotProducts[i].a[j] <== inputVec[j];
            dotProducts[i].b[j] <== randVecs[i].vector[j];
        }
        
        // Extract sign from scaled result
        lshBits[i] <== dotProducts[i].signOut;
    }
    salt_output <== salt;
}
