import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '@/env'

// Explicit pool (instead of a connection string) so tests can close it after
// each file; otherwise idle connections accumulate across the suite.
const pool = new Pool({ connectionString: env.DATABASE_URL, max: 5 })

export const db = drizzle(pool, { casing: 'snake_case' })

export const closeDb = () => pool.end()
