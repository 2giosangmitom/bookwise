import { tags } from "typia";

export type CreatePublisherBody = {
  name: string;
  description: string;
  website: string;
  slug: string & tags.MinLength<1>;
};

export type CreatePublisherResponse = {
  message: string;
  data: {
    publisherId: string & tags.Format<"uuid">;
  };
};

export type UpdatePublisherBody = Partial<CreatePublisherBody>;

export type GetPublisherResponse = Required<CreatePublisherBody> & {
  id: string & tags.Format<"uuid">;
  photoFileName: string | null;
  books: Array<{
    id: string & tags.Format<"uuid">;
    title: string;
    isbn: string;
  }>;
};

export type GetPublishersResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<Required<CreatePublisherBody> & { id: string & tags.Format<"uuid">; photoFileName: string | null }>;
};
