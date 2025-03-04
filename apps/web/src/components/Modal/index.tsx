"use client";

import { PropsWithChildren, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose?: () => void;
  contentWrapperClassName?: string;
  children?: React.ReactNode;
}

export default function Modal({
  title,
  children,
  isOpen,
  onClose,
  contentWrapperClassName,
}: PropsWithChildren<ModalProps>) {
  const [forceHide, setForceHide] = useState(false);

  const onModalClose = () => {
    if (onClose) {
      onClose();
    } else {
      setForceHide(true);
    }
  };

  return (
    <Dialog as="div" className="relative" open={!forceHide && isOpen} onClose={onModalClose}>
      <DialogBackdrop className="fixed inset-0 bg-modal-backdrop" />
      <div className="flex flex-col fixed inset-0 w-screen items-center justify-center">
        <DialogPanel>
          <div className="py-4 pl-4 pr-7">
            <div
              className={clsx(
                "max-h-[80vh] lg:max-h-none overflow-auto",
                "p-[16px] md:p-[40px] bg-brand-70",
                "shadow-[12px_12px_0px_0px] shadow-brand-60 relative",
                contentWrapperClassName,
              )}
            >
              <div
                className={clsx(
                  "flex flex-row items-center mb-4",
                  title?.length ? "border-b border-b-brand-50 pb-3 justify-between" : "justify-end",
                )}
              >
                {!!title?.length && <p className="font-primary text-3xl leading-3xl text-brand-20">{title}</p>}
                <button type="button" onClick={onModalClose} className="hover:opacity-70 active:opacity-50">
                  <Image src="/images/icon-close.png" alt="modal close" width={20} height={20} />
                </button>
              </div>
              <div className="font-secondary text-lg leading-6 text-brand-30">
                {children}
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
