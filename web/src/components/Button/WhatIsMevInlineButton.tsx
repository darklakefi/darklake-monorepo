"use client";

import Image from "next/image";

import useGlobalModal from "@/hooks/useGlobalModal";
import { GlobalModalType } from "@/providers/GlobalModalProvider";
import iconQuestion from "../../../public/images/icon-question.png";

export default function WhatIsMevInlineButton() {
  const { openModal } = useGlobalModal();

  return (
    <button onClick={() => openModal(GlobalModalType.WHAT_IS_MEV)} className="inline active-hover-opacity">
      <Image src={iconQuestion} alt="what is mev" />
    </button>
  );
}
