export type CreatePublisherBody = {
  name: string;
  description: string;
  website: string;
  slug: string;
};

export type CreatePublisherResponse = {
  message: string;
  data: {
    publisherId: string;
  };
};

export type UpdatePublisherBody = Partial<CreatePublisherBody>;

export type GetPublisherResponse = {
  id: string;
  name: string;
  description: string;
  website: string;
  slug: string;
  photoFileName: string | null;
  books: Array<{
    id: string;
    title: string;
    isbn: string;
  }>;
};

export type GetPublishersResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<{
    id: string;
    name: string;
    description: string;
    website: string;
    slug: string;
    photoFileName: string | null;
  }>;
};
