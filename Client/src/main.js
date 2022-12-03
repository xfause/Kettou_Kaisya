import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import VueSocketIO from 'vue-socket.io'
import SocketIO from "socket.io-client"

import Tools from '../src/scripts/Tools'

Vue.prototype.$Tools = Tools;

const socketOptions = {
  autoConnect: false,
}

Vue.config.productionTip = false

Vue.use(
  new VueSocketIO({
    debug: true ,   // debug调试，生产关闭
    // connection: SocketIO("http://localhost:4001", socketOptions)
    connection: SocketIO("localhost:4001", socketOptions)
  })
)

Vue.use(ElementUI);

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
}).$mount('#app')
