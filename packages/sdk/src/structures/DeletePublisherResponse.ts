export type DeletePublisherResponse = {
  message: string;
  data: {
    name: string;
    description: string;
    website: string;
    slug: string;
    photoFileName: null | string;
  };
};
