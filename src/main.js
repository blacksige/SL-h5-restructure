import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Axios from './api/request';
import VueAxios from 'vue-axios';
import {
  NavBar,
  Icon,
  Collapse,
  CollapseItem,
  Popover,
  Button,
  Search,
  List,
  Tag,
  Rate,
  Swipe,
  SwipeItem,
  Image as VanImage,
  Loading,
  Toast,
  Tab,
  Tabs,
  PullRefresh,
  Divider,
  Field,
  Popup,
  NoticeBar,
  Dialog
} from 'vant';
import 'vant/lib/index.css';
Vue.use(NavBar);
Vue.use(Icon);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Popover);
Vue.use(Button);
Vue.use(Search);
Vue.use(List);
Vue.use(Tag);
Vue.use(Rate);
Vue.use(Swipe);
Vue.use(SwipeItem);
Vue.use(VanImage);
Vue.use(Loading);
Vue.use(Toast);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(PullRefresh);
Vue.use(Field);
Vue.use(Divider);
Vue.use(Popup);
Vue.use(NoticeBar);
Vue.use(Dialog);
// 创建axios实例，并挂在到Vue实例上，可使用this.axios、this.$http(推荐)方式调用
Vue.use(VueAxios, Axios);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
