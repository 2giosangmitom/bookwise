export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type PaginatedMeta = {
  total: number;
  totalOnPage: number;
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginatedMeta;
};

// Authentication-related API response types
export type SignInResponse = ApiResponse<{ access_token: string }>;
export type SignUpResponse = ApiResponse<{ user_id: string }>;
export type RefreshTokenResponse = ApiResponse<{ access_token: string }>;

// User-related API response types
export type User = {
  user_id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  created_at: string;
  updated_at: string;
};

export type MeResponse = ApiResponse<User>;

export type GetUsersResponse = {
  message: string;
  data: User[];
  meta: PaginatedMeta;
};

export type UpdateUserResponse = ApiResponse<User>;

// Category-related API response types
export type Category = {
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type GetCategoriesResponse = PaginatedResponse<Category>;
export type CreateCategoryResponse = ApiResponse<Category>;
export type UpdateCategoryResponse = ApiResponse<Category>;
export type DeleteCategoryResponse = ApiResponse<Pick<Category, 'category_id' | 'name'>>;
export type GetKPopularCategoriesResponse = ApiResponse<
  Array<Pick<Category, 'category_id' | 'name' | 'slug'> & { loan_count: number }>
> & {
  meta: { total_loans: number };
};

// Author-related API response types
export type Author = {
  author_id: string;
  name: string;
  short_biography: string;
  biography: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  nationality: string | null;
  image_url: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type GetAuthorsResponse = {
  message: string;
  data: Author[];
  meta: PaginatedMeta;
};

export type CreateAuthorResponse = ApiResponse<Author>;
export type UpdateAuthorResponse = ApiResponse<Author>;
export type DeleteAuthorResponse = ApiResponse<Pick<Author, 'author_id' | 'name'>>;

// Publisher-related API response types
export type Publisher = {
  publisher_id: string;
  name: string;
  website: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GetPublishersResponse = {
  message: string;
  data: Publisher[];
  meta: PaginatedMeta;
};
export type CreatePublisherResponse = ApiResponse<Publisher>;
export type UpdatePublisherResponse = ApiResponse<Publisher>;
export type DeletePublisherResponse = ApiResponse<Pick<Publisher, 'publisher_id' | 'name'>>;

// Book-related API response types
export type Book = {
  book_id: string;
  title: string;
  description: string;
  isbn: string;
  published_at: string;
  publisher_id: string | null;
  publisher_name: string | null;
  image_url: string | null;
  authors: Array<{
    author_id: string;
    name: string;
  }>;
  categories: Array<{
    category_id: string;
    name: string;
  }>;
  created_at: string;
  updated_at: string;
};

export type GetBooksResponse = {
  message: string;
  data: Book[];
  meta: PaginatedMeta;
};

export type CreateBookResponse = ApiResponse<Book>;
export type UpdateBookResponse = ApiResponse<Book>;
export type DeleteBookResponse = ApiResponse<Pick<Book, 'book_id' | 'title'>>;

// Book Clone-related API response types
export type BookClone = {
  book_clone_id: string;
  book_id: string;
  book_title: string;
  location_id: string;
  barcode: string;
  condition: 'NEW' | 'GOOD' | 'WORN' | 'DAMAGED';
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type GetBookClonesResponse = {
  message: string;
  data: BookClone[];
  meta: PaginatedMeta;
};

export type CreateBookCloneResponse = ApiResponse<BookClone>;
export type UpdateBookCloneResponse = ApiResponse<BookClone>;
export type DeleteBookCloneResponse = ApiResponse<Pick<BookClone, 'book_clone_id' | 'barcode'>>;

// Location-related API response types
export type Location = {
  location_id: string;
  room: string;
  floor: number;
  shelf: number;
  row: number;
  created_at: string;
  updated_at: string;
};

export type GetLocationsResponse = {
  message: string;
  data: Location[];
  meta: PaginatedMeta;
};

export type CreateLocationResponse = Location & {
  created_at: string;
  updated_at: string;
};

export type UpdateLocationResponse = ApiResponse<Location>;
export type DeleteLocationResponse = ApiResponse<Pick<Location, 'location_id' | 'room' | 'floor' | 'shelf' | 'row'>>;

// Loan-related API response types
export type LoanStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export type Loan = {
  loan_id: string;
  user_id: string;
  user_name: string;
  book_clone_id: string;
  book_title: string;
  barcode: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
  created_at: string;
  updated_at: string;
};

export type GetLoansResponse = {
  message: string;
  data: Loan[];
  meta: PaginatedMeta;
};

export type CreateLoanResponse = ApiResponse<Loan>;
export type UpdateLoanResponse = ApiResponse<Loan>;
export type DeleteLoanResponse = ApiResponse<Loan>;
export type GetTotalActiveLoansResponse = ApiResponse<{ total_loans: number }>;
