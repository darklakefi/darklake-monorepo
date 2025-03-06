export const formatPercentage = (value: number, decimals = 2) => {
  return `${value.toFixed(decimals)}`.replace(/(?:\.0+|(\.\d*?[1-9])0+)$/, "$1"); // regex trims trailing zeros
};
