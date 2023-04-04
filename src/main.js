import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Demo from './demo/Demo.vue'

const app = createApp(Demo)
app
  .use(ElementPlus)
  .mount('#app')
