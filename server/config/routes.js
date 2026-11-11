import process from "node:process";

export const getRoutePrefixes = () => ({
  admin: `/${process.env.PREFIX_ROUTES_ADMIN}`,
  client: `/${process.env.PREFIX_ROUTES_CLIENT}`,
});
