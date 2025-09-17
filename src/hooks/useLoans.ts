import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loansApi } from "../api/loans";
import { LoanRequestForm, LoanForm, LoanFilters } from "../types";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

// Loan Requests Hooks
export const useLoanRequests = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["loanRequests", page, limit],
    queryFn: () => loansApi.getLoanRequests(page, limit),
  });
};

export const useUserLoanRequests = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["loanRequests", "user", targetUserId],
    queryFn: () => loansApi.getUserLoanRequests(targetUserId!),
    enabled: !!targetUserId,
  });
};

export const useCreateLoanRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoanRequestForm) => loansApi.createLoanRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loanRequests"] });
      toast.success("Demande de prêt créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la demande");
    },
  });
};

export const useApproveLoanRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      loansApi.approveLoanRequest(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loanRequests"] });
      toast.success("Demande approuvée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'approbation de la demande");
    },
  });
};

export const useRejectLoanRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      loansApi.rejectLoanRequest(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loanRequests"] });
      toast.success("Demande rejetée");
    },
    onError: () => {
      toast.error("Erreur lors du rejet de la demande");
    },
  });
};

// Loans Hooks
export const useLoans = (filters?: LoanFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["loans", filters, page, limit],
    queryFn: () => loansApi.getLoans(filters, page, limit),
  });
};

export const useUserLoans = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["loans", "user", targetUserId],
    queryFn: () => loansApi.getUserLoans(targetUserId!),
    enabled: !!targetUserId,
  });
};

export const useLoan = (id: string) => {
  return useQuery({
    queryKey: ["loan", id],
    queryFn: () => loansApi.getLoan(id),
    enabled: !!id,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoanForm) => loansApi.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Prêt créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création du prêt");
    },
  });
};

export const useReturnLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loansApi.returnLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Livre retourné avec succès");
    },
    onError: () => {
      toast.error("Erreur lors du retour du livre");
    },
  });
};

export const useRenewLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loansApi.renewLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Prêt renouvelé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors du renouvellement du prêt");
    },
  });
};
