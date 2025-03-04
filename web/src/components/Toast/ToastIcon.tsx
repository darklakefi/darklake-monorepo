"use client";

import React from "react";
import clsx from "clsx";
import { IconProps, TypeOptions } from "react-toastify";

const typeToIconClassName: Record<TypeOptions, string | undefined> = {
  success: "hn-check-circle-solid text-status-success-20",
  warning: "hn-exclamation-triangle-solid text-status-warning-20",
  error: "hn-times-circle-solid text-status-error-20",
  info: "hn-info-circle-solid text-status-info-20",
  default: undefined, // no icon for default toasts
};

export default function ToastIcon({ type }: IconProps) {
  const iconClassName = typeToIconClassName[type];

  // if no map to type then no icon
  if (!iconClassName) {
    return null;
  }

  return <i className={clsx("text-[18px] hn", iconClassName)} />;
}
