const jwt = require('jsonwebtoken')

const SECRET = "password1234"

function generate(data) {

  const iat = Date.now() / 1000
  const payload = {
    data,
    iat,
    exp: iat + 60 // set expiration date to 60seconds in the future
  }

  return jwt.sign(payload, SECRET, { algorithm: 'HS256' })
}

function verify(token) {
  try {
    const decoded = jwt.verify(token, SECRET)
    return { valid: true, payload: decoded }

  } catch (error) {
    return { valid: false }
  }
}

function protectedRoute(req, res, next) {

  const { authorization = "" } = req.headers
  if (authorization.length === 0) {
    res.sendStatus(401)
    return
  }
  const token = authorization.replace("Bearer ", "")

  const decodedToken = verify(token)

  if (decodedToken.valid) {
    req.decodedToken = decodedToken
    next()
  } else {
    res.sendStatus(403)
  }
}

module.exports = {
  generate,
  verify,
  protectedRoute
}
