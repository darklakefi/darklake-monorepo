import React from "react";

import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils/common";

const buttonStyle = cva("button", {
  variants: {
    intent: {
      "primary-light": cn(
        "text-body-2 bg-brand-10 text-brand-70",
        "px-[12px] py-[5px]",
        "hover:bg-brand-20 focus:outline-none",
        "active:ring-[1px] active:bg-brand-10 active:ring-brand-10 active:ring-offset-[3px] active:ring-offset-black",
        "disabled:active:bg-brand-10",
      ),
      "primary-dark": cn(
        "text-body-2 bg-brand-70 text-brand-10",
        "px-[12px] py-[5px]",
        "hover:text-brand-10 focus:outline-none",
        "active:ring-[1px] active:bg-brand-70 active:ring-brand-70 active:ring-offset-[3px] active:ring-offset-black",
        "disabled:active:bg-brand-70",
      ),
      secondary: cn(
        "text-body-2 underline bg-brand-50 text-brand-20",
        "px-[12px] py-[5px]",
        "hover:bg-brand-50 focus:outline-none",
        "active:ring-[1px] active:bg-brand-50 active:ring-brand-20 active:ring-offset-[3px] active:ring-offset-black",
        "disabled:active:bg-brand-50",
      ),
      tertiary: cn(
        "text-body-2 underline text-brand-30",
        "hover:text-brand-20 focus:outline-none",
        "active:ring-[1px] active:bg-brand-70 active:ring-brand-20 active:ring-offset-[3px] active:ring-offset-black",
      ),
    },
    disabled: {
      false: null,
      true: "opacity-50 disabled:ring-offset-0 disabled:ring-0 cursor-not-allowed",
    },
  },
  defaultVariants: {
    disabled: false,
    intent: "primary-dark",
  },
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyle>;

export default function Button({ className, intent, disabled, ...props }: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn("uppercase font-secondary text-lg leading-6", buttonStyle({ intent, disabled, className }))}
      disabled={disabled}
      {...props}
    />
  );
}
