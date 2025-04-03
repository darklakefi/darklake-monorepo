import { act, render, RenderResult } from "@testing-library/react";
import MevExtractionsHappeningNow from "../MevExtractionsHappeningNow";

describe("<MevExtractionsHappeningNow />", () => {
  it("renders successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(
        <MevExtractionsHappeningNow
          drainToday={{
            amountSol: 1,
            amountUsd: 11,
          }}
          weekTotal={{
            amountSol: 1,
            amountUsd: 1,
          }}
          attacksToday={{
            attacksTodayCount: 1,
            attacksWeekCount: 1,
          }}
        />,
      ));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
