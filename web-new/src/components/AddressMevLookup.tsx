"use client";

import { useEffect, useRef, useState } from "react";
import iconClose from "../../public/images/icon-close.png";
import Image from "next/image";
import { pasteFromClipboard } from "@/utils/browser";
import { isValidSolanaAddress } from "@/utils/blockchain";

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
    pasteFromClipboard((pasted) => setInputValue(pasted));
  };

  return (
    <div className="h-[50px] p-[8px] md:w-[628px] w-full flex flex-row items-center justify-between border border-brand-40 bg-brand-60">
      <div className="flex items-center flex-grow">
        <span className="text-body-2 text-brand-30 select-none mr-[13px]">&gt;</span>
        {!isInputVisible && (
          <div
            className="text-body-2 w-full text-brand-30 uppercase cursor-text"
            onClick={(ref) => {
              if (ref.currentTarget === ref.target) {
                setIsInputVisible(true);
              }
            }}
          >
            Enter or{" "}
            <button className="button-secondary" onClick={onPasteAddressClick}>
              Paste
            </button>{" "}
            Solana address...
          </div>
        )}
        {isInputVisible && (
          <input
            ref={inputRef}
            className="w-full bg-transparent min-w-0 max-w-full border-none focus:outline-none text-body-2 text-brand-20"
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
        <Image
          src={iconClose}
          onClick={resetInput}
          className="active-hover-opacity cursor-pointer ml-[8px]"
          alt="close"
        />
      )}
      {isValidSolanaAddress(inputValue) && (
        <button className="button-primary-light ml-[12px] flex-shrink-0">Reveal Losses</button>
      )}
    </div>
  );
};

export default AddressMevLookup;
