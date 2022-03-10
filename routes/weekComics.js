var express = require('express')
var router = express.Router()
const axios = require('axios')
const filterComicVariants = require('../lib/filterComicVariants')
const comicTitleSplit = require('../lib/comicTitleSplit')

router.get('/', async (req, res) => {
    const { week } = req.query
    const url = 'http://api.shortboxed.com'
    let ext = ''

    if (week === '0') {
        ext = '/comics/v1/previous'
    } else if (week === '1') {
        ext = '/comics/v1/new'
    } else {
        ext = '/comics/v1/future'
    }

    const api = url + ext

    try {
        const shortboxed = filterComicVariants(await axios.get(api))

        const shortboxedSplitTitle = shortboxed.map((comic) => {
            const [newComicTitle, issue_no] = comicTitleSplit(comic.title)

            return {
                ...comic,
                title: newComicTitle,
                issue_no,
            }
        })
        res.send(shortboxedSplitTitle)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

module.exports = router
