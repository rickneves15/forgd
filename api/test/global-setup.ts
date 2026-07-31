import path from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { setTestEnv, TEST_DATABASE_URL } from './env'

// Creates the `forgd_test` database if missing and runs all drizzle
// migrations. Runs once per test run, in the main vitest process. Returns a
// teardown that drops the test database after the run.
export default async function setup() {
  setTestEnv()

  const adminClient = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  })

  const dbName = 'forgd_test'
  const exists = await adminClient.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName],
  )

  if (exists.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${dbName}`)
  }

  await adminClient.end()

  const pool = new Pool({ connectionString: TEST_DATABASE_URL })
  const db = drizzle(pool)

  await migrate(db, {
    migrationsFolder: path.resolve(process.cwd(), 'src/db/migrations'),
  })

  await pool.end()

  return async () => {
    const teardownClient = new Pool({
      connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
    })

    await teardownClient.query(
      'DROP DATABASE IF EXISTS forgd_test WITH (FORCE)',
    )

    await teardownClient.end()
  }
}
