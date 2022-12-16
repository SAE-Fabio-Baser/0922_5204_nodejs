const { Crypto } = require('cryptojs')
const ObjectID = require('mongodb').ObjectId
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const { generate } = require('../auth')

module.exports = function authRoutes(app, { users }) {
  app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body

    console.log(email, password, req.body)

    // Check if user already exists
    const foundUser = await users.findOne({ email })

    if (foundUser) {
      res.send({
        success: false,
        error: 'emailAlreadyInUse',
      })
      return
    }

    const hashedPassword = Crypto.SHA1(password)
    const secret = speakeasy.generateSecret({ length: 20 })
    const insterResult = await users.insertOne({
      email,
      password: hashedPassword,
      role: 1,
      '2faSecret': secret.base32,
    })

    const createdUser = await users.findOne({
      _id: ObjectID(insterResult.insertedId),
    })

    delete createdUser.password

    const totpUri = `otpauth://totp/${email}?secret=${secret.base32}&issuer=SAE_Webapp`

    qrcode.toDataURL(totpUri, (err, url) => {
      if (err) {
        console.error(err)
        res.send(500)
      }
      res.send({
        success: true,
        data: {
          token: generate({ user: createdUser }),
          user: createdUser,
          '2faQr': url,
        },
      })
    })
  })

  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body

    const foundUser = await users.findOne({ email })

    if (!foundUser) {
      res.send({
        success: false,
        error: 'noUserWithEmail',
      })
      return
    }

    const hashedPassword = Crypto.SHA1(password)
    const correctPassword = foundUser.password === hashedPassword

    delete foundUser.password

    if (correctPassword) {
      res.send({
        success: true,
        data: {
          token: generate({ user: foundUser }),
          user: foundUser,
        },
      })
    } else {
      res.send({
        success: false,
        error: 'wrongCredentials',
      })
    }
  })

  app.post('/auth/2fa/secret', (req, res) => {
    const { email = '' } = req.body
    const secret = speakeasy.generateSecret({ length: 20 })
    const totpUri = `otpauth://totp/${email}?secret=${secret.base32}&issuer=SAE_Webapp`

    qrcode.toDataURL(totpUri, (err, url) => {
      if (err) {
        console.error(err)
        res.send(500)
      }
      res.send({ secret: secret.base32, qr: url })
    })
  })

  app.post('/auth/2fa/generate', async (req, res) => {
    const { email } = req.body

    const foundUser = await users.findOne({ email })

    if (!foundUser) {
      res.send({
        success: false,
        error: 'noUserWithEmail',
      })
      return
    }
    const token = speakeasy.totp({
      secret: foundUser['2faSecret'],
      encoding: 'base32',
    })

    res.send({
      token,
      remaining: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
    })
  })

  app.post('/auth/2fa/verify', async (req, res) => {
    const { token, email } = req.body

    const foundUser = await users.findOne({ email })

    if (!foundUser) {
      res.send({
        success: false,
        error: 'noUserWithEmail',
      })
      return
    }

    const valid = speakeasy.totp.verify({
      secret: foundUser['2faSecret'],
      encoding: 'base32',
      token,
      window: 0,
    })

    res.send({ valid })
  })
}
