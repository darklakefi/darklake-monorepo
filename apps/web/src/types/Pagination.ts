export type PaginatedResponse<T> = {
  limit: number;
  offset: number;
  total: number;
  result: T;
};

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}
