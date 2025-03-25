export const getCacheKeyWithParams = (key: string, params: string[]) => {
  return `${key}:${params.join("_")}`;
};

export enum CacheTime {
  ONE_SECOND = 1000,
  TEN_SECONDS = 10 * 1000,
  TWO_MINUTES = 2 * 60 * 1000,
  TEN_MINUTES = 10 * 60 * 1000,
  THIRTY_MINUTES = 30 * 60 * 1000,
  ONE_HOUR = 60 * 60 * 1000,
  ONE_DAY = 24 * 60 * 60 * 1000,
  ONE_YEAR = 365 * 24 * 60 * 60 * 1000,
}

export const serialize = (data) =>
  JSON.stringify(data, (key, value) => (typeof value === "bigint" ? value.toString() : value));
