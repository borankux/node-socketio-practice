const {createToken} = require("./token");

/**
 * @param id
 * @returns {string}
 */
function getSessionKey(id) {
    return `session:${id}`
}

/**
 * @param token
 * @returns {string}
 */
function getUserKey(token) {
    return `user:${token}`
}

/**
 * @type {string}
 */
const UserMatchKey = "user:*"

/**
 * @class User
 */
class User {
    /**
     * @type {string}
     */
    token = ""

    /**
     * @type {string}
     */
    id = ""

    constructor(id, token) {
        this.token = token;
        this.id = id
    }
}

class UserList {
    /**
     * @type <S=Record<string, never> extends RedisScripts>(options?: Omit<RedisClientOptions<never, S>, "modules">) => RedisClientType<typeof modules, S>
     */
    store = null

    /**
     * @param store <S=Record<string, never> extends RedisScripts>(options?: Omit<RedisClientOptions<never, S>, "modules">) => RedisClientType<typeof modules, S>
     */
    constructor(store) {
        this.store = store
    }

    /**
     * @returns {Promise<Array<User>>}
     */
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


    /**
     * @param token {String}
     */
    getUserWithToken(token) {
        return new Promise((resolve, reject) => {
            (async () => {
                let res = await this.store.HGETALL(getUserKey(token))
                let user = {
                    ids: res.ids,
                    token: token
                }

                if('name' in res) {
                    user.name = res.name
                }
                resolve(user)
            })()
        })
    }
    /**
     * @param user {User}
     * @returns {Promise<string>}
     */
    addUser(user) {
        return new Promise((resolve, reject) => {
            (async () => {
                if (!user.token || user.token === 'undefined') {
                    user.token = await createToken()
                }

                let key = getUserKey(user.token)
                let exists = await this.store.EXISTS(key)
                await this.rememberID(user)
                if(!exists) {
                    await this.store.HSET(key, {ids: 1})
                    let newUser = await this.getUserWithToken(user.token)
                    return resolve(newUser)
                }
                await this.store.HINCRBY(key, "ids", 1)
                let newUser = await this.getUserWithToken(user.token)
                return resolve(newUser)
            })()
        })

    }

    /**
     * @param user {User}
     */
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

    /**
     * @param user {User}
     * @returns {Promise<void>}
     */
    rememberID(user) {
        return (async () => {
            await this.store.set(getSessionKey(user.id), user.token)
        })()
    }

    /**
     * @param token
     * @param name
     * @returns {Promise<User>}
     */
    updateUserName(token, name) {
        return (async () => {
            await this.store.HSET(getUserKey(token), "name", name)
            return await this.getUserWithToken(token)
        })()
    }
}

/**
 * @type {{User: User, UserList: UserList}}
 */
module.exports = {
    User,
    UserList
}
