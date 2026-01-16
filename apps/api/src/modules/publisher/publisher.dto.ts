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

export type DeletePublisherResponse = {
  message: string;
  data: {
    name: string;
    description: string;
    website: string;
    slug: string;
    photoFileName: string | null;
  };
};
