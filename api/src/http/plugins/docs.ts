import { fastifySwagger } from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

// fastify-plugin: swagger must see every route registered on the root app.
export const docs = fastifyPlugin(async (app: FastifyInstance) => {
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
})
