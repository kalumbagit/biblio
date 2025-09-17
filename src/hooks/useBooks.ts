import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { booksApi } from "../api/books";
import { BookForm, BookFilters } from "../types";
import toast from "react-hot-toast";

export const useBooks = (filters?: BookFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["books", filters, page, limit],
    queryFn: () => booksApi.getBooks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => booksApi.getBook(id),
    enabled: !!id,
  });
};

export const useSearchBooks = (query: string) => {
  return useQuery({
    queryKey: ["books", "search", query],
    queryFn: () => booksApi.searchBooks(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookForm) => booksApi.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Livre créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création du livre");
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookForm> }) =>
      booksApi.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Livre modifié avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la modification du livre");
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => booksApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Livre supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du livre");
    },
  });
};
