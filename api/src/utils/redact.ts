const SENSITIVE_KEY_PATTERN = /(?:password|token|authorization|secret|cookie)$/i

export const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redact)
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}

    for (const [key, nested] of Object.entries(value)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? '[redacted]'
        : redact(nested)
    }

    return result
  }

  return value
}
