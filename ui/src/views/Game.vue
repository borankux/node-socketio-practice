<template>
  <div class="game">
    <div>
      <button v-if="loggedIn"  :disabled="!connected" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
import {hasToken} from "../utils/room";

export default {
  name: "Game",
  data () {
    return {
      name:"",
      socket:null,
      connected: false,
      loggedIn: hasToken(),
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

    socket.on("login-success", (token) => {
      localStorage.setItem("token", token)
      this.loggedIn = true
    })

    socket.on("logout-success", () => {
      localStorage.removeItem("token")
      this.loggedIn = false
    })

    socket.on("logout-failed", () => {
      localStorage.removeItem("token")
      this.loggedIn = false;
      console.log("logout-failed");
    })

    this.socket = socket
  },
  methods: {
    logout() {
      this.socket.emit("logout", localStorage.getItem("token"))
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