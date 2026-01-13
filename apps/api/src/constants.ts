import { apiErrorResponseSchema, signUpResponseSchema, signUpSchema } from "@bookwise/shared";
import { SchemaObject } from "./types";
import z from "zod";

export const ApiErrorResponseJsonSchema = z.toJSONSchema(apiErrorResponseSchema) as SchemaObject;

export const SignUpBodyJsonSchema = z.toJSONSchema(signUpSchema) as SchemaObject;
export const SignUpResponseJsonSchema = z.toJSONSchema(signUpResponseSchema) as SchemaObject;
