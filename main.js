const express = require('express')
const app = express()
const server = require("http").createServer(app);
const { Server } = require("socket.io")
const { instrument } = require('@socket.io/admin-ui')
const events = require("events");
const { createToken }  = require('./token')
const {User} = require('./user')

const io = new Server(server, {
    cors: {
        origin:['https://admin.socket.io', 'http://localhost:8080'],
        methods:["GET", "POST"],
        credentials: true
    }
})


let users = []

io.on('connection', (socket) => {
    console.log(`a user connected :${socket.conn.remoteAddress}`)
    socket.emit("hello", "hello from server side")
})

io.on('disconnect',(socket) => {
    console.log(socket);
})


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
        for (let i=0;i<users.length; i++) {
            let user = users[i]
            if(user.token === token) {
                user.addId(socket.id)
                socket.emit("login-success", token)
                return
            }
        }

        createToken((token) => {
            socket.emit("login-success", token)
            users.push(new User(socket.id, token))
        })
    })

    socket.on("disconnect", () => {
        for (let i=0;i<users.length; i++) {
            let user = users[i]
            for(let j=0;j<user.ids.length;j++) {
                let uid = user.ids[j]
                if(uid === socket.id) {
                    users[i].ids.splice(j, 1)
                }
            }
            if (users[i].ids.length === 0) {
                users.splice(i, 1)
            }
        }
    })

    socket.on("logout", (token) => {
        for(let i=0; i < users.length;i++) {
            let user = users[i]
            if(user.token === token) {
                users.splice(i, 1)
                socket.emit("logout-success")
                break
            }
        }
        socket.emit("logout-failed")
    })

}))

instrument(io,{
    auth: false
})
io.listen(3000)
console.log("listening on http://localhost:3000")
