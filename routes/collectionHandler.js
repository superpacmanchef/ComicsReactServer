const axios = require('axios')
var express = require('express')
var router = express.Router()
const dotenv = require('dotenv')
var isLoged = require('../middlware/isLoged')
var dao = require('../model/user')
var passport = require('passport')
dotenv.config()

router.get('/', isLoged, async (req, res) => {
    const { collection } = req.user
    res.send({ collection: collection })
})

router.post('/', isLoged, async (req, res) => {
    const { comic } = req.body
    try {
        const collection = await dao.insertCollection(req.user._id, comic)
        if (collection) {
            res.send(collection)
        } else {
            res.sendStatus(500)
        }
    } catch (err) {
        res.sendStatus(500)
    }
})

router.delete('/', isLoged, async (req, res) => {
    const { diamond_id } = req.body
    console.log(diamond_id)
    try {
        const collection = await dao.removeCollection(req.user._id, diamond_id)
        if (collection) {
            res.send(collection)
        } else {
            res.sendStatus(500)
        }
    } catch (err) {
        res.senStatus(500)
    }
})

module.exports = router
