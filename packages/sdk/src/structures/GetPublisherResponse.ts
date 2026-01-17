export type GetPublisherResponse = {
  id: string;
  name: string;
  description: string;
  website: string;
  slug: string;
  photoFileName: null | string;
  books: {
    id: string;
    title: string;
    isbn: string;
  }[];
};
