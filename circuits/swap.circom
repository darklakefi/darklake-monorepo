pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/mux1.circom";
include "division.circom";

template ZKConstantProductAMM() {
    // Private inputs
    signal input minReceived;

    // Public inputs
    signal input inputAmount;
    signal input balanceX;
    signal input balanceY;
    signal input isSwapXtoY; // 1 if swapping X to Y, 0 if swapping Y to X

    // Calculate constant product
    signal constantProduct <== balanceX * balanceY;

    // Determine swap direction and calculate amounts
    component muxInput = Mux1();
    muxInput.c[0] <== balanceY;
    muxInput.c[1] <== balanceX;
    muxInput.s <== isSwapXtoY;
    signal inputBalance <== muxInput.out;

    component muxOutput = Mux1();
    muxOutput.c[0] <== balanceX;
    muxOutput.c[1] <== balanceY;
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
    signal newBalanceX <== isSwapXtoY * newInputBalance + intermediate1;
    signal intermediate2 <== (1 - isSwapXtoY) * newInputBalance;
    signal newBalanceY <== isSwapXtoY * newOutputBalance + intermediate2;

    // Calculate amount received
    signal intermediate3 <== isSwapXtoY * (balanceY - newOutputBalance);
    signal intermediate4 <== (1 - isSwapXtoY) * (balanceX - newOutputBalance);
    signal amountReceived <== intermediate3 + intermediate4;

    // Verify minimum received amount
    component checkMinReceived = GreaterEqThan(252);
    checkMinReceived.in[0] <== amountReceived;
    checkMinReceived.in[1] <== minReceived;
    checkMinReceived.out === 1;

    // Range check for private inputs
    component privateInputAmountCheck = Num2Bits(252);
    privateInputAmountCheck.in <== inputAmount;

    component privateMinReceivedCheck = Num2Bits(252);
    privateMinReceivedCheck.in <== minReceived;

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

component main {public [inputAmount, balanceX, balanceY, isSwapXtoY]} = ZKConstantProductAMM();