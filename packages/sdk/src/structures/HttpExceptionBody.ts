export type HttpExceptionBody = {
  message: string | number | string[];
  error?: undefined | string;
  statusCode: number;
};
