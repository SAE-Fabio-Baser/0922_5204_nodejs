
const { protectedRoute } = require("../auth")

function usersRoutes(app, { users }) {
  // Create
  app.post('/api/users/create', protectedRoute, async (req, res) => {
    const { username, email = '' } = req.body

    if (!username) {
      res.sendStatus(400)
      return
    }

    const createdUser = await users.insertOne({
      username,
      email,
    })

    res.send(createdUser)
  })

  // Read
  app.get('/api/users', protectedRoute, async (req, res) => {
    const allUsers = await users.find().toArray()

    res.send(allUsers)
  })

  // Update
  app.put('/api/users/:username', protectedRoute, async (req, res) => {
    const { username } = req.params
    const { email } = req.body

    const foundUser = await users.findOne({ username })

    if (!foundUser) {
      res.sendStatus(404)
      return
    }

    const updateResult = await users
      .updateOne({ username }, { $set: { email } })
      .catch(console.error)

    res.send(updateResult)
  })

  // Delete
  app.delete('/api/users/:username', protectedRoute, async (req, res) => {
    const { username } = req.params

    const foundUser = await users.findOne({ username })

    if (!foundUser) {
      res.sendStatus(404)
      return
    }

    const deleteResult = users.deleteOne({ username })

    res.send(deleteResult)
  })
}

module.exports = usersRoutes
