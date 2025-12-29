import { fastify } from 'fastify';
import { fastifyAutoload } from '@fastify/autoload';
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import ConfigService from './config/configService';

export async function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty'
            }
    }
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  const configService = new ConfigService(app);
  await configService.registerPlugin();

  const config = configService.env;

  // Load all plugins from the plugins directory
  await app.register(fastifyAutoload, {
    dir: `${import.meta.dirname}/plugins`,
    options: config,
    encapsulate: false
  });

  // Load all modules from the modules directory
  await app.register(fastifyAutoload, {
    dir: `${import.meta.dirname}/modules`,
    encapsulate: true,
    ignorePattern: /.*.(ts|js)/,
    indexPattern: /routes.(ts|js)/,
    autoHooks: true,
    autoHooksPattern: /autohooks.(ts|js)/,
    cascadeHooks: true,
    options: {
      prefix: '/api'
    }
  });

  return app;
}
