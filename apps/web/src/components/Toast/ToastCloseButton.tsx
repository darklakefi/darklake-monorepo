"use client";

import React from "react";
import { CloseButtonProps } from "react-toastify";

export default function ToastCloseButton({ closeToast }: CloseButtonProps) {
  return (
    <button
      onClick={closeToast}
      className="absolute top-[10px] right-[10px] xs:top-[18px] xs:right-[18px] active:opacity-50 hover:opacity-80"
    >
      <i className="hn hn-times-solid text-neutral-grey text-[13px]" />
    </button>
  );
}
