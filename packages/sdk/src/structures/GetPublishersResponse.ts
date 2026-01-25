export type GetPublishersResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: {
    id: string;
    name: string;
    description: string;
    website: string;
    slug: string;
    photoFileName: null | string;
  }[];
};
