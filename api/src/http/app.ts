import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '@/env'
import { errorHandler } from './error-handler'
import { docs } from './plugins/docs'
import { jwt } from './plugins/jwt'
import { logging, loggingConfig } from './plugins/logging'
import { security } from './plugins/security'
import { login } from './routes/auth/login'
import { logout } from './routes/auth/logout'
import { refresh } from './routes/auth/refresh'
import { register } from './routes/auth/register'
import { userMe } from './routes/auth/userMe'
import { health } from './routes/health'

type BuildAppOptions = {
  logger?: boolean
}

export const buildApp = (options: BuildAppOptions = {}) => {
  const app = fastify({
    ...loggingConfig(options.logger !== false),
    // Behind Railway's reverse proxy, trust X-Forwarded-For so rate limiting
    // keys on the real client IP. In dev/test there's no proxy and spoofing
    // isn't a concern.
    trustProxy: env.NODE_ENV === 'production',
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setErrorHandler(errorHandler)

  app.setNotFoundHandler((request, reply) => {
    request.log.warn(
      { method: request.method, url: request.url },
      'Route not found',
    )

    return reply.status(404).send({
      code: 'NOT_FOUND',
      message: 'Route not found',
    })
  })

  app.register(logging)
  app.register(docs)
  app.register(jwt)
  app.register(security)

  app.register(login)
  app.register(logout)
  app.register(refresh)
  app.register(register)
  app.register(userMe)
  app.register(health)

  return app
}
