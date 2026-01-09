import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import RatingService from './services';
import RatingController from './controllers';

export default function ratingHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Rating'));

  fastify.diContainer.register({
    ratingService: asClass(RatingService).singleton(),
    ratingController: asClass(RatingController).singleton()
  });
}
