var express = require("express");
var router = express.Router();
const axios = require("axios");
var mahvel = require("marvel-comics-api");
const crypto = require("crypto");
const Keys = require("../keys");

router.post("/NewComics", async function (req, res, next) {
  const week = req.body.week;
  let uri;
  if (week == 0) {
    uri = "http://api.shortboxed.com/comics/v1/previous";
  } else if (week == 1) {
    uri = "http://api.shortboxed.com/comics/v1/new";
  } else if (week == 2) {
    uri = "http://api.shortboxed.com/comics/v1/future";
  } else {
    res.end("error");
  }
  let shortboxed = {status : null};
  try{
   shortboxed = await axios.get(uri);
  }catch(error)
  {
    console.log("error")
  }
  // const marvelDiamondIDs = await filterMarvelDiamondIDs(req.query.offset);

  //INFO: GET RID DO NULLS in marvel AND ONLY IN CASE of hsortboxed no longer working
  // Promise.all(
  //   marvelDiamondIDs.map(async (diamondID) => {
  //     const c = await marvelApiComicQuery(diamondID);
  //     return c;
  //   })
  // ).then((comics) => {
  //   console.log(shortboxed);
  //   res.send([...comics, ...shortboxed.data.comics]);
  // });

  if (shortboxed.status == 200) {
    res.send(shortboxed.data);
  } else {
    res.sendStatus(400);
  }
});

router.post("/ComicImg", function (req, res, next) {
  axios
    .get("https://comicvine.gamespot.com/api/search/", {
      params: {
        api_key: Keys.COMIC_VINE_KEY,
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
      if (err) {
        console.log(err);
      } else res.send(body);
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
  const { comicName, comicID, comicTitle, comicDate } = req.body;
  axios
    .get("https://comicvine.gamespot.com/api/search/", {
      params: {
        api_key: "5029328a4eeecde1e6300db0c8649827ae3951ad",
        query:
          comicName +
          " " +
          comicID +
          " " +
          comicTitle +
          " " +
          comicDate +
          " comic",
        format: "json",
        resource_type: "issue",
      },
    })
    .then((data) => {
      res.send(data.data);
    })
    .catch();
});

router.get("/marvelComics", async (req, res) => {
  const marvelDiamondIDs = await filterMarvelDiamondIDs(req.query.offset);
  Promise.all(
    marvelDiamondIDs.map(async (diamondID) => {
      const c = await marvelApiComicQuery(diamondID);
      return c;
    })
  ).then((comics) => {
    res.send(comics);
  });
});

const marvelApiComicQuery = (diamondID) => {
  const baseUrl = "http://gateway.marvel.com/v1/public/comics";
  const query = "?diamondCode=" + diamondID;
  const timestamp = new Date().getTime();
  const hash = crypto
    .createHash("md5")
    .update(timestamp + Keys.MARVEL_KEY_LONG + Keys.MARVEL_KEY_SHORT)
    .digest("hex");
  const auth = `&ts=${timestamp}&apikey=${Keys.MARVEL_KEY_SHORT}&hash=${hash}`;
  const url = `${baseUrl}${query}${auth}`;

  return axios.get(url).then((comics) => {
    if (comics.data.data.total > 0) {
      return comics.data.data.results[0];
    } else {
      return null;
    }
  });
};

const filterMarvelDiamondIDs = async (offset) => {
  const comicData = await getPreviewData(offset);
  const lines = comicData.split("\r\n");
  let i = 0;
  while (lines[i] != "MARVEL COMICS") {
    i++;
  }
  i += 2;
  const diamondIDS = [];
  while (lines[i] != "") {
    diamondIDS.push(lines[i].substring(0, 9));
    i++;
  }
  return diamondIDS;
};

const getPreviewData = async (off) => {
  const uri =
    "https://www.previewsworld.com/NewReleases/Export?format=txt&releaseDate=";
  var today = new Date();
  today.setDate(today.getDate() + off + ((3 - 1 - today.getDay() + 7) % 7) + 1);
  let previewRes = await axios.get(uri + today);
  return previewRes.data;
};
module.exports = router;
