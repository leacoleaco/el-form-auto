import Vue from 'vue'
import Demo from './demo/Demo.vue'
import ElementUI from 'element-ui'

Vue.use(ElementUI)

Vue.config.productionTip = false

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: h => h(Demo)
})
