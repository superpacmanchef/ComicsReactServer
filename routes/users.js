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

function userExistID(ID) {
  return new Promise(function (resolve, reject) {
    daoUser.searchByID(ID).then((entries) => {
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
  sessionData = req.session.user;
  const { comicName, comicId } = req.body;
  if (sessionData) {
    const [name, issue] = comicTitleSplit(comicName);
    daoUser.checkCollection(sessionData, name, issue, comicId).then((resp) => {
      res.send({ resp });
    });
  }
});

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

router.post("/getUsername", function (req, res, next) {
  sessionData = req.session.user;
  if (userExistID(sessionData)) {
    daoUser.getUsername(sessionData).then((username) => {
      if (username) {
        console.log(username);
        res.send(username);
      } else {
        res.send(err);
      }
    });
  }
});

router.post("/getCollection", function (req, res, next) {
  sessionData = req.session.user;
  if (userExistID(sessionData)) {
    daoUser.getCollection(sessionData).then((collection) => {
      res.send(collection);
    });
  }
});

router.post("/insertCollection", function (req, res, next) {
  sessionData = req.session.user;
  const { comic } = req.body;
  console.log(comic);
  if (userExistID(sessionData)) {
    daoUser.insertCollection(sessionData, comic).then(() => {
      res.send(true);
    });
  }
});

router.post("/removeCollection", function (req, res, next) {
  sessionData = req.session.user;
  const { comicName, comicIssue } = req.body;
  console.log(comicName);
  console.log(comicIssue);
  if (userExistID(sessionData)) {
    daoUser
      .removeCollection(sessionData, comicName, comicIssue)
      .then((resp) => {
        console.log(resp);
        res.send(true);
      });
  }
});

router.post("/removePull", function (req, res, next) {
  sessionData = req.session.user;
  const { comicName } = req.body;
  if (userExistID(sessionData)) {
    daoUser.removePull(sessionData, comicName).then((resp) => {
      console.log(resp);
      res.send(true);
    });
  }
});

router.post("/checkPull", function (req, res, next) {
  sessionData = req.session.user;
  const { comicName } = req.body;
  const [name, issue] = comicTitleSplit(comicName);

  if (userExistID(sessionData)) {
    daoUser.checkPullList(sessionData, name).then((resp) => {
      console.log(resp);
      res.send({ resp });
    });
  }
});
module.exports = router;
