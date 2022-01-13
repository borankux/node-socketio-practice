<template>
  <div>
    <h2>name: {{user.name}} <a href="#" style="font-size: 0.9em;" @click="updateName">update</a></h2>
    <div class="game">

      <div  v-if="fullyRegistered" class="join-control">
        <div>
          <input type="text" v-model="roomId">
          <button @click="joinARoom">Join a Room</button>
        </div>
        <div>
          <button @click="createARoom">Create a Room</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {hasToken} from "@/utils/room";

export default {
  name: "Game",
  data () {
    return {
      name:"",
      socket:null,
      connected: false,
      loggedIn: hasToken(),
      roomId: null,
      user: {
        name:'not loaded'
      }
    }
  },
  computed:{
    fullyRegistered: function() {
      console.log(this.user);
      if(this.user.name === "not loaded") {
        return false
      }

      if(!this.user.token) {
        return false
      }

      return true
    }
  },
  created() {
    let socket = this.$sockets.socket("/game")

    socket.on("connect", () => {
      this.connected = true
      let token = localStorage.getItem("token")
      socket.emit("client-ready", token)
    })

    socket.on("disconnect", () => {
      this.connected = false
    })

    socket.on("login-success", (user) => {
      localStorage.setItem("token", user.token)
      this.user = user;
      this.loggedIn = true
      if(!user["name"]) {
        let name = prompt("please input user name")
        socket.emit("update-name", name, user.token)
      }
    })

    socket.on("logout-success", () => {
      localStorage.removeItem("token")
      this.loggedIn = false
    })

    socket.on("update", (user) => {
      console.log(user);
      this.user = user;
    })

    this.socket = socket
  },
  methods: {
    logout() {
      this.socket.emit("logout", localStorage.getItem("token"))
    },

    updateName() {
      let name = prompt("please input a name")
      if(name) {
        let token = localStorage.getItem("token")
        this.socket.emit("update-name", name, token)
      }
    },

    joinARoom() {

    },

    createARoom() {

    }
  }
}
</script>

<style scoped>
  .game {
    margin: 10px auto;
    width: 500px;
    border: 1px solid #ccc;
    min-height: 200px;
    padding: 10px;
  }
</style>
