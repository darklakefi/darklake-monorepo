import { act, render, RenderResult } from "@testing-library/react";
import BrutalMevExtractionsLiveEvidence from "@/components/BrutalMevExtractionsLiveEvidence";
import { MevAttack, MevAttackSwapType, MevTransaction } from "@/types/Mev";

const mockMevAttackTransaction: MevTransaction = {
  address: "someAddress",
  signature: "someSignature",
};

const mockMevAttacks: MevAttack[] = [
  {
    swapType: MevAttackSwapType.BUY,
    timestamp: +new Date("2024-03-26"),
    tokenName: "TRUMP",
    solAmount: {
      sent: 100,
      lost: 50,
    },
    transactions: {
      frontRun: mockMevAttackTransaction,
      victim: mockMevAttackTransaction,
      backRun: mockMevAttackTransaction,
    },
  },
  {
    swapType: MevAttackSwapType.BUY,
    tokenName: "TRUMP",
    timestamp: +new Date("2024-03-28"),
    solAmount: {
      sent: 200,
      lost: 10,
    },
    transactions: {
      frontRun: mockMevAttackTransaction,
      victim: mockMevAttackTransaction,
      backRun: mockMevAttackTransaction,
    },
  },
];

describe("<BrutalMevExtractionsLiveEvidence />", () => {
  it("renders successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<BrutalMevExtractionsLiveEvidence attacks={mockMevAttacks} />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
