<template>
  <div class="room">

  </div>
</template>

<script>
export default {
  name: "Room",
  data() {
    return {
      socket: null
    }
  },

  created() {
    let socket = this.$sockets.socket("room")
    socket.on("init", () => {

    })
  }
}
</script>

<style scoped>

</style>