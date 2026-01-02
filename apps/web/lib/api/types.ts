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
