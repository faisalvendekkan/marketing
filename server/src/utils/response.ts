import { Response } from 'express';

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const ok = (res: Response, data: unknown, message = 'OK') =>
  res.status(200).json({ success: true, message, data });

export const created = (res: Response, data: unknown, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

export const noContent = (res: Response) => res.status(204).send();

export function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function parsePageParams(q: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(q.page ?? '1'), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(q.pageSize ?? '20'), 10) || 20));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
