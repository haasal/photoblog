export type Result<T> = { ok: T; err: null } | { ok: null; err: Error };

export function Ok<T>(value: T): Result<T> {
  return { ok: value, err: null };
}

export function Err<T>(msg: string): Result<T> {
  return { ok: null, err: new Error(msg) };
}
