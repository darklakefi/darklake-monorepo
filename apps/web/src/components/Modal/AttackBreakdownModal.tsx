import Modal, { ModalProps } from "@/components/Modal";
import { MevAttack, MevAttackSwapType } from "@/types/Mev";
import { format } from "date-fns";
import { formatMoney, formatPercentage } from "@/utils/number";
import { cn, truncate } from "@/utils/common";

interface AttackBreakdownModalProps extends ModalProps {
  mevAttack?: MevAttack;
}

export default function AttackBreakdownModal(props: AttackBreakdownModalProps) {
  const { mevAttack } = props;

  if (!mevAttack?.transactions || !mevAttack?.solAmount) {
    return (
      <Modal title="Attack breakdown" {...props}>
        <div className="lg:w-[960px] p-5 text-brand-30">
          <p>Unable to load attack details. Please try again later.</p>
        </div>
      </Modal>
    );
  }

  const isVictimBuy = mevAttack.swapType === MevAttackSwapType.BUY;
  const solAmountLostFormatted = formatMoney(mevAttack.solAmount.lost);
  const solAmountSentFormatted = formatMoney(mevAttack.solAmount.sent);

  return (
    <Modal title="Attack breakdown" {...props}>
      <div className="lg:w-[960px]">
        <div className="uppercase text-lg leading-6 tracking-normal text-brand-30 mb-6">
          <p>Token: {mevAttack.tokenName}</p>
          <p>Date: {format(mevAttack.timestamp, "yyyy-MM-dd hh:mm OOO")}</p>
        </div>
        <div className="flex flex-row justify-between items-center p-5 bg-brand-60 mb-6">
          {[
            { title: "Total lost", value: `${solAmountLostFormatted} SOL` },
            {
              title: "Extracted",
              value: `${formatPercentage((mevAttack.solAmount.lost / mevAttack.solAmount.sent) * 100)}%`,
            },
            { title: "TX size", value: `${solAmountSentFormatted} SOL` },
          ].map((row) => (
            <div key={row.title} className="uppercase">
              <p className="text-3xl leading-9 text-brand-20">{row.value}</p>
              <p className="text-lg leading-6 tracking-normal text-brand-30">{row.title}</p>
            </div>
          ))}
        </div>
        <div className="relative">
          <span className="w-px h-full absolute left-[11.5px] max-md:hidden top-0 bg-brand-50" />
          {[
            {
              title: "Frontrun Attack",
              iconClassName: "hn-exclamation-triangle-solid",
              details:
                `Attacker ${isVictimBuy ? "buys" : "sells"} ${mevAttack.tokenName} ` +
                `tokens to drive ${isVictimBuy ? "up" : "down"} price`,
              transaction: mevAttack.transactions.frontRun,
            },
            {
              title: "Victim Transaction",
              iconClassName: "hn-refresh-solid",
              details:
                `Swap: ${isVictimBuy ? `${solAmountSentFormatted} SOL` : mevAttack.tokenName} ` +
                `→ ${isVictimBuy ? mevAttack.tokenName : `${solAmountSentFormatted} SOL`} ` +
                `– executed at ${isVictimBuy ? "inflated" : "dropped"} price`,
              transaction: mevAttack.transactions.victim,
            },
            {
              title: "Backrun Attack",
              iconClassName: "hn-exclamation-triangle-solid",
              details:
                `Attacker ${isVictimBuy ? "sells" : "buys"} ${mevAttack.tokenName} ` +
                `tokens at ${isVictimBuy ? "peak" : "floor"} price ` +
                `– value extracted: ${solAmountLostFormatted} SOL`,
              transaction: mevAttack.transactions.frontRun,
            },
          ].map((row) => (
            <div
              key={`${row.title}-${row.transaction.address}${row.transaction.address}-${row.transaction.signature}`}
              className={cn(
                "md:flex flex-row items-center w-full gap-x-2 md:mb-6 relative",
                "uppercase text-lg leading-5",
                "group",
              )}
            >
              <span className="hidden md:group-first-of-type:block absolute top-0 left-0 bg-brand-70 h-1/2 w-full" />
              <span className="hidden md:group-last-of-type:block absolute bottom-0 left-0 bg-brand-70 h-1/2 w-full" />
              <div
                className={cn(
                  "text-brand-20 md:w-[264px]",
                  "flex flex-row items-center justify-center py-5 bg-brand-70 relative",
                )}
              >
                <i className={cn("text-[22px] hn mr-4", row.iconClassName)} />
                <p>{row.title}</p>
                <span className="max-md:hidden ml-1 h-px w-20 bg-brand-50 flex-1" />
              </div>
              <div className=" text-brand-30 border border-brand-60 p-5 flex-1 relative">
                <p className="text-brand-20">{row.details}</p>
                <p>{truncate(row.transaction.signature)}</p>
                <a
                  href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${row.transaction.signature}`}
                  className="underline"
                  title="View Transaction"
                  target="_blank"
                >
                  View TX
                </a>
              </div>
              <span className="block group-last-of-type:hidden md:hidden w-px mt-4 h-8 mx-auto bg-brand-50" />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
