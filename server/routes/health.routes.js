import process from "node:process";

export const registerHealthRoutes = app => {
  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      status: "ok",
      uptime: process.uptime(),
    });
  });
};
