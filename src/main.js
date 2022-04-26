import Vue from "vue";
import App from "./App.vue";
import router from "./router/index";
import store from "./vuex/index";

//自定义组件(components文件夹下)
import "./components/global.js";

// 다국어
import VueI18n from 'vue-i18n'
Vue.use(VueI18n);
import { data } from '@/lib/lang/index.js'
const i18n = new VueI18n({
  locale: 'ja',
  fallbackLocale: 'en',
  messages: data
})

// 모달
import {Modal, Button} from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(Modal);
Vue.use(Button);

// eslint-disable-next-line no-undef
store.state.config = AppConfig;

Vue.config.productionTip = false;

import './plugins/element.js'
// import './assets/js/hui-design.js'
window.hv=new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount("#app");
