import { act, render, RenderResult } from "@testing-library/react";
import AddressMevLookup from "@/components/AddressMevLookup";

describe("<AddressMevLookup />", () => {
  it("renders successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<AddressMevLookup />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
