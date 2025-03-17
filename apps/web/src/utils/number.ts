export const removeTrailingZeros = (value: string | number) => {
  return `${value}`.replace(/(?:\.0+|(\.\d*?[1-9])0+)$/, "$1");
};

export const formatPercentage = (value: number, decimals = 2) => {
  return removeTrailingZeros(value.toFixed(decimals));
};

export const formatMoney = (value: number) => {
  return Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
  }).format(value);
};
