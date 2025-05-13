"use client";

import Button from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import { GetMevTotalExtractedResponse } from "@/types/Mev";
import { cn } from "@/utils/common";
import { formatMoney } from "@/utils/number";
import { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

enum ImageSaveStatus {
  IDLE = "IDLE",
  SAVING = "SAVING",
  SAVED = "SAVED",
  ERROR = "ERROR",
}

const saveImageButtonText = (imageSaveStatus: ImageSaveStatus) => {
  switch (imageSaveStatus) {
    case ImageSaveStatus.SAVING:
      return "Saving Image...";
    case ImageSaveStatus.SAVED:
      return "Image Saved to Clipboard";
    case ImageSaveStatus.ERROR:
      return "Error";
    default:
      return "Share your MEV loss";
  }
};

export interface TotalExtractedProps {
  address: string;
  mevAttackResults: GetMevTotalExtractedResponse;
}

export default function TotalExtracted({ address, mevAttackResults }: TotalExtractedProps) {
  const [imageSaveStatus, setImageSaveStatus] = useState<ImageSaveStatus>(ImageSaveStatus.IDLE);

  const { processingBlocks } = mevAttackResults;
  const totalSolExtracted = mevAttackResults?.data?.totalSolExtracted ?? 0;
  const totalUsdExtracted = mevAttackResults?.data?.totalUsdExtracted;
  const solAmountFormatted = formatMoney(totalSolExtracted);
  const solAmountParts = solAmountFormatted.split(".");
  const progress = processingBlocks ? (processingBlocks.completed / processingBlocks.total) * 100 : 0;

  async function copyImageToClipboard(event: React.MouseEvent<HTMLButtonElement>, address: string) {
    event.preventDefault();
    setImageSaveStatus(ImageSaveStatus.SAVING);

    const imageToSave = new ClipboardItem({
      "image/png": fetch(`/api/generate-mev-share-image?address=${address}`)
        .then((response) => response.blob())
        .then((blob) => new Blob([blob], { type: "image/png" })),
    });
    navigator.clipboard.write([imageToSave]);
    toast.success("Image saved to clipboard");
    setImageSaveStatus(ImageSaveStatus.SAVED);
  }

  return (
    <div className={cn("bg-brand-10 p-6 shadow-3xl shadow-brand-80", "text-brand-30 uppercase font-primary text-3xl")}>
      <p>Total Extracted</p>
      <div className="text-brand-70 h-[88px] flex flex-col justify-end">
        <p>
          <span className="text-[100px]">{solAmountParts[0]}</span>
          {!!solAmountParts[1] && `.${solAmountParts[1]}`} SOL
        </p>
      </div>
      {totalUsdExtracted && <p>{formatMoney(totalUsdExtracted)} USDC</p>}
      {!processingBlocks && (
        <Button className="w-full mt-8 flex flex-row items-center gap-3" disabled>
          <Image priority src="/images/loading.svg" alt="Loading" width={24} height={24} className="animate-spin" />
          Analyzing blockchain evidence
        </Button>
      )}
      {!!processingBlocks && progress !== 100 && processingBlocks.total > 0 && (
        <div className="mt-8">
          <ProgressBar progress={progress} />
          <div className="mt-1 font-secondary text-lg flex flex-row justify-between">
            <span>&gt; Analyzing blocks:</span>
            <span>
              {processingBlocks.completed}/{processingBlocks.total} ({Math.floor(progress)}%)
            </span>
          </div>
        </div>
      )}
      {(progress > 50 && totalSolExtracted > 0) || (progress > 80) && (
        <Button className="w-full mt-8" onPointerDown={async (event) => await copyImageToClipboard(event, address)}>
          {saveImageButtonText(imageSaveStatus)}
        </Button>
      )}
    </div>
  );
}
