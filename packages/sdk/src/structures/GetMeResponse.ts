export type GetMeResponse = {
  message: string;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: null | string;
    photoFileName: null | string;
    role: "ADMIN" | "LIBRARIAN" | "MEMBER";
  };
};
