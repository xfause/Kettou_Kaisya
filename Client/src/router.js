import Vue from 'vue'
import Router from 'vue-router'
import GameTable from './pages/GameTable.vue'
import Login from './pages/Login.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'GameTable',
      component: GameTable
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login
    }
  ]
})
