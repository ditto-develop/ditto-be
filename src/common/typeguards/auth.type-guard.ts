import { hasProp, isNullableString, isRecord, isString } from './common.type-guard';
import { Request } from 'express';
import { CookiesRequest } from '../types/common.type';

export interface UserPayload {
  id: string;
}

export function isUserPayload(value: unknown): value is UserPayload {
  if (!isRecord(value)) return false;
  return isString(value.id) && isNullableString(value.email);
}

export function hasCookies(req: Request): req is CookiesRequest {
  if (!isRecord(req)) return false;
  return hasProp(req, 'cookies');
}

export function hasAccessTokenInCookies(cookies: unknown): cookies is { access_token: string } {
  if (!isRecord(cookies)) return false;
  if (!hasProp(cookies, 'access_token')) return false;
  const accessToken = cookies.access_token;
  return isString(accessToken);
}
