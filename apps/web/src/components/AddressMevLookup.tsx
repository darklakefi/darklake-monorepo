"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { groupBy } from "lodash";

import { pasteFromClipboard } from "@/utils/browser";
import { isValidSolanaAddress } from "@/utils/blockchain";
import Modal from "@/components/Modal";
import { socials, SocialType } from "@/constants/links";
import { signInWithTwitter } from "@/services/supabase";
import useSupabaseSession from "@/hooks/useSupabaseSession";
import { LocalStorage } from "@/constants/storage";
import { cn } from "@/utils/common";
import Button from "@/components/Button";

const AddressMevLookup = () => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const supabaseSession = useSupabaseSession();

  const resetInput = () => {
    setInputValue("");
    setIsInputVisible(false);
  };

  useEffect(() => {
    if (isInputVisible) {
      inputRef.current?.focus();
    }
  }, [isInputVisible, inputRef]);

  useEffect(() => {
    if (!supabaseSession) {
      return;
    }

    const signInInitiated = localStorage.getItem(LocalStorage.SIGN_IN_INITIATED);
    if (!signInInitiated?.length) {
      return;
    }

    setShowResultsModal(true);
    localStorage.removeItem(LocalStorage.SIGN_IN_INITIATED);
  }, [supabaseSession]);

  const onPasteAddressClick = () => {
    pasteFromClipboard((pasted) => setInputValue(pasted.trim()));
    setIsInputVisible(true);
  };

  const socialsByType = groupBy(socials, "type");

  const onConnectTwitterCLick = async () => {
    if (isConnectingTwitter) return;
    setIsConnectingTwitter(true);

    await signInWithTwitter();
    localStorage.setItem(LocalStorage.LOOKUP_ADDRESS, inputValue);

    setIsConnectingTwitter(false);
  };
  const connectWithTwitterDisabled = isConnectingTwitter || !!supabaseSession;

  return (
    <div
      className={cn(
        "h-12 p-2 md:max-w-2xl w-full flex flex-row items-center justify-between border border-brand-40 bg-brand-60",
      )}
    >
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
        <button
          className={cn(
            "font-secondary text-lg leading-6 uppercase bg-brand-10 text-brand-70 px-3 py-1 hover:bg-brand-20",
            "disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-10 active:ring-brand-10",
            "active:ring-offset-2 active:ring-offset-black ml-3 flex-shrink-0",
          )}
          onClick={() => setShowResultsModal(true)}
        >
          Reveal Losses
        </button>
      )}
      <Modal title="MEV case file: opening soon" isOpen={showResultsModal} onClose={() => setShowResultsModal(false)}>
        <div className="flex flex-col-reverse items-center lg:flex-row gap-x-20 w-full max-w-full lg:max-w-4xl">
          <div className="flex flex-row flex-wrap gap-4 w-full lg:w-[530px]">
            <div className="p-6 bg-brand-60">
              <h1 className="font-primary text-3xl leading-3xl text-brand-30 uppercase">
                <span className="text-brand-20">Connect your X account</span> so I can DM you when your MEV report is
                ready.
              </h1>
              <button
                className={cn(
                  "font-secondary text-lg leading-6 uppercase bg-brand-10 text-brand-70 px-3 py-1",
                  "hover:bg-brand-20 disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-10",
                  "active:ring-brand-10 active:ring-offset-2 active:ring-offset-black w-full mt-6 text-center",
                )}
                onClick={onConnectTwitterCLick}
                disabled={connectWithTwitterDisabled}
              >
                {supabaseSession
                  ? `Connected as @${supabaseSession.user.user_metadata?.preferred_username}`
                  : "Connect X Account"}
              </button>
            </div>
            <div className="p-6 md:w-[calc(50%-8px)] bg-brand-60">
              <p className="font-secondary text-lg leading-6 text-brand-30 uppercase">
                <span className="text-brand-20">Join our Telegram</span> channel for real-time updates on the launch
              </p>
              <a
                href={socialsByType[SocialType.TELEGRAM][0].url}
                target="_blank"
                rel="noreferrer"
                title="Join Darklake Telegram"
                className={cn(
                  "font-secondary text-lg leading-6 uppercase underline bg-brand-50 text-brand-20 px-3 py-1",
                  "hover:text-brand-10 disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-50",
                  "active:ring-brand-20 active:ring-offset-2 active:ring-offset-black; block mt-[24px] text-center",
                )}
              >
                Join Telegram
              </a>
            </div>
            <div className="p-6 md:w-[calc(50%-8px)] bg-brand-60">
              <p className="font-secondary text-lg leading-6 text-brand-30 uppercase">
                <span className="text-brand-20">Follow @darklakefi on X</span> for daily updates on our investigation
              </p>
              <a
                href={socialsByType[SocialType.TWITTER][0].url}
                target="_blank"
                rel="noreferrer"
                title="Follow Darklake on X"
                className={cn(
                  "bg-brand-50 text-brand-20 px-3 py-1 block mt-6",
                  "font-secondary text-lg leading-6 uppercase underline text-center",
                  "hover:text-brand-10 disabled:opacity-50 focus:outline-none",
                  "active:ring-1 active:bg-brand-50 active:ring-brand-20 active:ring-offset-2 active:ring-offset-black",
                )}
              >
                Follow on X
              </a>
            </div>
          </div>
          <Image
            src="/images/image-waddles-1.png"
            alt="darklake waddles 1"
            width={350}
            height={430}
            className="relative lg:bottom-[-40px] hidden lg:block"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AddressMevLookup;
