export type PaginatedResponse<T> = {
  limit: number;
  offset: number;
  total: number;
  result: T;
};

export enum PaginatedResponseDataLimit {
  MEV_EVENTS_LIST = 100,
}
