import { ApiResponse } from '../dtos/api-response.dto';
import { hasBooleanProp, isRecord } from './common.type-guard';

export function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T> {
  if (!isRecord(value)) return false;

  return hasBooleanProp(value, 'success');
}

