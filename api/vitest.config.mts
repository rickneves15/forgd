import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Mirror the `@/*` alias from tsconfig.json. Uses process.cwd() because
    // vitest always runs from the api package root (scripts.test).
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@test': path.resolve(process.cwd(), 'test'),
    },
  },
  test: {
    environment: 'node',
    // Every test file shares the same `forgd_test` database and wipes it in
    // beforeEach, so files must run one at a time. maxWorkers: 1 makes the
    // serialization explicit (single worker, no scheduler races).
    fileParallelism: false,
    maxWorkers: 1,
    // Sets env vars (test DB URL + RSA keys) before any test module imports.
    setupFiles: ['./test/setup-env.ts'],
    // Creates + migrates the `forgd_test` database once per run (its teardown
    // drops the database afterwards).
    globalSetup: ['./test/global-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/db/migrations/**',
        'src/@types/**',
        'src/http/server.ts',
        'src/**/*.test.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
})
