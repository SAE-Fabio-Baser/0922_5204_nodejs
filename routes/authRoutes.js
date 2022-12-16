const { Crypto } = require('cryptojs')
const ObjectID = require('mongodb').ObjectId
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
        const insterResult = await users.insertOne({
            email,
            password: hashedPassword,
            role: 1,
        })

        const createdUser = await users.findOne({
            _id: ObjectID(insterResult.insertedId),
        })

        delete createdUser.password

        res.send({
            success: true,
            data: {
                token: generate({ user: createdUser }),
                user: createdUser,
            },
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
}
