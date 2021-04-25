const express = require("express");
const router = express.Router();
const daoUser = require("../Model/user.js");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRound = 10;
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

router.post("/checkCollection", function (req, res, next) {
  const { comicName, comicId } = req.body;
  const [name, issue] = comicTitleSplit(comicName);
  daoUser.checkCollection(req.user._id, name, issue, comicId).then((resp) => {
    res.send({ resp });
  });
});

router.post("/Login", passport.authenticate("local"), function (req, res) {
  res.send(req.isAuthenticated());
});

router.get("/Loged", function (req, res, next) {
  res.send(req.isAuthenticated());
});

router.get("/Logout", function (req, res, next) {
  req.session.destroy();
  req.session ? res.send(true) : res.send(false);
});

router.get("/Pull", function (req, res, next) {
  daoUser.getPull(req.user._id).then((pull) => {
    res.send(pull);
  });
});

router.post("/AddPull", function (req, res, next) {
  daoUser.insertPull(req.user._id, req.body.comicName).then((response) => {
    res.send({ response: response, comic: req.body.comicName });
  });
});

router.post("/getUsername", function (req, res, next) {
  daoUser.getUsername(req.user._id).then((username) => {
    if (username) {
      res.send(username);
    } else {
      res.send(err);
    }
  });
});

router.post("/getC`ollection", function (req, res, next) {
  daoUser.getCollection(req.user._id).then((collection) => {
    res.send(collection);
  });
})

router.post("/insertCollection", function (req, res, next) {
  const { comic } = req.body;
  daoUser.insertCollection(req.user._id, comic).then(() => {
    res.send(true);
  });
});

router.post("/removeCollection", function (req, res, next) {
  const { comicName, comicIssue } = req.body;
  daoUser.removeCollection(req.user._id, comicName, comicIssue).then((resp) => {
    res.send(true);
  });
});

router.post("/removePull", function (req, res, next) {
  const { comicName } = req.body;
  daoUser.removePull(req.user._id, comicName).then((resp) => {
    console.log(resp);
    res.send(true);
  });
});

router.post("/checkPull", function (req, res, next) {
  const { comicName } = req.body;
  const [name, issue] = comicTitleSplit(comicName);
  daoUser.checkPullList(req.user._id, name).then((resp) => {
    res.send({ resp });
  });
});

module.exports = router;
