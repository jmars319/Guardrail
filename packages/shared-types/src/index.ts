export type Brand<TValue, TName extends string> = TValue & {
  readonly __brand: TName;
};

export type EntityId<TName extends string> = Brand<string, `${TName}Id`>;
export type IsoTimestamp = Brand<string, "IsoTimestamp">;
export type RuntimeSurface = "desktop" | "web" | "mobile";

export type Result<TValue, TError extends string> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };
