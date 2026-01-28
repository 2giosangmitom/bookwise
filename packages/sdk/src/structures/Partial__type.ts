import type { Type } from "typia/lib/tags/Type";

/**
 * Make all properties in T optional
 */
export type Partial__type = {
  page?: undefined | (number & Type<"uint32">);
  limit?: undefined | (number & Type<"uint32">);
  search?: undefined | string;
};
export namespace Partial__type {
  /**
   * Make all properties in T optional
   */
  export type o1 = {
    page?: undefined | (number & Type<"uint32">);
    limit?: undefined | (number & Type<"uint32">);
    search?: undefined | string;
  };
  /**
   * Make all properties in T optional
   */
  export type o2 = {
    page?: undefined | (number & Type<"uint32">);
    limit?: undefined | (number & Type<"uint32">);
    search?: undefined | string;
  };
}
