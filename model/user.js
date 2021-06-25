const Datastore = require('nedb');
const dbFileUser = 'User.nedb.db';
const { MongoClient, ObjectID } = require('mongodb');
const Keys = require('../keys');
class DAO {
  constructor() {
    //   if (dbfilepath) {
    //     this.db = new Datastore({ filename: dbfilepath, autoload: true });
    //     console.log("\n>>>>> DB connected to file: ", dbfilepath);
    //   } else {
    //     //in memory
    //     this.db = new Datastore();
    //   }
    const connectionString = Keys.MONGOLINK;
    MongoClient.connect(
      connectionString,
      { useUnifiedTopology: true },
      (err, client) => {
        if (err) return console.error(err);
        console.log('Connected to Database');
        this.db = client.db('comic-react-server');
      },
    );
  }

  /* 
  all() {
    return new Promise((resolve, response) => {
      this.db.find({}, function (err, entries) {
        if (err) {
          reject(err);
          console.log(`error ${err}`);
        } else {
          resolve(entries);
          console.log('resolved');
        }
      });
    });
  }
 */

  insertUser(username, email, password) {
    this.db.collection('users').insertOne({
      username: username,
      email: email,
      password: password,
      pullList: [],
      collection: [],
    });
  }

  insertCollection(id, comic) {
    return new Promise((resolve, reject) => {
      this.checkCollection(
        id,
        comic.title,
        comic.issue_number,
        comic.diamond_id,
        comic.id,
      ).then((res) => {
        if (res == 1) {
          this.db.collection('users').updateOne(
            { _id: id },
            {
              $push: { collection: comic },
            },
          );
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  removeCollection(id, comicName, comicIssue) {
    return new Promise((resolve, reject) => {
      this.db.collection('users').updateOne(
        { _id: id },
        {
          $pull: {
            collection: { title: comicName, issue_number: comicIssue },
          },
        },
      );
      resolve(true);
    });
  }

  removePull(id, comicname) {
    return new Promise((resolve, reject) => {
      this.db.collection('users').updateOne(
        { _id: id },
        {
          $pull: {
            pullList: comicname,
          },
        },
      );
      resolve(true);
    });
  }

  searchByUsername(username) {
    return this.db
      .collection('users')
      .findOne({ username: username })
      .then((entries) => {
        return entries;
      })
      .catch((err) => console.log(err));
  }

  searchByID(id) {
    return this.db
      .collection('users')
      .findOne({ _id: ObjectID(id) })
      .then((entries) => {
        return entries;
      })
      .catch((err) => console.log(err));
  }

  insertPull(id, comic) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('users')
        .updateOne(
          { _id: ObjectID(id) },
          { $push: { pullList: comic } },
          {},
          function () {
            resolve(true);
          },
        );
    });
  }

  getPull(id) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('users')
        .findOne({ _id: ObjectID(id) }, { projection: { pullList: 1 } })
        .then((res) => {
          resolve(res.pullList);
        });
    });
  }

  getUsername(id) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('users')
        .findOne({ _id: ObjectID(id) }, { projection: { username: 1 } })
        .then((res) => {
          resolve(res.username);
        });
    });
  }
  getCollection(id) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('users')
        .findOne({ _id: ObjectID(id) }, { projection: { collection: 1 } })
        .then((res) => {
          resolve(res.collection);
        });
    });
  }

  //TODO : Make this less of a mess
  checkCollection(id, comic, issue, comicID, comicDID) {
    return new Promise((resolve, reject) => {
      this.getCollection(id).then((collection) => {
        let col = 1;
        if (collection) {
          for (let x = 0; x < collection.length; x++) {
            if (comic) {
              if (col === 3) {
                break;
              }
              if (
                collection[x].title
                  .toUpperCase()
                  .replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, '')
                  .replace(/AND /g, '')
                  .includes(comic.toUpperCase()) &&
                collection[x].issue_number == '#' + issue &&
                comic
              ) {
                col = 3;
              } else if (comicID) {
                if (collection[x].diamond_id === comicID) {
                  col = 3;
                }
              } else if (comicDID) {
                if (collection[x].id === comicDID) {
                  col = 3;
                }
              }
            } else {
              col = 0;
            }
          }
          resolve(col);
        } else {
          resolve(1);
        }
      });
    });
  }

  checkPullList(id, comic) {
    return new Promise((resolve, reject) => {
      this.getPull(id).then((pullList) => {
        let pul = 2;
        for (let x = 0; x < pullList.length; x++) {
          if (comic) {
            if (
              pullList[x]
                .toUpperCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, '')
                .replace(/AND /g, '')
                .replace(/THE /g, '') == comic.replace(/THE /g, '')
            ) {
              pul = 4;
            }
          } else {
            pul = 0;
          }
        }
        resolve(pul);
      });
    });
  }

  getCollectionComicByID(id, colID) {
    return new Promise((resolve, reject) => {
      this.getCollection(id).then((collection) => {
        let exist = false;
        collection.map((col) => {
          if (col.id == colID) {
            exist = true;
          }
        });
        resolve(exist);
      });
    });
  }
}
let dao = new DAO(dbFileUser);

module.exports = dao;
