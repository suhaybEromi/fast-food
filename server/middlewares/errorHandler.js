// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
