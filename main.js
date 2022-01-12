const express = require('express')
const app = express()
const server = require("http").createServer(app);
const { Server } = require("socket.io")
const { instrument } = require('@socket.io/admin-ui')
const { createToken }  = require('./token')
const { User, UserList } = require('./user')
const { createClient } = require('redis')
const redis = createClient()

const io = new Server(server, {
    cors: {
        origin:['https://admin.socket.io', 'http://localhost:8080'],
        methods:["GET", "POST"],
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log(`a user connected :${socket.conn.remoteAddress}`)
    socket.emit("hello", "hello from server side")
})

io.on('disconnect',(socket) => {
    console.log(socket);
})


const users = new UserList(redis)

io.of("/admin").on("connection", (socket) => {
    console.log(`adminNSP:a user connected:[${socket.id}]:[${socket.conn.remoteAddress}]:`)
    setInterval(() => {
        socket.emit("update", {
            users: users
        })
    }, 1000)
})

setInterval(() => {
    for (let i=0;i<users.length; i++) {
        let user = users[i]
        if (user.ids.length === 0) {
            users.splice(i, 1)
        }
    }
}, 200)


io.of("/game").on("connection", (socket => {
    socket.on("client-ready", (token) => {
        let done = false
        console.log(`user count:${users.length}`)
        if(users.length > 0) {
            users.map((user) => {
                console.log("iterating")
                if(user.token === token) {
                    user.addId(socket.id)
                    socket.emit("login-success", token)
                    done = true
                    console.log("using old token")
                }
            })
        }

        if(!done) {
            createToken((token) => {
                console.log("creating new token")
                let user = new User(socket.id, token)
                users.push(user)
                socket.emit("login-success", token)
            })
        }
    })

    socket.on("disconnect", () => {
        users.map((user, uidx) => {
            user.ids.map((id, idx) => {
                if(id === socket.id) {
                    users[uidx].ids.splice(idx, 1)
                }
            })

            if(user.ids.length === 0) {
                users.splice(uidx, 1)
            }
        })
    })

    socket.on("logout", (token) => {
        let done = false
        users.map((user, index) => {
            if(user.token === token) {
                users.splice(index, 1)
                socket.emit("logout-success")
                done = true
            }
        })

        if (!done) {
            socket.emit("logout-failed")
        }
    })

}))

instrument(io,{
    auth: false
})
io.listen(3000)
console.log("listening on http://localhost:3000")
