export type ApiResponse<T> = {
  message: string;
  data: T;
};

// Authentication-related API response types
export type SignInResponse = ApiResponse<{ access_token: string }>;
export type SignUpResponse = ApiResponse<{ user_id: string }>;
export type RefreshTokenResponse = ApiResponse<{ access_token: string }>;

// User-related API response types
export type MeResponse = ApiResponse<{
  user_id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  created_at: string;
  updated_at: string;
}>;

// Category-related API response types
export type Category = {
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type GetCategoriesResponse = ApiResponse<Category[]>;
