import { type RouteOptions } from 'fastify';

function addRouteTags(...tags: string[]) {
  return (routeOptions: RouteOptions) => {
    routeOptions.schema = routeOptions.schema ?? {};
    routeOptions.schema.tags = [...(routeOptions.schema.tags ?? []), ...tags];
  };
}

export { addRouteTags };
