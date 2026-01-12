import { BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodError } from "zod";

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError) {
    throw new BadRequestException(
      exception.issues.map((issue) => `${issue.path.join(", ")}: ${issue.message}`).join(" / "),
    );
  }
}
