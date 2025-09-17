// src/api/apiUrls.ts

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL1 = import.meta.env.VITE_API_BASE_URL1;

export const AUTH = {
    LOGIN: `${API_BASE_URL}/auth/login/`,
    LOGOUT: `${API_BASE_URL}/auth/logout/`,
    REFRESH: `${API_BASE_URL}/auth/refresh/`,
};
export const USER = {
    REGISTER_OR_LIST: `${API_BASE_URL}/users/`,
    PROFILE: `${API_BASE_URL}/users/profile/`,
    DETAIL: (id: string) => `${API_BASE_URL}/users/${id}/`,
};

export const CATEGORIES = {
    CREATE_OR_LIST:`${API_BASE_URL}/categories/`,
    DETAIL: (id: string) => `${API_BASE_URL}/categories/${id}/`,
};

export const AUTHORS = {
    CREATE_OR_LIST:`${API_BASE_URL}/authors/`,
    DETAIL: (id: string) => `${API_BASE_URL}/authors/${id}/`,
};

export const BOOKS = {
    CREATE_OR_LIST:`${API_BASE_URL}/books/`,
    DETAIL: (id: string) => `${API_BASE_URL}/books/${id}/`,
};

export const LOANS={
    CREATE_OR_LIST:`${API_BASE_URL}/loans/`,
    DETAIL:(id:string)=>`${API_BASE_URL}/loans/${id}/`
}

export const LOAN_REQUESTS={
    CREATE_OR_LIST:`${API_BASE_URL}/loan-requests/`,
    DETAIL:(id:string)=>`${API_BASE_URL}/loan-requests/${id}/`
}

