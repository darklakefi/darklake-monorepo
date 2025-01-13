pragma circom 2.0.0;

include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template ReciprocalDivision(n, isCeil) {
    signal input dividend;
    signal input divisor;
    signal output quotient;
    
    // Ensure divisor is not zero
    component isZero = IsZero();
    isZero.in <== divisor;
    isZero.out === 0;
    
    // Perform division
    signal remainder;
    signal baseQuotient <-- dividend \ divisor;
    remainder <-- dividend % divisor;

    // Constrain the result
    dividend === baseQuotient * divisor + remainder;
    
    // Ensure remainder is less than divisor
    component lessThan = LessThan(n);
    lessThan.in[0] <== remainder;
    lessThan.in[1] <== divisor;
    lessThan.out === 1;

    // Check if remainder is non-zero
    component isRemainderZero = IsZero();
    isRemainderZero.in <== remainder;

    // Add 1 to quotient if remainder is non-zero and isCeil is true
    quotient <== baseQuotient + ((1 - isRemainderZero.out) * isCeil);
}
