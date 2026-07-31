import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { afterAll } from 'vitest'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const testDb = drizzle(pool)

// Wipes every row between tests so each test starts from a clean slate.
export const truncateAll = async () => {
  await testDb.execute(sql`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
      LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
      END LOOP;
    END $$;
  `)
}

afterAll(async () => {
  await pool.end()
})
