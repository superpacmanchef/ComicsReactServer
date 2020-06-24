const express = require("express");
const router = express.Router();
const dbFileUser = "User.nedb.db";
const DAOUser = require("../Model/user.js");
const daoUser = new DAOUser(dbFileUser);
const bcrypt = require("bcrypt");
const saltRound = 10;
let sessionData;

router.post("/Register", function (req, res, next) {
  const { username, email, password, passwordRepeat } = req.body;
  if (password !== passwordRepeat) {
    res.send(2);
  } else {
    userExist(username).then((exist) => {
      if (!exist) {
        bcrypt.genSalt(saltRound, function (err, salt) {
          bcrypt.hash(password, saltRound, (err, hash) => {
            daoUser.insertUser(username, email, hash);
            res.send(exist);
          });
        });
      } else {
        res.send(exist);
      }
    });
  }
});

function userExist(username) {
  return new Promise(function (resolve, reject) {
    daoUser.searchByUsername(username).then((entries) => {
      entries ? resolve(true) : resolve(false);
    });
  });
}

router.post("/Login", function (req, res, next) {
  const { username, password } = req.body;
  userExist(username).then((exist) => {
    if (exist) {
      daoUser.searchByUsername(username).then((entry) => {
        bcrypt.compare(password, entry.password, function (err, result) {
          if (result) {
            req.session.user = entry._id;
            res.send(exist);
          } else {
            res.send(false);
          }
        });
      });
    } else {
      res.send(exist);
    }
  });
});

router.get("/Loged", function (req, res, next) {
  sessionData = req.session.user;
  sessionData ? res.send(true) : res.send(false);
});

router.get("/Logout", function (req, res, next) {
  req.session.destroy();
  req.session ? res.send(true) : res.send(false);
});

router.get("/Pull", function (req, res, next) {
  sessionData = req.session.user;
  if (sessionData) {
    daoUser.getPull(sessionData).then((pull) => {
      res.send(pull);
    });
  } else {
    res.send([]);
  }
});

router.post("/AddPull", function (req, res, next) {
  sessionData = req.session.user;
  if (sessionData) {
    daoUser.insertPull(sessionData, req.body.comicName).then((response) => {
      res.send({ response: response, comic: req.body.comicName });
    });
  }
});
module.exports = router;
