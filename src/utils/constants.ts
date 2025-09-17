export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BOOKS: '/books',
  BOOK_DETAIL: '/books/:id',
  ABOUT: '/about',
  
  // Reader routes
  DASHBOARD: '/dashboard',
  REQUESTS: '/requests',
  NEW_REQUEST: '/requests/new',
  LOANS: '/loans',
  LOAN_DETAIL: '/loans/:id',
  PROFILE: '/profile',
  
  // Secretary routes
  SECRETARY_REQUESTS: '/secretary/requests',
  SECRETARY_LOANS_CREATE: '/secretary/loans/create',
  SECRETARY_BOOKS: '/secretary/books',
  
  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_AUDIT: '/admin/audit'
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language'
} as const;

export const LOAN_DURATION_DAYS = 14;
export const MAX_RENEWALS = 2;
export const MAX_CONCURRENT_LOANS = 5;

export const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Mystery',
  'Romance',
  'Fantasy',
  'Educational',
  'Reference',
  'Children'
] as const;

export const PENALTY_RATES = {
  LATE_RETURN: 0.5, // per day
  LOST_BOOK: 25, // fixed amount
  DAMAGED_BOOK: 10 // fixed amount
} as const;