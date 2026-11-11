export const noStoreApiResponses = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
};
