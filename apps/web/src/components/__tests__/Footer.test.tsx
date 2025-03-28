import { act, render, RenderResult } from "@testing-library/react";
import Footer from "@/components/Footer";
import GlobalModalProvider from "@/providers/GlobalModalProvider";

describe("<Footer />", () => {
  it("renders successfully", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(
        <GlobalModalProvider>
          <Footer />
        </GlobalModalProvider>,
      ));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
