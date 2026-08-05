// Postgres unique violation — a racing concurrent request already created the
// row (double-tap / retry), treated as "already exists". Drizzle wraps the pg
// error in a DrizzleQueryError with the code on `cause`.
export const isUniqueViolation = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const e = error as { code?: unknown; cause?: { code?: unknown } }
  return e.code === '23505' || e.cause?.code === '23505'
}
