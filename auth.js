const jwt = require('jsonwebtoken')

const SECRET = "password1234"

function generate(data) {
  const payload = {
    data,
    iat: Date.now() / 1000
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

module.exports = {
  generate,
  verify
}
