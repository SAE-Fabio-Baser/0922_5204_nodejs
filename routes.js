const { MongoClient } = require("mongodb")

const credentials = { username: "mongo", password: "mongo"}
const mongoConnString = `mongodb+srv://${credentials.username}:${credentials.password}@cluster0.kmdytlq.mongodb.net/?retryWrites=true&w=majority`

function registerRoutes(app) {

    let usersColl = null

    const mongoClient = new MongoClient(mongoConnString)
    mongoClient.connect()
        .catch(console.error)
        .then(() => {
            console.log("connected to mongo")
            const db = mongoClient.db("saeApp")
            usersColl = db.collection("users")
        })

    //Create
    app.post("/api/users/create", async (req, res) => {
        const { username, email = "" } = req.body

        if (!username) {
            res.sendStatus(400)
            return
        }

        const createdUser = await usersColl.insertOne({
            username,
            email
        })

        res.send(createdUser)
    })

    //Read
    app.get("/api/users", async (req, res) => {

        const allUsers = await usersColl.find().toArray()

        res.send(allUsers)
    })

    //Update
    app.put("/api/users/:username", async (req, res) => {
        const { username } = req.params
        const { email } = req.body

        const foundUser = await usersColl.findOne({ username })

        if (!foundUser) {
            res.sendStatus(404)
            return
        }

        const updateResult = await usersColl.updateOne({ username }, { $set : { email } }).catch(console.error)

        res.send(updateResult)
    })

    //Delete
    app.delete("/api/users/:username", async (req, res) => {
        const { username } = req.params

        const foundUser = await usersColl.findOne({ username })

        if (!foundUser) {
            res.sendStatus(404)
            return
        }

        const deleteResult = usersColl.deleteOne({ username })

        res.send(deleteResult)
    })
}

module.exports = registerRoutes