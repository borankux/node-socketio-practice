const {createClient} = require("redis");

const redis = createClient()

class User {
    token = ""
    ids = []
    constructor(id, token) {
        this.token = token;
        this.addId(id)
    }
    
    addId(id) {
        if (this.ids.indexOf(id) === -1) {
            this.ids.push(id)
        }
    }
}

class UserList {
    constructor(store) {
        this.store = store
    }

    getUsers() {
        redis.getSet("")
        this.store.get()
    }

    addUser(user) {

    }

    removeUser() {

    }
}


module.exports = {
    User,
    UserList
}