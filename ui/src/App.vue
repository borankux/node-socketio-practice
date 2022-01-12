<template>
  <div id="app">
    <div id="nav">
      <span style="color: #dd4455">{{error}}</span>
      <div :class=" connected ? 'status good' : 'status'"></div>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/game">Game</router-link>
      <div class="floating-bar">
        <div v-for="(user,idx) of stats.users" v-bind:key="idx">{{user.token.substring(0, 15)}}:({{user.ids.length}})</div>
      </div>
    </div>
    <router-view/>
  </div>
</template>
<script>
  export default {
    name: "app",
    data () {
      return {
        connected: false,
        error: '',
        socket:null,
        stats:{
          users:[]
        }
      }
    },
    created() {
      const socket = this.$sockets.socket("/admin")
      socket.on("connect", () => {
        this.connected = true
        this.reason = ''
      })

      socket.on("disconnect", (reason) => {
        this.connected = false;
        this.reason = reason
      })

      socket.on("update", (data) => {
        this.stats = data
      })

      this.socket = socket;
    }
  }
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.status {
  width: 10px;
  height: 10px;
  border-radius: 10px;
  display: inline-block;
  background-color: #d45;
  margin: 0 10px;
}

.good {
  background-color: green;
}

.floating-bar {
  position: fixed;
  left: 0;
  top: 0;
  background-color: #ccc;
  width: 300px;
  min-height: 200px;
}
</style>
