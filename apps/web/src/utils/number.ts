export const removeTrailingZeros = (value: string | number) => {
  return `${value}`.replace(/(?:\.0+|(\.\d*?[1-9])0+)$/, "$1");
};

export const formatPercentage = (value: number, decimals = 2) => {
  return removeTrailingZeros(value.toFixed(decimals));
};

export const formatMoney = (value: number, maximumFractionDigits = 2) => {
  const numValue = Number(value) || 0;

  if (numValue > 0 && numValue < 0.0001) {
    return Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 4,
    }).format(0.0001);
  }

  if (numValue >= 0.0001 && numValue < 0.01) {
    maximumFractionDigits = 4;
  }

  return Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits,
  }).format(numValue);
};
