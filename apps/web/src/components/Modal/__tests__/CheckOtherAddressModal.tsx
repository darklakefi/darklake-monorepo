import { act, render, RenderResult } from "@testing-library/react";
import CheckOtherAddressModal from "@/components/Modal/CheckOtherAddressModal";

describe("<CheckOtherAddressModal />", () => {
  it("does not display content when closed", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<CheckOtherAddressModal isOpen={false} />));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("displays content successfully when open", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(<CheckOtherAddressModal isOpen />));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
