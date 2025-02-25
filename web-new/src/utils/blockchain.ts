export const isValidSolanaAddress = (address: string): boolean => {
  return /[1-9A-HJ-NP-Za-km-z]{32,44}/gi.test(address);
};
