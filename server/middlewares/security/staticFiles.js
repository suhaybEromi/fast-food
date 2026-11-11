import { isProduction } from "../../utils/cookies.js";

export const getUploadStaticOptions = () => ({
  dotfiles: "deny",
  etag: true,
  fallthrough: false,
  index: false,
  maxAge: isProduction() ? "7d" : 0,
  setHeaders(res) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Cache-Control",
      isProduction() ? "public, max-age=604800" : "no-store",
    );
  },
});
