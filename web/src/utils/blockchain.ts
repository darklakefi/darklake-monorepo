import { PublicKey } from "@solana/web3.js";

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    return /[1-9A-HJ-NP-Za-km-z]{32,44}/gi.test(address) && PublicKey.isOnCurve(address);
  } catch (e) {
    //
  }
  return false;
};
