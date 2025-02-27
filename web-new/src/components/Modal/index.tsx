"use client";

import { PropsWithChildren, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import iconClose from "../../../public/images/icon-close.png";

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose?: () => void;
  contentWrapperClassName?: string;
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
          <div className="py-[16px] pl-[16px] pr-[28px]">
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
                  "flex flex-row items-center mb-[16px]",
                  title?.length ? "border-b border-b-brand-50 pb-[12px] justify-between" : "justify-end",
                )}
              >
                {!!title?.length && <p className="text-heading-1 text-brand-20">{title}</p>}
                <button type="button" onClick={onModalClose} className="active-hover-opacity">
                  <Image src={iconClose} alt="modal close" width={20} height={20} />
                </button>
              </div>
              <div className="text-body-2 text-brand-30">
                {/* @ts-expect-error: React 18 vs 19 type issue */}
                {children}
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
