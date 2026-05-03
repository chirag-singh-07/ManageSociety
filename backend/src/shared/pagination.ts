import { env } from '../config/env';

export interface PaginationInput {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationInput {
  const pageRaw = Number(query.page ?? 1);
  const limitRaw = Number(query.limit ?? env.PAGINATION_DEFAULT_LIMIT);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0
    ? Math.min(Math.floor(limitRaw), env.PAGINATION_MAX_LIMIT)
    : env.PAGINATION_DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
