const {createToken} = require("./token");

function getSessionKey(id) {
    return `session:${id}`
}

function getUserKey(token) {
    return `user:${token}`
}

const UserMatchKey = "user:*"

class User {
    token = ""
    id = ""
    constructor(id, token) {
        this.token = token;
        this.id = id
    }
}

class UserList {
    constructor(store) {
        this.store = store
    }

    getUsers() {
        return new Promise((resolve, reject) => {
            (async ()=> {
                const users = await this.store.KEYS(UserMatchKey)
                const userList = []
                for(let userKey of users) {
                    let userObj = await this.store.HGETALL(userKey)
                    userObj.token = userKey.split(":")[1]
                    userList.push(userObj)
                }
                resolve(userList)
            })()
        })
    }

    addUser(user) {
        return new Promise((resolve, reject) => {
            (async () => {
                if (user.token === null) {
                    user.token = await createToken()
                }
                let key = getUserKey(user.token)
                let exists = await this.store.EXISTS(key)
                if(!exists) {
                    await this.store.HSET(key, {ids: 1})
                    return resolve(user.token)
                }
                await this.store.HINCRBY(key, "ids", 1)
                await this.rememberID(user)
                return resolve(user.token)
            })()
        })

    }

    removeUser(user) {
        (async () => {
            let id = user.id
            let token = await this.store.GET(getSessionKey(id))
            let userKey = getUserKey(token)
            let ids = await this.store.HGET(userKey, "ids")

            if(ids > 1 ) {
                await this.store.HINCRBY(userKey, "ids", -1)
                return
            }
            await this.store.DEL(userKey)
        })()
    }

    rememberID(user) {
        return (async () => {
            await this.store.set(getSessionKey(user.id), user.token)
        })()
    }
}
module.exports = {
    User,
    UserList
}
