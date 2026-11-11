import process from "node:process";

export const configureTrustProxy = app => {
  if (!process.env.TRUST_PROXY) {
    return;
  }

  const trustProxy = Number(process.env.TRUST_PROXY);

  app.set(
    "trust proxy",
    Number.isFinite(trustProxy) ? trustProxy : process.env.TRUST_PROXY,
  );
};
