const MAX_LIMIT = 100;

export const getPagination = query => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 20, 1),
    MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages: Math.max(Math.ceil(total / limit), 1),
});
