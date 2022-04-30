const axios = require('axios')
var express = require('express')
var router = express.Router()
const dotenv = require('dotenv')
var isLoged = require('../middlware/isLoged')
var dao = require('../model/user')
var passport = require('passport')
dotenv.config()

const getComicData = async (
    comicTitle,
    comicIssueNumber,
    comicMonth,
    comicYear,
    comicID,
    comicUPC
) => {
    let link = `https://metron.cloud/api/issue/?`
    console.log(comicIssueNumber)
    if (comicIssueNumber !== '' && comicIssueNumber !== undefined) {
        link += `&number=${comicIssueNumber}`
    }

    if (comicTitle !== '' && comicTitle !== undefined) {
        link += `&series_name=${comicTitle}`
    }

    if (comicMonth !== '') {
        link += `&cover_month=${comicMonth}`
    }
    if (comicYear !== '') {
        link += `&cover_year=${comicYear}`
    }

    console.log(comicID)

    if (comicID !== '') {
        link += `&sku=${comicID}`
    }

    if (comicUPC !== '') {
        link += `&upc=${comicUPC}`
    }

    console.log(link)

    const idRes = await axios.get(link, {
        headers: {
            Authorization: `${process.env.METRON_BASIC_KEY}`,
        },
    })
    if (idRes.data.count > 0) {
        const metronComicID = idRes.data.results[0].id
        const comicData = await axios.get(
            `https://metron.cloud/api/issue/${metronComicID}`,
            {
                headers: {
                    Authorization: `${process.env.METRON_BASIC_KEY}`,
                },
            }
        )
        return comicData.data
    }

    return null
}

router.post('/', isLoged, async (req, res) => {
    const {
        comicTitle,
        comicIssueNumber,
        comicMonth,
        comicYear,
        comicID,
        comicUPC,
    } = req.body
    try {
        const data = await getComicData(
            comicTitle,
            comicIssueNumber,
            comicMonth,
            comicYear,
            comicID,
            comicUPC
        )
        if (data === null) {
            res.sendStatus(500)
        } else {
            console.log(data.credits)
            let creators = data.credits.reduce((prevVal, currentVal) => {
                if (
                    currentVal.role[0].name === 'Cover' ||
                    currentVal.role[0].name === 'Writer' ||
                    currentVal.role[0].name === 'Artist'
                ) {
                    return (
                        prevVal +
                        `${currentVal.role[0].name}: ${currentVal.creator} \n`
                    )
                } else {
                    return prevVal
                }
            }, '')

            creators = creators.slice(0, -4)

            const comicData = {
                title: data.series.name,
                issue_no: data.number,
                publisher: data.publisher.name,
                description: data.desc,
                price: data.price,
                creators: creators,
                release_date: data.store_date,
                diamond_id: data.sku,
                image: data.image,
            }
            res.send(comicData)
        }
    } catch (err) {
        res.status(500)
    }
})

module.exports = router
