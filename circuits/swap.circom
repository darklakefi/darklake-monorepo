
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/mux1.circom";
include "division.circom";

template ZKConstantProductAMM() {
    // Private inputs
    // TODO: for MVP this is equal to exact amountReceived
    // Later improved to be immune to front-running
    signal input privateMinReceived;

    // Public inputs
    // supplied by the user when swapping
    signal input inputAmount;
    signal input isSwapXtoY; // 1 if swapping X to Y, 0 if swapping Y to X

    // verified in the pool when swapping
    signal input reserveX;
    signal input reserveY;

    // Outputs
    signal output newReserveX;
    signal output newReserveY;
    signal output amountReceived;

    // Calculate constant product
    signal constantProduct <== reserveX * reserveY;

    // Determine swap direction and calculate amounts
    component muxInput = Mux1();
    muxInput.c[0] <== reserveY;
    muxInput.c[1] <== reserveX;
    muxInput.s <== isSwapXtoY;
    signal inputReserve <== muxInput.out;

    component muxOutput = Mux1();
    muxOutput.c[0] <== reserveX;
    muxOutput.c[1] <== reserveY;
    muxOutput.s <== isSwapXtoY;
    signal outputReserve <== muxOutput.out; // not used

    // Calculate new input balance
    signal newInputReserve <== inputReserve + inputAmount;

    // Calculate new output balance (y = k / x)
    // The rounding is up, so that the pool wouldn't lose funds
    component division = ReciprocalDivision(252, 1);
    division.dividend <== constantProduct;
    division.divisor <== newInputReserve;
    signal newOutputReserve <== division.quotient;

    // Calculate amount received
    signal intermediate1 <== isSwapXtoY * (reserveY - newOutputReserve);
    signal intermediate2 <== (1 - isSwapXtoY) * (reserveX - newOutputReserve);

    amountReceived <== intermediate1 + intermediate2;

    // Verify minimum received amount
    component checkMinReceived = GreaterEqThan(252);
    checkMinReceived.in[0] <== amountReceived;
    checkMinReceived.in[1] <== privateMinReceived;
    checkMinReceived.out === 1;

    // Range check for private inputs
    component privateInputAmountCheck = Num2Bits(252);
    privateInputAmountCheck.in <== inputAmount;

    component privateMinReceivedCheck = Num2Bits(252);
    privateMinReceivedCheck.in <== privateMinReceived;

    // Assign new balances
    signal intermediate3 <== (1 - isSwapXtoY) * newOutputReserve;

    // TODO: needs further investigation how to handle newReserveX and newReserveY
    newReserveX <== isSwapXtoY * newInputReserve + intermediate3;

    signal intermediate4 <== (1 - isSwapXtoY) * newInputReserve;
    newReserveY <== isSwapXtoY * newOutputReserve + intermediate4;

    // Sanity checks
    component positiveBalance1 = GreaterEqThan(252);
    positiveBalance1.in[0] <== newReserveX;
    positiveBalance1.in[1] <== 0;
    positiveBalance1.out === 1;

    component positiveBalance2 = GreaterEqThan(252);
    positiveBalance2.in[0] <== newReserveY;
    positiveBalance2.in[1] <== 0;
    positiveBalance2.out === 1;

    // Verify constant product
    // newReserveX * newReserveY === constantProduct;
}

component main {public [inputAmount,reserveX,reserveY,isSwapXtoY]} = ZKConstantProductAMM();