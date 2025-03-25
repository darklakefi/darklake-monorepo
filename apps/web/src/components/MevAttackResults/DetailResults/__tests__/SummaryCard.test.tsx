import { act, render, RenderResult } from "@testing-library/react";
import SummaryCard from "../SummaryCard";

describe("<SummaryCard />", () => {
  it("displays content successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(
        <SummaryCard
          title="Total Extracted"
          content={
            <div className="flex flex-col gap-[2px] py-[1px]">
              <div className="text-body text-brand-20">16.32 SOL</div>
              <div className="text-body-2 text-brand-30">2,774.32 USDC</div>
            </div>
          }
        />,
      ));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("displays content successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(
        <SummaryCard
          title="Confirmed Attack"
          content={
            <div className="flex flex-col gap-[2px] py-[1px]">
              <div className="text-body text-brand-20">47</div>
            </div>
          }
        />,
      ));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
