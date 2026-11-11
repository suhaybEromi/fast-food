import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

const mongoSanitizeOptions = {
  replaceWith: "_",
};

const sanitizeMongoObject = value => {
  if (!value || typeof value !== "object") {
    return value;
  }

  return mongoSanitize.sanitize(value, mongoSanitizeOptions);
};

export const mongoSanitizeMiddleware = (req, _res, next) => {
  sanitizeMongoObject(req.body);
  sanitizeMongoObject(req.params);
  sanitizeMongoObject(req.headers);

  const query = sanitizeMongoObject({ ...req.query });
  Object.defineProperty(req, "query", {
    value: query,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  next();
};

export const hppProtection = hpp();
