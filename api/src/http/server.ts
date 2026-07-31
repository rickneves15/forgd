import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '../env'
import { errorHandler } from './error-handler'
import { login } from './routes/auth/login'
import { logout } from './routes/auth/logout'
import { refresh } from './routes/auth/refresh'
import { register } from './routes/auth/register'
import { userMe } from './routes/auth/userMe'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Forgd API',
      description:
        'A collaboration and discovery platform for hardware engineering projects (electronics, electrical, mechanical, civil, aerospace, chemical). Students can browse/apply to join projects (some paid via stipend), form groups, track tasks/issues inside those groups, and build a track record (project history, peer recognition) other students can see.',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(scalarApiReference, {
  routePrefix: '/docs',
})

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

app.register(fastifyJwt, {
  secret: {
    private: env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    public: env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
  },

  sign: {
    algorithm: 'RS256',
    expiresIn: '15m',
  },
})

app.register(fastifyJwt, {
  namespace: 'refresh',

  jwtSign: 'refreshJwtSign',
  jwtVerify: 'refreshJwtVerify',

  secret: {
    private: env.REFRESH_JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    public: env.REFRESH_JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
  },

  sign: {
    algorithm: 'RS256',
    expiresIn: '30d',
  },
})

app.register(login)
app.register(logout)
app.register(refresh)
app.register(register)
app.register(userMe)

app.listen({ port: env.PORT, host: 'localhost' }).then(() => {
  console.log(`🔥 HTTP server running on http://localhost:${env.PORT}`)
  console.log(`📚 Docs available at http://localhost:${env.PORT}/docs`)
})
