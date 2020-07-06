var express = require("express");
var router = express.Router();
var request = require("request");
var mahvel = require("marvel-comics-api");
const axios = require("axios");

let sessionData;
router.post("/NewComics", function (req, res, next) {
  sessionData = req.session;
  const week = req.body.week;
  console.log(week);
  let uri;
  if (week == 0) {
    uri = "http://api.shortboxed.com/comics/v1/previous";
  } else if (week == 1) {
    uri = "http://api.shortboxed.com/comics/v1/new";
  } else if (week == 2) {
    uri = "http://api.shortboxed.com/comics/v1/future";
  } else {
    res.send("error");
  }
  request({
    uri: uri,
  }).pipe(res);
});

router.post("/ComicImg", function (req, res, next) {
  axios
    .get("https://comicvine.gamespot.com/api/search/", {
      params: {
        api_key: "5029328a4eeecde1e6300db0c8649827ae3951ad",
        query: req.body.comicName + " " + req.body.comicID,
        format: "json",
        resource_type: "issue",
      },
    })
    .then((data) => {
      res.send(data.data.results);
    })
    .catch();
});

router.post("/MarvelImg", function (req, res, next) {
  const diamond_id = req.body.comicID;
  mahvel(
    "comics",
    {
      publicKey: "6ff4f2199ec8f6b99862b84ba134b59a",
      privateKey: "d0a896174fe2c66fd9b24c8137c4a0bf876c6995",
      timeout: 4000,
      query: {
        limit: 5,
        diamondCode: diamond_id,
        orderBy: "-onsaleDate",
        noVariants: true,
      },
    },
    function (err, body) {
      console.log(body);

      if (err) throw err;
      else res.send(body);
    }
  );
});

router.post("/MarvelQuery", function (req, res, next) {
  const diamond_id = req.body.comicID;
  mahvel(
    "comics",
    {
      publicKey: "6ff4f2199ec8f6b99862b84ba134b59a",
      privateKey: "d0a896174fe2c66fd9b24c8137c4a0bf876c6995",
      timeout: 4000,
      query: {
        limit: 5,
        diamondCode: diamond_id,
        orderBy: "-onsaleDate",
        noVariants: true,
      },
    },
    function (err, body) {
      console.log(body);

      if (err) throw err;
      else res.send(body);
    }
  );
});

router.post("/ComicVineQuery", function (req, res, next) {
  const { comicName, comicID } = req.body;
  axios
    .get("https://comicvine.gamespot.com/api/search/", {
      params: {
        api_key: "5029328a4eeecde1e6300db0c8649827ae3951ad",
        query: comicName + " " + comicID,
        format: "json",
        resource_type: "issue",
      },
    })
    .then((data) => {
      res.send(data.data);
    })
    .catch();
});

module.exports = router;

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
