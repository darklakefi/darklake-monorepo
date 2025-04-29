import { act, render, RenderResult } from "@testing-library/react";
import LookedDetailResultContent from "../LookedDetailResultContent";

describe("<LookedDetailResultContent />", () => {
  it("displays content successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<LookedDetailResultContent onConnect={() => {}} connectWithTwitterDisabled={false} />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
