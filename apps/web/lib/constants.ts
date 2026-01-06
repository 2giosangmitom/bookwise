export const API_BASE_URL = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return process.env.API_URL;
};
