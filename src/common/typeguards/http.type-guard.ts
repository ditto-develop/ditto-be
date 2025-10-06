import { ApiResponse } from '../dtos/api-response.dto';
import { hasBooleanProp, isRecord, isString, isArray } from './common.type-guard';

export function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T> {
  if (!isRecord(value)) return false;

  return hasBooleanProp(value, 'success');
}

export function isHttpErrorBody(obj: unknown): obj is { message?: string | string[]; code?: string } {
  if (!isRecord(obj)) return false;
  const m = obj['message'];
  if (m === undefined) return true;
  return isString(m) || (isArray(m) && m.every(isString));
}
