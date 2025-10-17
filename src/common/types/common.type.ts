import { type Request } from 'express';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CookiesRequest = Request & { cookies: unknown };

export type Binary = string;
