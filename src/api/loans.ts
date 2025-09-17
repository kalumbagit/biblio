import { Loan, LoanRequest, LoanRequestForm, LoanForm, LoanFilters, PaginatedResponse, ApiResponse } from '../types';
import { get, post, put } from './client';

export const loansApi = {
  // Loan Requests
  getLoanRequests: async (page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<LoanRequest>>> => {
    return get('/loan-requests', { page, limit });
  },

  getUserLoanRequests: async (userId: string): Promise<ApiResponse<LoanRequest[]>> => {
    return get(`/loan-requests/user/${userId}`);
  },

  createLoanRequest: async (data: LoanRequestForm): Promise<ApiResponse<LoanRequest>> => {
    return post('/loan-requests', data);
  },

  approveLoanRequest: async (id: string, message?: string): Promise<ApiResponse<LoanRequest>> => {
    return put(`/loan-requests/${id}/approve`, { message });
  },

  rejectLoanRequest: async (id: string, message?: string): Promise<ApiResponse<LoanRequest>> => {
    return put(`/loan-requests/${id}/reject`, { message });
  },

  cancelLoanRequest: async (id: string): Promise<ApiResponse<LoanRequest>> => {
    return put(`/loan-requests/${id}/cancel`);
  },

  // Loans
  getLoans: async (filters?: LoanFilters, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Loan>>> => {
    return get('/loans', { ...filters, page, limit });
  },

  getUserLoans: async (userId: string): Promise<ApiResponse<Loan[]>> => {
    return get(`/loans/user/${userId}`);
  },

  getLoan: async (id: string): Promise<ApiResponse<Loan>> => {
    return get(`/loans/${id}`);
  },

  createLoan: async (data: LoanForm): Promise<ApiResponse<Loan>> => {
    return post('/loans', data);
  },

  returnLoan: async (id: string): Promise<ApiResponse<Loan>> => {
    return put(`/loans/${id}/return`);
  },

  renewLoan: async (id: string): Promise<ApiResponse<Loan>> => {
    return put(`/loans/${id}/renew`);
  }
};