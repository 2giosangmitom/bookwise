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
