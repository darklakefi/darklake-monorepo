import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const truncate = (text: string, sideLength: number = 8) => {
  const leftExtraLength = 3;

  if (text.length <= sideLength * 2 + leftExtraLength) {
    return text;
  }

  return `${text.slice(0, sideLength + leftExtraLength)}...${text.slice(-sideLength)}`;
};
