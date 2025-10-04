import { isNullableString, isRecord, isString } from './common.typeguard';

export interface UserPayload {
  id: string;
  email?: string | null;
}

export function isUserPayload(value: unknown): value is UserPayload {
  if (!isRecord(value)) return false;
  return isString(value.id) && isNullableString(value.email);
}
