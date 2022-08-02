const jwt = require('jsonwebtoken')

const secret = 'hansum'

const JWT = {
  generator(value,expires) {
    return jwt.sign(value, secret, {
      expiresIn: expires
    })
  },
  verify(token) {
    try {
      return jwt.verify(token, secret)
    } catch (error) {

    }
  }
}

module.exports = JWT