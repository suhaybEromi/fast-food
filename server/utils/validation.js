import mongoose from "mongoose";

export const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const cleanString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

export const requireString = (value, label, max = 220) => {
  const text = cleanString(value);

  if (!text) {
    throw createHttpError(`${label} is required`);
  }

  if (text.length > max) {
    throw createHttpError(`${label} must be ${max} characters or less`);
  }

  return text;
};

export const optionalString = (value, max = 220) => {
  const text = cleanString(value);

  if (text.length > max) {
    throw createHttpError(`Value must be ${max} characters or less`);
  }

  return text;
};

export const requireNumber = (value, label, { min = 0, max = Infinity } = {}) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw createHttpError(`${label} must be between ${min} and ${max}`);
  }

  return number;
};

export const requireEnum = (value, allowed, label) => {
  if (!allowed.includes(value)) {
    throw createHttpError(`${label} is invalid`);
  }

  return value;
};

export const requireObjectId = (value, label = "ID") => {
  if (!mongoose.isValidObjectId(value)) {
    throw createHttpError(`${label} is invalid`);
  }

  return value;
};

export const normalizeCouponCode = code =>
  cleanString(code).toUpperCase().replace(/\s+/g, "");
