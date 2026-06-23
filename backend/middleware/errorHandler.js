const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, err.stack || err.message)
  const status = err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' && status === 500 ? 'Internal server error' : err.message
  res.status(status).json({ error: message })
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = { errorHandler, asyncHandler }
