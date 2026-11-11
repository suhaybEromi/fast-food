const getRequiredEnv = name => {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`${name} must be configured`);
  }

  return value;
};

export const API_URL = getRequiredEnv("VITE_API_URL");
export const IMAGE_URL = getRequiredEnv("VITE_API_URL_IMG");
