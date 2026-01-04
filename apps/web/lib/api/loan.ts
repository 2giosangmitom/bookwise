import { fetchApiWithAutoRefresh } from './apiClient';
import {
  GetLoansResponse,
  CreateLoanResponse,
  UpdateLoanResponse,
  DeleteLoanResponse,
  LoanStatus,
  GetTotalActiveLoansResponse,
  GetLoanStatusStatsResponse
} from './types';

export function getLoans(
  accessToken: string | null,
  query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: LoanStatus;
    user_id?: string;
  }
) {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);
  if (query?.status) params.append('status', query.status);
  if (query?.user_id) params.append('user_id', query.user_id);

  const queryString = params.toString();
  return fetchApiWithAutoRefresh<GetLoansResponse>(`/staff/loan${queryString ? `?${queryString}` : ''}`, accessToken, {
    method: 'GET'
  });
}

export function createLoan(
  accessToken: string | null,
  data: {
    user_id: string;
    book_clone_id: string;
    loan_date: string;
    due_date: string;
  }
) {
  return fetchApiWithAutoRefresh<CreateLoanResponse>('/staff/loan', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateLoan(
  accessToken: string | null,
  loanId: string,
  data: {
    loan_date?: string;
    due_date?: string;
    return_date?: string | null;
    status?: LoanStatus;
  }
) {
  return fetchApiWithAutoRefresh<UpdateLoanResponse>(`/staff/loan/${loanId}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function deleteLoan(accessToken: string | null, loanId: string) {
  return fetchApiWithAutoRefresh<DeleteLoanResponse>(`/staff/loan/${loanId}`, accessToken, {
    method: 'DELETE'
  });
}

export function getTotalLoans(accessToken: string | null, status?: LoanStatus) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const queryString = params.toString();

  return fetchApiWithAutoRefresh<GetTotalActiveLoansResponse>(
    `/staff/loan/total${queryString ? `?${queryString}` : ''}`,
    accessToken,
    {
      method: 'GET'
    }
  );
}

export function getLoanStatusStats(accessToken: string | null) {
  return fetchApiWithAutoRefresh<GetLoanStatusStatsResponse>('/staff/loan/stats/status', accessToken, {
    method: 'GET'
  });
}
