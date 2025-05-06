"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { useRouter } from "next/navigation";

import { pasteFromClipboard } from "@/utils/browser";
import { isValidSolanaAddress } from "@/utils/blockchain";
import { cn } from "@/utils/common";
import Button from "@/components/Button";
import { trim } from "lodash";

type AddressMevLookupProps = {
  onSubmit?: (address: string) => void;
};

const AddressMevLookup = (props: AddressMevLookupProps) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetInput = () => {
    setInputValue("");
    setIsInputVisible(false);
  };

  useEffect(() => {
    if (isInputVisible) {
      inputRef.current?.focus();
    }
  }, [isInputVisible, inputRef]);

  const onPasteAddressClick = () => {
    pasteFromClipboard((pasted) => {
      setInputValue(pasted.trim());
      if (inputRef.current) {
        inputRef.current.innerText = pasted.trim();
      }
    });
    setIsInputVisible(true);
  };

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = trim(e.currentTarget.innerText || "");
    setInputValue(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitDisabled) {
      e.preventDefault();
      e.stopPropagation();
      props.onSubmit?.(inputValue);
      router.push(resultsLink);
    }
  };

  const isSubmitDisabled = !inputValue?.length || !isValidSolanaAddress(inputValue);
  const isInputEmpty = useMemo(() => !inputValue?.length || inputValue === "", [inputValue]);
  const isInputFocusAndEmpty = useMemo(
    () => isInputVisible && isSubmitDisabled && isInputEmpty,
    [isInputVisible, isSubmitDisabled, isInputEmpty],
  );

  const resultsLink = `/results/${DOMPurify.sanitize(inputValue ?? "")}`;

  const wrapperFlexClassName = "flex flex-row items-center";
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "h-12 p-2 md:max-w-2xl w-full bg-brand-60",
          "border",
          isInputFocusAndEmpty ? "border-brand-20" : "border-brand-40 hover:border-brand-30",
          wrapperFlexClassName,
        )}
      >
        {!isInputVisible && (
          <div className="flex items-center w-full">
            <span className="font-secondary text-lg leading-6 tracking-normal text-brand-30 select-none mr-3">
              &gt;
            </span>
            <div
              className="font-secondary text-lg max-md:text-xs leading-6 tracking-normal w-full text-brand-30 uppercase cursor-text"
              onClick={(ref) => {
                if (ref.currentTarget === ref.target) {
                  setIsInputVisible(true);
                }
              }}
            >
              Enter or{" "}
              <Button intent="secondary" className="px-3 py-1 max-md:text-xs" onClick={onPasteAddressClick}>
                Paste
              </Button>{" "}
              Solana address...
            </div>
          </div>
        )}
        {isInputVisible && (
          <div className="flex items-center">
            <span className="font-secondary text-lg leading-6 tracking-normal text-brand-30 select-none mr-3">
              &gt;
            </span>

            <div
              contentEditable={true}
              ref={inputRef}
              className={cn(
                "w-full bg-transparent min-w-0 max-w-full border-none break-all",
                "focus:outline-none font-secondary text-lg leading-6 tracking-normal text-brand-20",
              )}
              onInput={(e) => handleInputChange(e)}
              onBlur={() => {
                if (inputValue?.length) return;
                setIsInputVisible(false);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        {!isInputEmpty && (
          <button onClick={resetInput} className="hover-with-active cursor-pointer ml-2 flex items-center">
            <i className="hn hn-times-circle-solid text-brand-30 text-lg leading-5" />
          </button>
        )}
        {!isSubmitDisabled && (
          <Link
            className={cn(
              "font-secondary text-lg leading-6 tracking-normal uppercase bg-brand-10 text-brand-70 px-3 py-1 hover:bg-brand-20",
              "disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-10 active:ring-brand-10",
              "active:ring-offset-2 active:ring-offset-black ml-3 flex-shrink-0",
              "max-md:hidden",
            )}
            href={resultsLink}
            title="Reveal Losses"
            onClick={() => {
              props.onSubmit?.(inputValue);
              router.push(resultsLink);
            }}
          >
            Reveal Losses
          </Link>
        )}
      </div>
      {isSubmitDisabled && !isInputEmpty && (
        <div className="flex flex-row gap-2 items-center">
          <i className="hn hn-exclamation-triangle-solid text-brand-30 text-xl" />
          <span className="text-body-2 uppercase text-brand-30 select-none">that’s not a valid Solana address</span>
        </div>
      )}

      {!isSubmitDisabled && (
        <Link
          className={cn(
            "font-secondary text-lg leading-6 tracking-normal uppercase bg-brand-10 text-brand-70 px-3 py-1 hover:bg-brand-20",
            "disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-10 active:ring-brand-10",
            "active:ring-offset-2 active:ring-offset-black flex-shrink-0",
            "text-center w-full max-md:block md:hidden",
          )}
          href={resultsLink}
          title="Reveal Losses"
          onClick={() => {
            props.onSubmit?.(inputValue);
            router.push(resultsLink);
          }}
        >
          Reveal Losses
        </Link>
      )}
    </div>
  );
};

export default AddressMevLookup;
