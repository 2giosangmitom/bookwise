import { BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodError } from "zod";

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError) {
    const errors = exception.issues.map((issue) => `${issue.path.join(", ")}: ${issue.message}`).join(" / ");

    throw new BadRequestException(errors);
  }
}
