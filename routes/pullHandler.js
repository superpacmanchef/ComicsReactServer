const axios = require('axios')
var express = require('express')
var router = express.Router()
const dotenv = require('dotenv')
var isLoged = require('../middlware/isLoged')
var dao = require('../model/user')
var passport = require('passport')
dotenv.config()

router.get('/', isLoged, async (req, res) => {
    const { pullList } = req.user
    res.send({ pullList: pullList })
})

router.post('/', isLoged, async (req, res) => {
    const { comic } = req.body

    try {
        const pullList = await dao.insertPull(req.user._id, comic)

        if (pullList) {
            res.send(pullList)
        } else {
            res.sendStatus(500)
        }
    } catch (err) {
        res.sendStatus(500)
    }
})

router.delete('/', isLoged, async (req, res) => {
    const { comic } = req.body
    console.log(comic)
    try {
        const pullList = await dao.removePull(req.user._id, comic)
        if (pullList) {
            res.send(pullList)
        } else {
            res.sendStatus(500)
        }
    } catch (err) {
        res.sendStatus(500)
    }
})

module.exports = router
