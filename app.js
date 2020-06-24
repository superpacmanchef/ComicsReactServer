var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/users");

var app = express();
const session = require("express-session");
app.use(session({ secret: "XASDASDAAA" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("port", process.env.PORT || 6000);

app.use("/api", indexRouter);
app.use("/user", userRouter);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:1234"); // update to match the domain you will make the request from
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
