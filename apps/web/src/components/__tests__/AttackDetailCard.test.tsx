import { act, render, RenderResult } from "@testing-library/react";
import { MevAttack, MevAttackSwapType, MevTransaction } from "@/types/Mev";
import AttackDetailCard from "../AttackDetailCard";

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

describe("<AttackDetailCard />", () => {
  it("displays attack detail", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<AttackDetailCard mevAttack={mockMevAttack} />));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("display attack detail with top index", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<AttackDetailCard mevAttack={mockMevAttack} />));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("displays blurred attack detail", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<AttackDetailCard.Blurred index={1} />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
