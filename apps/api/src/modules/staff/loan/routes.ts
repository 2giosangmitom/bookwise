import StaffLoanController from './controllers';
import {
  CreateLoanSchema,
  UpdateLoanSchema,
  DeleteLoanSchema,
  GetLoansSchema,
  GetTotalLoansSchema,
  GetLoanStatusStatsSchema
} from './schemas';

export default function staffLoanRoutes(fastify: FastifyTypeBox) {
  const controller = fastify.diContainer.resolve<StaffLoanController>('staffLoanController');

  fastify.get('/', { schema: GetLoansSchema }, controller.getLoans.bind(controller));
  fastify.get('/total', { schema: GetTotalLoansSchema }, controller.getTotalLoans.bind(controller));
  fastify.get('/stats/status', { schema: GetLoanStatusStatsSchema }, controller.getStatusStats.bind(controller));
  fastify.post('/', { schema: CreateLoanSchema }, controller.createLoan.bind(controller));
  fastify.patch('/:loan_id', { schema: UpdateLoanSchema }, controller.updateLoan.bind(controller));
  fastify.delete('/:loan_id', { schema: DeleteLoanSchema }, controller.deleteLoan.bind(controller));
}
