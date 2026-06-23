const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const auth = req.headers['authorization']
  if (!auth) return res.status(401).json({ error: 'No authorization header' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid auth format' })
  try {
    req.apc = jwt.verify(parts[1], process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token' })
  }
}
