// Normalized error the client throws so screens can map API codes to UI
// behaviour per their APP-XX §7 table without re-parsing error bodies.
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
