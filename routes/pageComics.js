const axios = require('axios')
var express = require('express')
var router = express.Router()
const dotenv = require('dotenv')
dotenv.config()

const getPageData = async (comic) => {
    const idRes = await axios.get(
        `https://metron.cloud/api/issue/?number=${comic.issue_no}&series_name=${comic.title}&store_date=${comic.release_date}&sku=${comic.diamond_id}`,
        {
            headers: {
                Authorization: `${process.env.METRON_BASIC_KEY}`,
            },
        }
    )
    if (idRes.data.count > 0) {
        const comicID = idRes.data.results[0].id
        const comicData = await axios.get(
            `https://metron.cloud/api/issue/${comicID}`,
            {
                headers: {
                    Authorization:
                        'BASIC c3VwZXJwYWNtYW5jaGVmOktOSE14TUM0Sm1lUHhrSA==',
                },
            }
        )
        return comicData.data.image
    }
    const data = await axios.get('https://comicvine.gamespot.com/api/search/', {
        params: {
            api_key: process.env.COMIC_VINE_KEY,
            query: `${comic.title} ${comic.issue_no} ${comic.diamond_id} ${comic.release_date} comic`,
            format: 'json',
            resource_type: 'issue',
        },
    })

    return data.data.results[0].image.medium_url
}

router.post('/', async (req, res) => {
    const { comic } = req.body

    try {
        const data = await getPageData(comic)
        res.status(200).json(data)
        res.end()
    } catch (err) {
        res.status(500)
    }
})

module.exports = router
