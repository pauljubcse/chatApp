const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.JWT_SECRET // Store this securely!
console.log(SECRET_KEY)
const generateToken = user => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h'
  })
}
const verifyToken = token => {
  return jwt.verify(token, SECRET_KEY)
}
module.exports = { generateToken, verifyToken }
