import {
  consumeOAuthState,
  storeOAuthState,
} from '@/db/repositories/oauth-states-repository'

type StoreCallback = (err: Error | null, state: string) => void
type VerifyCallback = (err: Error | null, ok: boolean, state: string) => void

/**
 * passport-oauth2's StateStore backed by the `oauth_states` table. The "state
 * session" of the OAuth dance lives in the DB, so the API stays sessionless
 * between requests — no cookies, no @fastify/session.
 *
 * The state is opaque: the row id itself. Storing persists it, verifying
 * consumes it (single-use, TTL-enforced by the repository), and an unknown or
 * replayed state fails the dance.
 *
 * NOTE: passport-oauth2 dispatches on `fn.length`, so these methods must keep
 * exactly these arities (see strategy.js). The `meta` argument is present in
 * the interface but unused here.
 */
export class GoogleOAuthStateStore {
  store(_req: unknown, metaOrStored: unknown, stored?: StoreCallback): void {
    const callback = stored ?? (metaOrStored as StoreCallback)

    void storeOAuthState()
      .then((state) => callback(null, state))
      .catch((err) => callback(err as Error, ''))
  }

  verify(
    _req: unknown,
    state: string,
    metaOrCb: unknown,
    cb?: VerifyCallback,
  ): void {
    const callback = cb ?? (metaOrCb as VerifyCallback)

    void consumeOAuthState(state)
      .then((ok) => callback(null, ok, state))
      .catch((err) => callback(err as Error, false, state))
  }
}
