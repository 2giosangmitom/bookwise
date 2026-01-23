export type CreateUserBody = {
  email: string;
  firstName: string;
  lastName?: string | null;
};

export type GetMeResponse = {
  message: string;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    photoFileName: string | null;
    role: string;
  };
};
