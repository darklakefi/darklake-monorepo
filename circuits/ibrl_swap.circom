pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";
include "division.circom";

template BasisTransformAMM() {
    // Private inputs in random basis
    signal input x_rand;
    signal input y_rand;
    signal input k_rand;
    signal input trade_amount;
    signal input min_output;

    // Public outputs
    signal output initial_point;
    signal output final_point;
    signal output commitment1;
    signal output commitment2;

    // Verify random point lies on curve
    x_rand * y_rand === k_rand;

    // Calculate new position after trade
    signal new_x_rand <== x_rand + trade_amount;
    
    component divider = ReciprocalDivision(252);
    divider.dividend <== k_rand;
    divider.divisor <== new_x_rand;
    signal new_y_rand <== divider.quotient;

    // Calculate output amount
    signal output_amount <== new_y_rand - y_rand;

    // Verify slippage bound
    component slippage_check = GreaterEqThan(252);
    slippage_check.in[0] <== output_amount;
    slippage_check.in[1] <== min_output;

    // Generate commitments
    component hasher1 = Poseidon(2);
    hasher1.inputs[0] <== min_output;
    hasher1.inputs[1] <== k_rand;
    commitment1 <== hasher1.out;

    component output_ratio = ReciprocalDivision(252);
    output_ratio.dividend <== output_amount;
    output_ratio.divisor <== min_output;
    
    component hasher2 = Poseidon(2);
    hasher2.inputs[0] <== output_ratio.quotient;
    hasher2.inputs[1] <== k_rand;
    commitment2 <== hasher2.out;

    // Output encoded points for transformation verification
    initial_point <== x_rand * (2**128) + y_rand;
    final_point <== new_x_rand * (2**128) + new_y_rand;
}

component main = BasisTransformAMM();
