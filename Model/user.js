const Datastore = require("nedb");

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
}

module.exports = DAO;
