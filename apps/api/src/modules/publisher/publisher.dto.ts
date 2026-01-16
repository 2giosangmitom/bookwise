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
