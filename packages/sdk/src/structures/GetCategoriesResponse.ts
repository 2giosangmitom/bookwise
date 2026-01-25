export type GetCategoriesResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: {
    id: string;
    name: string;
    slug: string;
  }[];
};
