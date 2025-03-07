import { act, render, RenderResult } from "@testing-library/react";
import Modal from "@/components/Modal";

describe("<Modal />", () => {
  it("does not display content when closed", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(
        <Modal title="Some modal title" isOpen={false}>
          Some content.
        </Modal>,
      ));
    });

    expect(baseElement).toMatchSnapshot();
  });

  it("displays content successfully when open", async () => {
    let baseElement: RenderResult["baseElement"] | undefined;

    await act(async () => {
      ({ baseElement } = render(
        <Modal title="Some modal title" isOpen>
          Some content.
        </Modal>,
      ));
    });

    expect(baseElement).toMatchSnapshot();
  });
});
