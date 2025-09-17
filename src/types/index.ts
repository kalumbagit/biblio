// Enums
export enum UserRole {
  READER = "READER",
  SECRETARY = "SECRETARY",
  ADMIN = "ADMIN",
}

export enum LoanStatus {
  ACTIVE = "ACTIVE",
  RETURNED = "RETURNED",
  OVERDUE = "OVERDUE",
  LOST = "LOST",
}

export enum LoanRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export enum PenaltyType {
  LATE_RETURN = "LATE_RETURN",
  LOST_BOOK = "LOST_BOOK",
  DAMAGED_BOOK = "DAMAGED_BOOK",
}

export enum PenaltyStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  WAIVED = "WAIVED",
}

// Interfaces
export interface User {
  id: string;
  email: string;
  role: UserRole;
  address?:string;
  phone?:string;
  date_of_birth?:string;
  username?: string;
  last_name: string;
  first_name: string;
  isActive?: boolean;
  last_login?: string;
  date_joined?: string;
  is_suspended?: boolean;
  suspension_end?: string;
  suspension_start?: string;
  active_loans_count?: string;
  pending_requests_count?: string;
  unpaid_penalities_amount?: string;
}

export interface Book {
  id: string;
  isbn: string | null;
  title: string;
  image_couverture: string | null;
  summary: string | null;
  publisher: string | null;
  publication_year: number | null;
  authors: Author[];
  category: Category;
  available_copies: number;
  stocks: BookStock[];
  is_available: boolean;
}

export interface Author {
  id: string;
  books_count: number;
  full_name: string;
  birth_date: string | null;
  death_date: string | null;
}


export interface Category {
  id: string;
  books_count: number;
  name: string;
  description: string | null;
}


export interface BookStock {
  id: string;
  book_title: string;         // "book_title"
  book_isbn: string | null;   // "book_isbn"
  language: string;
  total_quantity: number;     // "total_quantity"
  available_quantity: number; // "available_quantity"
  condition_note: string;     // "condition_note"
  book: string;            // "book" → ID du livre lié
}


export interface LoanRequest {
  id: string;
  userId: string;
  bookId: string;
  requestDate: string;
  requestedDueDate: string;
  status: LoanRequestStatus;
  responseDate?: string;
  responseMessage?: string;
  processedBy?: string;
  user?: User;
  book?: Book;
}

export interface Loan {
  id: string;
  userId: string;
  bookStockId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  renewalCount: number;
  maxRenewals: number;
  notes?: string;
  createdBy: string;
  user?: User;
  bookStock?: BookStock & { book?: Book };
}

export interface Penalty {
  id: string;
  userId: string;
  loanId?: string;
  type: PenaltyType;
  amount: number;
  status: PenaltyStatus;
  description: string;
  createdDate: string;
  dueDate: string;
  paidDate?: string;
  user?: User;
}

export interface Suspension {
  id: string;
  userId: string;
  reason: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValues?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  template_name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: Record<string, any>;
  exception?: string | null;
  content_type?: string;
}

export interface PaginatedResponse<T> {
  results: T[]; // les éléments (le vrai tableau de données)
  count: number; // total des éléments
  total_pages: number; // total de pages
  current_page: number; // page actuelle
  page_size: number; // nombre d'éléments par page
  links: {
    next: string | null;
    previous: string | null;
  };
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  firstName: string;
  lastName: string;
}

export interface BookForm {
  title: string;
  author: string;
  isbn: string;
  description?: string;
  imageUrl?: string;
  publishYear: number;
  category: string;
  totalCopies: number;
}

export interface LoanRequestForm {
  bookId: string;
  requestedDueDate: string;
  notes?: string;
}

export interface LoanForm {
  userId: string;
  bookId: string;
  dueDate: string;
  notes?: string;
}

// Filter types
export interface BookFilters {
  search?: string;
  category?: string;
  author?: string;
  availability?: "all" | "available" | "unavailable";
  sortBy?: "title" | "author" | "publishYear" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface LoanFilters {
  status?: LoanStatus;
  userId?: string;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  isSuspended?: boolean;
  search?: string;
}

// CONTEXTESTYPES

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (formData: LoginForm) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
