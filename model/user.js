const { MongoClient, ObjectID } = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()
class DAO {
    constructor() {
        //   if (dbfilepath) {
        //     this.db = new Datastore({ filename: dbfilepath, autoload: true });
        //     console.log("\n>>>>> DB connected to file: ", dbfilepath);
        //   } else {
        //     //in memory
        //     this.db = new Datastore();
        //   }
        console.log(process.env.MONGO_LINK)
        const connectionString = process.env.MONGO_LINK
        MongoClient.connect(
            connectionString,
            { useUnifiedTopology: true },
            (err, client) => {
                if (err) return console.error(err)
                console.log('Connected to Database')
                this.db = client.db('comic-react-server')
            }
        )
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

    async insertUser(username, email, password) {
        this.db.collection('users').insertOne({
            username: username,
            email: email,
            password: password,
            pullList: [],
            collection: [],
        })
    }

    async insertCollection(id, comic) {
        return new Promise(async (resolve, reject) => {
            this.checkCollection(
                id,
                comic.title,
                comic.issue_number,
                comic.diamond_id,
                comic.id
            ).then(async (res) => {
                if (res == 1) {
                    this.db.collection('users').updateOne(
                        { _id: id },
                        {
                            $push: { collection: comic },
                        }
                    )
                    const res = await this.searchByID(id)
                    resolve(res.collection)
                } else {
                    resolve(false)
                }
            })
        })
    }

    async removeCollection(id, diamond_id) {
        return new Promise(async (resolve, reject) => {
            this.db.collection('users').updateOne(
                { _id: id },
                {
                    $pull: {
                        collection: {
                            diamond_id: diamond_id,
                        },
                    },
                }
            )

            const res = await this.searchByID(id)
            resolve(res.collection)
        })
    }

    async removePull(id, comicname) {
        return new Promise(async (resolve, reject) => {
            await this.db.collection('users').updateOne(
                { _id: id },
                {
                    $pull: {
                        pullList: comicname,
                    },
                }
            )
            const res = await this.searchByID(id)
            resolve(res.pullList)
        })
    }

    searchByUsername(username) {
        return this.db
            .collection('users')
            .findOne({ username: username })
            .then((entries) => {
                return entries
            })
            .catch((err) => console.log(err))
    }

    searchByID(id) {
        return this.db
            .collection('users')
            .findOne({ _id: ObjectID(id) })
            .then((entries) => {
                return entries
            })
            .catch((err) => console.log(err))
    }

    async insertPull(id, comic) {
        return new Promise(async (resolve, reject) => {
            await this.db
                .collection('users')
                .updateOne(
                    { _id: ObjectID(id) },
                    { $push: { pullList: comic } }
                )
            const res = await this.searchByID(id)
            resolve(res.pullList)
        })
    }

    getPull(id) {
        return new Promise((resolve, reject) => {
            this.db
                .collection('users')
                .findOne({ _id: ObjectID(id) }, { projection: { pullList: 1 } })
                .then((res) => {
                    resolve(res.pullList)
                })
        })
    }

    getUsername(id) {
        return new Promise((resolve, reject) => {
            this.db
                .collection('users')
                .findOne({ _id: ObjectID(id) }, { projection: { username: 1 } })
                .then((res) => {
                    resolve(res.username)
                })
        })
    }
    getCollection(id) {
        return new Promise((resolve, reject) => {
            this.db
                .collection('users')
                .findOne(
                    { _id: ObjectID(id) },
                    { projection: { collection: 1 } }
                )
                .then((res) => {
                    resolve(res.collection)
                })
        })
    }

    //TODO : Make this less of a mess
    checkCollection(id, comic, issue, comicID, comicDID) {
        return new Promise((resolve, reject) => {
            this.getCollection(id).then((collection) => {
                let col = 1
                if (collection) {
                    for (let x = 0; x < collection.length; x++) {
                        if (comic) {
                            if (col === 3) {
                                break
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
                                col = 3
                            } else if (comicID) {
                                if (collection[x].diamond_id === comicID) {
                                    col = 3
                                }
                            } else if (comicDID) {
                                if (collection[x].id === comicDID) {
                                    col = 3
                                }
                            }
                        } else {
                            col = 0
                        }
                    }
                    resolve(col)
                } else {
                    resolve(1)
                }
            })
        })
    }

    checkPullList(id, comic) {
        return new Promise((resolve, reject) => {
            this.getPull(id).then((pullList) => {
                let pul = 2
                for (let x = 0; x < pullList.length; x++) {
                    if (comic) {
                        if (
                            pullList[x]
                                .toUpperCase()
                                .replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, '')
                                .replace(/AND /g, '')
                                .replace(/THE /g, '') ==
                            comic.replace(/THE /g, '')
                        ) {
                            pul = 4
                        }
                    } else {
                        pul = 0
                    }
                }
                resolve(pul)
            })
        })
    }

    getCollectionComicByID(id, colID) {
        return new Promise((resolve, reject) => {
            this.getCollection(id).then((collection) => {
                let exist = false
                collection.map((col) => {
                    if (col.id == colID) {
                        exist = true
                    }
                })
                resolve(exist)
            })
        })
    }
}
let dao = new DAO()

module.exports = dao
