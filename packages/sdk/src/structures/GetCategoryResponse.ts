export type GetCategoryResponse = {
  id: string;
  name: string;
  slug: string;
  books: {
    id: string;
    title: string;
    isbn: string;
  }[];
};
