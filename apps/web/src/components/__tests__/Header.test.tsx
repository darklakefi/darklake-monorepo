import { act, render, RenderResult } from "@testing-library/react";
import Header from "@/components/Header";

describe("<Header />", () => {
  it("renders successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<Header />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
