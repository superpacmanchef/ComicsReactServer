var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
let daoUser = require('./model/user.js')
let passport = require('passport')

var LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

var collectionHandler = require('./routes/collectionHandler')
var userHandler = require('./routes/userHandler')
var pullHandler = require('./routes/pullHandler')
var pageComics = require('./routes/pageComics')
var weekComics = require('./routes/weekComics')
var comicSearchHandler = require('./routes/comicSearchHandler')

const session = require('express-session')
var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.set('port', process.env.PORT || 3000)

app.use(session({ secret: 'XASDASDAAA' }))
app.use(passport.initialize())
app.use(passport.session())

passport.use(
    new LocalStrategy((username, password, done) => {
        daoUser.searchByEmail(username).then((exist) => {
            if (exist) {
                bcrypt.compare(
                    password,
                    exist.password,
                    function (err, result) {
                        if (result) {
                            return done(null, exist)
                        } else {
                            return done(null, false)
                        }
                    }
                )
            } else {
                return done(null, false)
            }
        })
    })
)

passport.serializeUser((user, done) => {
    return done(null, user.email)
})
passport.deserializeUser((user, done) => {
    daoUser.searchByEmail(user).then((res) => {
        return done(null, res)
    })
})

app.use('/collectionHandler', collectionHandler)
app.use('/pageComics', pageComics)
app.use('/pullHandler', pullHandler)
app.use('/userHandler', userHandler)
app.use('/weekComics', weekComics)
app.use('/comicSearchHandler', comicSearchHandler)

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

app.listen(app.get('port'), function () {
    console.log('>>> Server Started\n')
    console.log(app.get('port'))
})
