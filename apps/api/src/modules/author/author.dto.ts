import { tags } from "typia";

// Create author
export type CreateAuthorBody = {
  name: string;
  biography: string;
  dateOfBirth: string & tags.Format<"date">;
  dateOfDeath?: (string & tags.Format<"date">) | null;
  slug: string & tags.MinLength<1>;
};

export type CreateAuthorResponse = {
  message: string;
  data: {
    authorId: string & tags.Format<"uuid">;
  };
};

// Update author
export type UpdateAuthorBody = Partial<CreateAuthorBody>;

// Get author
export type GetAuthorResponse = Required<CreateAuthorBody> & {
  id: string & tags.Format<"uuid">;
  photoFileName: string | null;
};

// Get authors
export type GetAuthorsResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<
    Required<CreateAuthorBody> & {
      id: string & tags.Format<"uuid">;
      photoFileName: string | null;
    }
  >;
};

export type SearchAuthorsQuery = {
  page?: number & tags.Type<"uint32"> & tags.Minimum<1>;
  limit?: number & tags.Type<"uint32"> & tags.Minimum<1> & tags.Maximum<100>;
  search?: string;
};
