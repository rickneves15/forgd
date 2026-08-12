const PREFIX = '@forge:'

export function storageKey(name: string): string {
  return `${PREFIX}${name}`
}

export const storageKeys = {
  accessToken: storageKey('access-token'),
  refreshToken: storageKey('refresh-token'),
}
