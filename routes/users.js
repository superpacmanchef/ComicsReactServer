const express = require("express");
const router = express.Router();
const daoUser = require("../model/user.js");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRound = 10;
const isLoged = require("../middlware/isLoged");

router.post("/Register", function (req, res) {
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
      console.log(entries)
      entries.length !== 0  ? resolve(true) : resolve(false);
    });
  });
}

//REDO
function comicTitleSplit(comicTitle) {
  let comicArr = [];
  for (let x = 0; x < comicTitle.length; x++) {
    if (comicTitle[x] === "#") {
      comicArr.push(comicTitle.substring(0, x - 1));
      let z = comicTitle.length - x;
      for (let y = 1; y <= z; y++) {
        if (comicTitle[x + y] === " " || comicTitle.length === x + y) {
          comicArr.push(comicTitle.substring(x + 1, x + y));
        }
      }
    }
  }
  return comicArr;
}

router.post("/checkCollection", isLoged, function (req, res) {
  const { comicName, comicId } = req.body;
  const [name, issue] = comicTitleSplit(comicName);
  daoUser.checkCollection(req.user._id, name, issue, comicId).then((resp) => {
    res.send({ resp });
  });
});

router.post("/Login", passport.authenticate("local"), function (req, res) {
  res.send(req.isAuthenticated());
});

router.get("/Loged", function (req, res) {
  console.log("bums")
  console.log(req.isAuthenticated());
  res.send(req.isAuthenticated());
});

router.get("/Logout", isLoged, function (req, res) {
  req.session.destroy();
  req.session ? res.send(true) : res.send(false);
});

router.get("/Pull", isLoged, function (req, res) {
  daoUser.getPull(req.user._id).then((pull) => {
    res.send(pull);
  });
});

router.post("/AddPull", isLoged, function (req, res) {
  daoUser.insertPull(req.user._id, req.body.comicName).then((response) => {
    res.send({ response: response, comic: req.body.comicName });
  });
});

router.post("/getUsername", isLoged, function (req, res) {
  daoUser.getUsername(req.user._id).then((username) => {
    if (username) {
      res.send(username);
    } else {
      res.send(err);
    }
  });
});

router.post("/getCollection", isLoged, function (req, res) {
  daoUser.getCollection(req.user._id).then((collection) => {
    res.send(collection);
  });
});

router.post("/insertCollection", isLoged, function (req, res) {
  const { comic } = req.body;
  daoUser.insertCollection(req.user._id, comic).then(() => {
    res.send(true);
  });
});

router.post("/removeCollection", isLoged, function (req, res) {
  const { comicName, comicIssue } = req.body;
  daoUser.removeCollection(req.user._id, comicName, comicIssue).then((resp) => {
    res.send(true);
  });
});

router.post("/removePull", isLoged, function (req, res) {
  const { comicName } = req.body;
  daoUser.removePull(req.user._id, comicName).then((resp) => {
    console.log(resp);
    res.send(true);
  });
});

router.post("/checkPull", isLoged, function (req, res) {
  const { comicName } = req.body;
  const [name, issue] = comicTitleSplit(comicName);
  daoUser.checkPullList(req.user._id, name).then((resp) => {
    res.send({ resp });
  });
});

module.exports = router;
