"use client";

import { ToastContentProps, TypeOptions } from "react-toastify";
import clsx from "clsx";

interface ToastContentExtendedProps extends React.PropsWithChildren {
  title?: string;
  action?: {
    title: string;
    onClick: () => void;
  };
}

const typeToActionClassName: Record<TypeOptions, string> = {
  success: "text-status-success-20 hover:text-success-10 active:text-status-success-20 active:ring-status-success-10",
  warning: "text-status-warning-20 hover:text-warning-10 active:text-status-warning-20 active:ring-status-warning-10",
  error: "text-status-error-20 hover:text-error-10 active:text-status-error-20 active:ring-status-error-10",
  info: "text-status-info-20 hover:text-info-10 active:text-status-info-20 active:ring-status-info-10",
  default: "text-brand-30 hover:text-brand-20 active:text-brand-30 active:ring-brand-20",
};

export default function ToastContentExtended({
  children,
  title,
  action,
  toastProps,
}: ToastContentExtendedProps & Partial<ToastContentProps>) {
  return (
    <div>
      {!!title?.length && <h3 className="text-white">{title}</h3>}
      <div>{children}</div>
      {!!action && (
        <button
          className={clsx(
            "mt-[16px] text-body-2 uppercase underline",
            "disabled:opacity-50 focus:outline-none active:bg-transparent",
            "active:ring-[1px] active:ring-offset-[3px] active:ring-offset-black",
            toastProps?.type && typeToActionClassName[toastProps.type],
          )}
          onClick={action.onClick}
        >
          {action.title}
        </button>
      )}
    </div>
  );
}
