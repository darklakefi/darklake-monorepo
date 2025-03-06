import { act, render, RenderResult } from "@testing-library/react";
import WhatIsMevModal from "@/components/Modal/WhatIsMevModal";

describe("<WhatIsMevModal />", () => {
  it("does not display content when closed", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<WhatIsMevModal isOpen={false} />));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("displays content successfully when open", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<WhatIsMevModal isOpen />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
