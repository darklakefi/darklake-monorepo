"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { groupBy } from "lodash";

import { pasteFromClipboard } from "@/utils/browser";
import { isValidSolanaAddress } from "@/utils/blockchain";
import Modal from "@/components/Modal";
import { socials, SocialType } from "@/constants/links";

import iconCloseCircle from "../../public/images/icon-close-circle.png";
import imageWaddles1 from "../../public/images/image-waddles-1.png";

const AddressMevLookup = () => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

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

  const socialsByType = groupBy(socials, "type");

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
          src={iconCloseCircle}
          onClick={resetInput}
          className="active-hover-opacity cursor-pointer ml-[8px]"
          alt="close"
        />
      )}
      {isValidSolanaAddress(inputValue) && (
        <button className="button-primary-light ml-[12px] flex-shrink-0" onClick={() => setShowResultsModal(true)}>
          Reveal Losses
        </button>
      )}
      <Modal title="MEV case file: opening soon" isOpen={showResultsModal} onClose={() => setShowResultsModal(false)}>
        <div className="flex flex-col-reverse items-center lg:flex-row gap-x-[80px] w-full lg:w-[960px]">
          <div className="flex flex-row flex-wrap gap-[16px] w-full lg:w-[530px]">
            <div className="p-[24px] bg-brand-60">
              <p className="text-heading-1 text-brand-30 uppercase">
                <span className="text-brand-20">Connect your X account</span> so I can DM you when your MEV report is
                ready.
              </p>
              <button className="button-primary-light w-full mt-[24px] text-center">Connect X Account</button>
            </div>
            <div className="p-[24px] md:w-[calc(50%-8px)] bg-brand-60">
              <p className="text-body-2 text-brand-30 uppercase">
                <span className="text-brand-20">Join our Telegram</span> channel for real-time updates on the launch
              </p>
              <a
                href={socialsByType[SocialType.TELEGRAM][0].url}
                target="_blank"
                rel="noreferrer"
                title="Join Darklake Telegram"
                className="button-secondary block mt-[24px] text-center"
              >
                Join Telegram
              </a>
            </div>
            <div className="p-[24px] md:w-[calc(50%-8px)] bg-brand-60">
              <p className="text-body-2 text-brand-30 uppercase">
                <span className="text-brand-20">Follow @darklakefi on X</span> for daily updates on our investigation
              </p>
              <a
                href={socialsByType[SocialType.TWITTER][0].url}
                target="_blank"
                rel="noreferrer"
                title="Follow Darklake on X"
                className="button-secondary block mt-[24px] text-center"
              >
                Follow on X
              </a>
            </div>
          </div>
          <Image src={imageWaddles1} alt="darklake waddles 1" className="relative lg:bottom-[-40px] hidden lg:block" />
        </div>
      </Modal>
    </div>
  );
};

export default AddressMevLookup;
