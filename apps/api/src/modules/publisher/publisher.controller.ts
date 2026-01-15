import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { type createPublisherDTO, createPublisherSchema, type CreatePublisherResponse } from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse } from "@nestjs/swagger";
import {
  ApiErrorResponseJsonSchema,
  CreatePublisherBodyJsonSchema,
  CreatePublisherResponseJsonSchema,
} from "@/constants";

@Controller("/publisher")
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPublisherSchema))
  @ApiBody({ schema: CreatePublisherBodyJsonSchema })
  @ApiCreatedResponse({
    schema: CreatePublisherResponseJsonSchema,
    description: "Publisher has been created successfully",
  })
  @ApiConflictResponse({ schema: ApiErrorResponseJsonSchema, description: "Slug already in use" })
  @ApiBadRequestResponse({ schema: ApiErrorResponseJsonSchema, description: "Validation failed" })
  async createPublisher(@Body() body: createPublisherDTO): Promise<CreatePublisherResponse> {
    const createdPublisher = await this.publisherService.create(body);

    return {
      message: "Publisher has been created successfully",
      data: { publisherId: createdPublisher.id },
    };
  }
}
