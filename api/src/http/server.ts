import { env } from '@/env'
import { buildApp } from './app'

const app = buildApp()

app.listen({ port: env.PORT, host: 'localhost' }).then(() => {
  app.log.info(`🔥 HTTP server running on http://localhost:${env.PORT}`)
  app.log.info(`📚 Docs available at http://localhost:${env.PORT}/docs`)
})
