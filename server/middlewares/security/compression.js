import compression from "compression";

export const compressionMiddleware = compression({
  filter(req, res) {
    if (req.headers["x-no-compression"] || req.path.endsWith("/events")) {
      return false;
    }

    return compression.filter(req, res);
  },
});
