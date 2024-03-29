const express = require('express')
const app = express()
const server = require("http").createServer(app);
const { Server } = require("socket.io")
const { instrument } = require('@socket.io/admin-ui')
const { createClient } = require('redis')
const serverConfig = require('./config')
const {UserList, User} = require("./user");

const redis = createClient({
    url:"redis://localhost:6379"
})
redis.connect()

const io = new Server(server, serverConfig)
instrument(io,{
    auth: false
})

let userList = new UserList(redis)

io.on('connection', (socket) => {
    console.log(`a user connected :${socket.conn.remoteAddress}`)
    socket.emit("hello", "hello from server side")
})

io.on('disconnect', (socket) => {
    console.log(socket);
})

io.of("/admin").on("connection", (socket) => {
    console.log(`adminNSP:a user connected:[${socket.id}]:[${socket.conn.remoteAddress}]:`)
    setInterval(() => {
        userList.getUsers().then((users) => {
            socket.emit("update", {
                users: users
            });
        })
    }, 1000)
})

io.of("/game").on("connection", (socket => {
    socket.on("client-ready", (token) => {
        userList.addUser(new User(socket.id, token)).then(newUser => {
            socket.emit("login-success", newUser)
        })
    })

    socket.on("disconnect", (reason) => {
        userList.removeUser(new User(socket.id))
    })

    socket.on("logout", (token) => {
        //
    })

    socket.on("update-name",(name, token) =>{
        userList.updateUserName(token, name).then((user) => {
            socket.emit("update", user)
        })
    })
}))

io.listen(3000)
console.log("listening on http://localhost:3000")
