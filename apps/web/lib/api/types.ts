export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    total: number;
  };
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
  meta: {
    total: number;
  };
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
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
    };
    items: Author[];
  };
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
  meta: {
    total: number;
  };
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
  categories: string[];
  created_at: string;
  updated_at: string;
};

export type GetBooksResponse = {
  message: string;
  data: Book[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

export type CreateBookResponse = ApiResponse<Book>;
export type UpdateBookResponse = ApiResponse<Book>;
export type DeleteBookResponse = ApiResponse<Pick<Book, 'book_id' | 'title'>>;
