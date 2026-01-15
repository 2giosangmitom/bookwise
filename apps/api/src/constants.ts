import {
  apiErrorResponseSchema,
  signUpResponseSchema,
  signUpSchema,
  createAuthorSchema,
  createAuthorResponseSchema,
  deleteAuthorResponseSchema,
} from "@bookwise/shared";
import { SchemaObject } from "./types";
import z from "zod";

export const ApiErrorResponseJsonSchema = z.toJSONSchema(apiErrorResponseSchema) as SchemaObject;

export const SignUpBodyJsonSchema = z.toJSONSchema(signUpSchema) as SchemaObject;
export const SignUpResponseJsonSchema = z.toJSONSchema(signUpResponseSchema) as SchemaObject;

export const CreateAuthorBodyJsonSchema = z.toJSONSchema(createAuthorSchema) as SchemaObject;
export const CreateAuthorResponseJsonSchema = z.toJSONSchema(createAuthorResponseSchema) as SchemaObject;
export const DeleteAuthorResponseJsonSchema = z.toJSONSchema(deleteAuthorResponseSchema) as SchemaObject;
