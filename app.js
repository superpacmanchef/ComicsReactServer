var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let daoUser = require("./model/user.js");
var indexRouter = require("./routes/index");
var userRouter = require("./routes/users");
let passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

var app = express();
const session = require("express-session");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("port", process.env.PORT || 6000);

app.use(session({ secret: "XASDASDAAA" }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernamefield: "username" },
    (username, password, done) => {
      daoUser.searchByUsername(username).then((exist) => {
        if (exist) {
          daoUser.searchByUsername(username).then((entry) => {
            bcrypt.compare(password, entry.password, function (err, result) {
              if (result) {
                return done(null, entry);
              } else {
                return done(null, false);
              }
            });
          });
        } else {
          return done(null, false);
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user._id);
});
passport.deserializeUser((user, done) => {
  daoUser.searchByID(user).then((res) => {
    return done(null, res);
  });
});
//Routes for comic book APIs
app.use("/api", indexRouter);
//Routes for user actions
app.use("/user", userRouter);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(app.get("port"), function () {
  console.log(">>> Server Started\n");
  console.log(app.get("port"));
});
