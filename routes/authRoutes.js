module.exports = function authRoutes(app, { users }) {

  app.post("/auth/register", (req, res) => {

    const { email, password } = req.body

    // Check if user already exists

    // Add user to DB

    // Generate and return token

    res.sendStatus(500)
  })

  app.post("/auth/login", (req, res) => {

    const { email, password } = req.body

    // Check if user exists

    // Check if encrypted password is in db

    // Generate Token
    res.sendStatus(500)
  })
}
