export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error(err);
  }

  const message =
    statusCode >= 500 && isProduction
      ? "Internal server error"
      : err.message || "Internal server error";

  const body = {
    success: false,
    message,
  };

  if (err.errors) {
    body.errors = err.errors;
  }

  res.status(statusCode).json(body);
}
