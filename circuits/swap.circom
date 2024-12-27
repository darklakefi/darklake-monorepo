
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
    signal input currentReserveX;
    signal input currentReserveY;

    // Outputs
    signal output newBalanceX;
    signal output newBalanceY;
    signal output amountReceived;

    // Calculate constant product
    signal constantProduct <== currentReserveX * currentReserveY;

    // Determine swap direction and calculate amounts
    component muxInput = Mux1();
    muxInput.c[0] <== currentReserveY;
    muxInput.c[1] <== currentReserveX;
    muxInput.s <== isSwapXtoY;
    signal inputBalance <== muxInput.out;

    component muxOutput = Mux1();
    muxOutput.c[0] <== currentReserveX;
    muxOutput.c[1] <== currentReserveY;
    muxOutput.s <== isSwapXtoY;
    signal outputBalance <== muxOutput.out;

    // Calculate new input balance
    signal newInputBalance <== inputBalance + inputAmount;

    // Calculate new output balance (y = k / x)
    component division = ReciprocalDivision(252);
    division.dividend <== constantProduct;
    division.divisor <== newInputBalance;
    signal newOutputBalance <== division.quotient;

    // Assign new balances
    signal intermediate1 <== (1 - isSwapXtoY) * newOutputBalance;
    // TODO: needs further investigation how to handle newBalanceX and newBalanceY
    newBalanceX <== isSwapXtoY * newInputBalance + intermediate1;
    signal intermediate2 <== (1 - isSwapXtoY) * newInputBalance;
    newBalanceY <== isSwapXtoY * newOutputBalance + intermediate2;

    // Calculate amount received
    signal intermediate3 <== isSwapXtoY * (currentReserveY - newOutputBalance);
    signal intermediate4 <== (1 - isSwapXtoY) * (currentReserveX - newOutputBalance);

    amountReceived <== intermediate3 + intermediate4;

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

    // Sanity checks
    component positiveBalance1 = GreaterEqThan(252);
    positiveBalance1.in[0] <== newBalanceX;
    positiveBalance1.in[1] <== 0;
    positiveBalance1.out === 1;

    component positiveBalance2 = GreaterEqThan(252);
    positiveBalance2.in[0] <== newBalanceY;
    positiveBalance2.in[1] <== 0;
    positiveBalance2.out === 1;

    // Verify constant product
    // newBalanceX * newBalanceY === constantProduct;
}

component main {public [inputAmount,currentReserveX,currentReserveY,isSwapXtoY]} = ZKConstantProductAMM();