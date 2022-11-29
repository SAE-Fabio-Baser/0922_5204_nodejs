const { Crypto } = require("cryptojs")
const { generate } = require("../auth")

module.exports = function authRoutes(app, { users }) {

  app.post("/auth/register", async (req, res) => {

    const { email, password } = req.body

    // Check if user already exists
    const foundUser = await users.findOne({ email })

    if (foundUser) {
      res.send({
        success: false,
        error: "emailAlreadyInUse"
      })
      return
    }

    const hashedPassword = Crypto.SHA1(password)
    await users.insertOne({ email, password: hashedPassword })

    res.send({
      success: true,
      data: {
        token: generate({ email })
      }
    })
  })

  app.post("/auth/login", async (req, res) => {

    const { email, password } = req.body

    const foundUser = await users.findOne({ email })

    if (!foundUser) {
      res.send({
        success: false,
        error: "noUserWithEmail"
      })
      return
    }

    const hashedPassword = Crypto.SHA1(password)
    const correctPassword = foundUser.password === hashedPassword

    if (correctPassword) {
      res.send({
        success: true,
        data: {
          token: generate({ email })
        }
      })
    } else {
      res.send({
        success: false,
        error: "wrongCredentials"
      })
    }
  })
}
