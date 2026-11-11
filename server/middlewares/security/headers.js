import helmet from "helmet";

import { isProduction } from "../../utils/cookies.js";

const createSecurityHeaders = () =>
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    strictTransportSecurity: isProduction()
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
        }
      : false,
  });

let securityHeadersMiddleware;

export const securityHeaders = (req, res, next) => {
  securityHeadersMiddleware ||= createSecurityHeaders();
  return securityHeadersMiddleware(req, res, next);
};
