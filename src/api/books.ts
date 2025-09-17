import { Book, BookForm, PaginatedResponse, ApiResponse } from "../types";

import axiosAuth from "./authenticatedAxios";

import { BOOKS } from "../utils/apiUrls";

export const booksApi = {
  getBooks: async (): Promise<ApiResponse<PaginatedResponse<Book>>> => {
    const response = await axiosAuth.get(BOOKS.CREATE_OR_LIST);
    return response;
  },

  getBook: async (id: string): Promise<ApiResponse<Book>> => {
    const response = await axiosAuth.get(BOOKS.DETAIL(id));
    console.log("voici la response d'un livre", response.data);
    return response;
  },

  createBook: async (data: BookForm): Promise<ApiResponse<Book>> => {
    const response = await axiosAuth.post(BOOKS.CREATE_OR_LIST, data);
    return response.data;
  },

  updateBook: async (
    id: string,
    data: Partial<BookForm>
  ): Promise<ApiResponse<Book>> => {
    const response = await axiosAuth.put(BOOKS.DETAIL(id), data);
    return response.data;
  },

  deleteBook: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosAuth.delete(BOOKS.DETAIL(id));
    return response.data;
  },

  searchBooks: async (query: string): Promise<ApiResponse<Book[]>> => {
    const response = axiosAuth.get("/books/search", { params: { q: query } });
    return (await response).data;
  },
};
