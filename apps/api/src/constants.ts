import {
  apiErrorResponseSchema,
  signUpResponseSchema,
  signUpSchema,
  createAuthorSchema,
  createAuthorResponseSchema,
  deleteAuthorResponseSchema,
  createPublisherSchema,
  createPublisherResponseSchema,
  deletePublisherResponseSchema,
  createCategorySchema,
  createCategoryResponseSchema,
} from "@bookwise/shared";
import { SchemaObject } from "./types";
import z from "zod";

export const ApiErrorResponseJsonSchema = z.toJSONSchema(apiErrorResponseSchema) as SchemaObject;

export const SignUpBodyJsonSchema = z.toJSONSchema(signUpSchema) as SchemaObject;
export const SignUpResponseJsonSchema = z.toJSONSchema(signUpResponseSchema) as SchemaObject;

export const CreateAuthorBodyJsonSchema = z.toJSONSchema(createAuthorSchema) as SchemaObject;
export const CreateAuthorResponseJsonSchema = z.toJSONSchema(createAuthorResponseSchema) as SchemaObject;
export const DeleteAuthorResponseJsonSchema = z.toJSONSchema(deleteAuthorResponseSchema) as SchemaObject;

export const CreatePublisherBodyJsonSchema = z.toJSONSchema(createPublisherSchema) as SchemaObject;
export const CreatePublisherResponseJsonSchema = z.toJSONSchema(createPublisherResponseSchema) as SchemaObject;
export const DeletePublisherResponseJsonSchema = z.toJSONSchema(deletePublisherResponseSchema) as SchemaObject;

export const CreateCategoryBodyJsonSchema = z.toJSONSchema(createCategorySchema) as SchemaObject;
export const CreateCategoryResponseJsonSchema = z.toJSONSchema(createCategoryResponseSchema) as SchemaObject;
