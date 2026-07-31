import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Mirror the `@/*` alias from tsconfig.json. Uses process.cwd() because
    // vitest always runs from the api package root (scripts.test).
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  test: {
    environment: 'node',
  },
})
