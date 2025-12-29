import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffLoanService from './services';
import StaffLoanController from './controllers';

export default function staffLoanHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Loan'));

  fastify.diContainer.register({
    staffLoanService: asClass(StaffLoanService).singleton(),
    staffLoanController: asClass(StaffLoanController).singleton()
  });
}
