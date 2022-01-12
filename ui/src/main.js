import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {Manager} from "socket.io-client";

Vue.config.productionTip = false
let manager = new Manager("http://localhost:3000")

manager.on("reconnect", (attempt) => {
  console.log("reconnecting:attempt:", attempt);
})

manager.on("reconnect_error", (err)=>{
  console.log(`error:${err.message}`)
})


Vue.prototype.$sockets = manager

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
