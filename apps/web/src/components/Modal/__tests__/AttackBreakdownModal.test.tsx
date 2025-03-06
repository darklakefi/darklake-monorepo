import { act, render, RenderResult } from "@testing-library/react";
import AttackBreakdownModal from "@/components/Modal/AttackBreakdownModal";
import { MevAttack, MevAttackSwapType, MevTransaction } from "@/types/Mev";

const mockMevAttackTransaction: MevTransaction = {
  address: "someAddress",
  signature: "someSignature",
};

const mockMevAttack: MevAttack = {
  swapType: MevAttackSwapType.BUY,
  timestamp: +new Date("2024-03-26"),
  tokenName: "TRUMP",
  solAmount: {
    sent: 100,
    lost: 30,
  },
  transactions: {
    frontRun: mockMevAttackTransaction,
    victim: mockMevAttackTransaction,
    backRun: mockMevAttackTransaction,
  },
};

describe("<AttackBreakdownModal />", () => {
  it("does not display content when closed", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<AttackBreakdownModal mevAttack={mockMevAttack} isOpen={false} />));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("displays content successfully when open", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<AttackBreakdownModal mevAttack={mockMevAttack} isOpen />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
