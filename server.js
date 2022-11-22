const express = require("express")
const registerRoutes = require("./routes")

const app = express()

app.use(express.json())

registerRoutes(app)

app.listen(3000, () => {
  console.log("Server startet on Port 3000")
})
