"use client";

import useGlobalModal from "@/hooks/useGlobalModal";
import { GlobalModalType } from "@/providers/GlobalModalProvider";

export default function WhatIsMevInlineButton() {
  const { openModal } = useGlobalModal();

  return (
    <button
      onClick={() => openModal(GlobalModalType.WHAT_IS_MEV)}
      className="align-middle hover-with-active rounded-full size-5 bg-brand-50 border border-brand-40"
    >
      <i className="hn hn-question-solid text-brand-30 text-[12px] leading-[18px]" />
    </button>
  );
}
