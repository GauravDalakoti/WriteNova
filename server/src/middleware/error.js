export const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  if (err.code === 11000) { status = 409; message = 'An account with this email already exists.'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors)[0].message; }
  if (err.name === 'CastError') { status = 404; message = 'Not found'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
