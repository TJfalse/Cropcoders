// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  // Log error
  console.error(`Error ${status}: ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Send error response
  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
