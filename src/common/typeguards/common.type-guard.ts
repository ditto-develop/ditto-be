import { Binary } from '../types/common.type';

export function isObject(value: unknown): value is object {
  return !(typeof value !== 'object' || value === null);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !Array.isArray(value);
}

export function hasProp(obj: Record<string, unknown>, prop: string): boolean {
  return prop in obj;
}

export function hasBooleanProp(obj: Record<string, unknown>, prop: string): boolean {
  return hasProp(obj, prop) && isBoolean(obj[prop]);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray<T = unknown>(value: unknown): value is Array<T> {
  return isObject(value) && Array.isArray(value);
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

export function isBinary(value: unknown): value is Binary {
  return isString(value) && /^[01]+$/.test(value);
}
