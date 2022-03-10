const axios = require('axios')
var express = require('express')
var router = express.Router()
const dotenv = require('dotenv')
var isLoged = require('../middlware/isLoged')
var dao = require('../model/user')
var passport = require('passport')
var bcrypt = require('bcrypt')
dotenv.config()

const saltRound = 10

router.post('/register', async (req, res) => {
    const { email, username, password, passwordRepeat } = req.body
    try {
        const userExist = await dao.searchByEmail(email)
        if (userExist !== null) {
            throw new Error()
        } else {
            bcrypt.genSalt(saltRound, (err1, salt) => {
                bcrypt.hash(password, saltRound, async (err2, hash) => {
                    const resp = await dao.insertUser(username, email, hash)
                    res.send(
                        resp
                            ? { success: true, message: 'created new user' }
                            : { success: false, message: 'Error' }
                    )
                })
            })
        }
    } catch (err) {
        res.sendStatus(500)
    }
})

router.post('/login', passport.authenticate('local'), async (req, res) => {
    res.json({ user: req.user })
})

router.get('/username', isLoged, (req, res) => {
    const { username } = req.user
    res.json({ user: { username } })
})

module.exports = router
