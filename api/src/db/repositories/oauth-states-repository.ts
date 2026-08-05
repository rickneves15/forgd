import { and, eq, gt, lt } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { oauthStates } from '@/db/schema'

// How long an in-flight OAuth dance stays valid.
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000

// States are UUID v7 row ids. Anything else can't be a stored state, so it's
// rejected before it hits the DB — an attacker-controlled state must never
// become a 22P02 query error.
const stateSchema = z.uuid()

// Stores a fresh state row and returns the state value (the row id) to send
// to Google. Also purges any already-expired rows opportunistically — the
// table stays small without a scheduled job.
export const storeOAuthState = async (): Promise<string> => {
  const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS)

  const { state } = await db.transaction(async (tx) => {
    await tx.delete(oauthStates).where(lt(oauthStates.expiresAt, new Date()))
    const [{ id: state }] = await tx
      .insert(oauthStates)
      .values({ expiresAt })
      .returning({ id: oauthStates.id })
    return { state }
  })

  return state
}

// True if `state` exists and has not expired. Single-use: consuming a state
// deletes it, so a replayed callback can never succeed a second time.
export const consumeOAuthState = async (state: string): Promise<boolean> => {
  if (!stateSchema.safeParse(state).success) {
    return false
  }

  const [row] = await db
    .select({ id: oauthStates.id })
    .from(oauthStates)
    .where(
      and(
        eq(oauthStates.id, state),
        // DB is the single source of truth for expiry — a stale row is
        // unusable even if the app restarts.
        gt(oauthStates.expiresAt, new Date()),
      ),
    )
    .limit(1)

  await db.delete(oauthStates).where(eq(oauthStates.id, state))

  return row !== undefined
}
