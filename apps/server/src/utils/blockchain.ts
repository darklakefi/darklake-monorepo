import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    return /[1-9A-HJ-NP-Za-km-z]{32,44}/gi.test(address) && PublicKey.isOnCurve(address);
  } catch (e) {
    console.error(e);
  }
  return false;
};

export const formatSolAmount = (amount: BigNumber.Value | bigint): number => {
  return +BigNumber(typeof amount === "bigint" ? amount.toString() : amount)
    .dividedBy(LAMPORTS_PER_SOL)
    .toFixed();
};
