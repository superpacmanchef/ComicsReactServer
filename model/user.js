const Datastore = require("nedb");
const dbFileUser = "User.nedb.db";

class DAO {
  constructor(dbfilepath) {
    if (dbfilepath) {
      this.db = new Datastore({ filename: dbfilepath, autoload: true });
      console.log("\n>>>>> DB connected to file: ", dbfilepath);
    } else {
      //in memory
      this.db = new Datastore();
    }
  }

  all() {
    return new Promise((resolve, response) => {
      this.db.find({}, function (err, entries) {
        if (err) {
          reject(err);
          console.log(`error ${err}`);
        } else {
          resolve(entries);
          console.log("resolved");
        }
      });
    });
  }

  insertUser(username, email, password) {
    this.db.insert({
      username: username,
      email: email,
      password: password,
      pullList: [],
      collection: [],
    });
  }

  insertCollection(id, comic) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then(() => {
        this.checkCollection(
          id,
          comic.title,
          comic.issue_number,
          comic.diamond_id,
          comic.id
        ).then((res) => {
          if (res == 1) {
            this.db.update(
              { _id: id },
              {
                $push: { collection: comic },
              }
            );
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
  }

  removeCollection(id, comicName, comicIssue) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then(() => {
        this.db.update(
          { _id: id },
          {
            $pull: {
              collection: { title: comicName, issue_number: comicIssue },
            },
          }
        );
        resolve(true);
      });
    });
  }

  removePull(id, comicname) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then(() => {
        this.db.update(
          { _id: id },
          {
            $pull: {
              pullList: comicname,
            },
          }
        );
        resolve(true);
      });
    });
  }

  searchByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ username: username }, function (err, entries) {
        if (err) {
          reject(err);
        } else {
          resolve(entries);
        }
      });
    });
  }

  searchByID(id) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: id }, function (err, entries) {
        if (err) {
          reject(err);
        } else {
          resolve(entries);
        }
      });
    });
  }

  insertPull(id, comic) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then((user) => {
        if (user.username) {
          this.db.update(
            { _id: id },
            { $push: { pullList: comic } },
            {},
            function () {
              resolve(true);
            }
          );
        }
      });
    });
  }

  getPull(id) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then((user) => {
        if (user) {
          resolve(user.pullList);
        } else {
          resolve([]);
        }
      });
    });
  }

  getUsername(id) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then((user) => {
        if (user) {
          resolve(user.username);
        } else {
          resolve([]);
        }
      });
    });
  }

  getCollection(id) {
    return new Promise((resolve, reject) => {
      this.searchByID(id).then((user) => {
        if (user.collection) {
          resolve(user.collection);
        } else {
          resolve([]);
        }
      });
    });
  }

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
                  .replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, "")
                  .replace(/AND /g, "")
                  .includes(comic.toUpperCase()) &&
                collection[x].issue_number == "#" + issue &&
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
          reject(1);
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
                .replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, "")
                .replace(/AND /g, "")
                .replace(/THE /g, "") == comic.replace(/THE /g, "")
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
