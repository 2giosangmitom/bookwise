export type CreateCategoryBody = {
  name: string;
  slug: string;
};

export type CreateCategoryResponse = {
  message: string;
  data: {
    categoryId: string;
  };
};

export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export type GetCategoryResponse = {
  id: string;
  name: string;
  slug: string;
  books: Array<{
    id: string;
    title: string;
    isbn: string;
  }>;
};

export type GetCategoriesResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};
