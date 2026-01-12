import { Catch, ExceptionFilter, ConflictException, InternalServerErrorException } from "@nestjs/common";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { code?: string }) {
    switch (exception.code) {
      case "23505": // unique_violation
        throw new ConflictException("Unique constraint violation");
    }

    throw new InternalServerErrorException("Database error");
  }
}
