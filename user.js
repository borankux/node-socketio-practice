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

module.exports = {
    User
}