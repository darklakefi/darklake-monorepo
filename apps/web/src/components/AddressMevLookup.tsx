"use client";

import { useEffect, useRef, useState } from "react";

import { pasteFromClipboard } from "@/utils/browser";
import { isValidSolanaAddress } from "@/utils/blockchain";
import { cn } from "@/utils/common";
import Button from "@/components/Button";
import Link from "next/link";

const AddressMevLookup = () => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    pasteFromClipboard((pasted) => setInputValue(pasted.trim()));
    setIsInputVisible(true);
  };

  const wrapperFlexClassName = "flex flex-row items-center justify-between";
  return (
    <div className={cn("h-12 p-2 mb-6 md:max-w-2xl w-full border border-brand-40 bg-brand-60", wrapperFlexClassName)}>
      <div className="flex items-center flex-grow">
        <span className="font-secondary text-lg leading-6 text-brand-30 select-none mr-3">&gt;</span>
        {!isInputVisible && (
          <div
            className="font-secondary text-lg leading-6 w-full text-brand-30 uppercase cursor-text"
            onClick={(ref) => {
              if (ref.currentTarget === ref.target) {
                setIsInputVisible(true);
              }
            }}
          >
            Enter or{" "}
            <Button intent="secondary" className="px-3 py-1" onClick={onPasteAddressClick}>
              Paste
            </Button>{" "}
            Solana address...
          </div>
        )}
        {isInputVisible && (
          <input
            ref={inputRef}
            className={cn(
              "w-full bg-transparent min-w-0 max-w-full border-none",
              "focus:outline-none font-secondary text-lg leading-6 text-brand-20",
            )}
            type="text"
            value={inputValue}
            onBlur={() => {
              if (inputValue?.length) return;
              setIsInputVisible(false);
            }}
            onChange={(e) => setInputValue(e?.target?.value ?? "")}
          />
        )}
      </div>
      {!!inputValue?.length && (
        <button onClick={resetInput} className="hover-with-active cursor-pointer ml-2 flex items-center">
          <i className="hn hn-times-circle-solid text-brand-30 text-lg leading-5" />
        </button>
      )}
      {isValidSolanaAddress(inputValue) && (
        <Link
          className={cn(
            "font-secondary text-lg leading-6 uppercase bg-brand-10 text-brand-70 px-3 py-1 hover:bg-brand-20",
            "disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-10 active:ring-brand-10",
            "active:ring-offset-2 active:ring-offset-black ml-3 flex-shrink-0",
          )}
          href={`/results/${inputValue}`}
          title="Reveal Losses"
        >
          Reveal Losses
        </Link>
      )}
    </div>
  );
};

export default AddressMevLookup;
