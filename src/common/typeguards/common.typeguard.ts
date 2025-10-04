export function isRecord(value: unknown): value is Record<string, unknown> {
  return !(typeof value !== 'object' || value === null || Array.isArray(value));
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullableString(value: unknown): value is string | null | undefined {
  return isString(value) || isNull(value) || isUndefined(value);
}
