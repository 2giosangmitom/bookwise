import type { Type } from "typia/lib/tags/Type";

/**
 * Make all properties in T optional
 */
export type Partial__type = {
  page?: undefined | (number & Type<"uint32">);
  limit?: undefined | (number & Type<"uint32">);
  search?: undefined | string;
};
