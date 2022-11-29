const express = require('express')
const { MongoClient } = require('mongodb')

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()
app.use(express.json())

function onMongoConnect(mongoClient) {
  const db = mongoClient.db('saeApp')

  const users = db.collection('users')
  const posts = db.collection('posts')

  userRoutes(app, { users })
  postRoutes(app, { posts })
  authRoutes(app, { users })
}

const credentials = { username: 'mongo', password: 'mongo' }
const mongoConnString = `mongodb+srv://${credentials.username}:${credentials.password}@cluster0.kmdytlq.mongodb.net/?retryWrites=true&w=majority`
new MongoClient(mongoConnString)
  .connect()
  .catch(console.error)
  .then(onMongoConnect)

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server startet on Port 3000')
})
