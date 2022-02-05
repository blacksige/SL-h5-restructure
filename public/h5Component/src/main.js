import Vue from 'vue';
import App from './App.vue';
import store from './store';
import { messageEventsRegister } from './messageEvents';
import { Button, Icon, Popup, Toast, Dialog, Loading, Notify, Overlay, Badge, NoticeBar, Field } from 'vant';
import 'vant/lib/index.css';

Vue.use(Field);
Vue.use(Button);
Vue.use(Icon);
Vue.use(Popup);
Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Loading);
Vue.use(Notify);
Vue.use(Overlay);
Vue.use(Badge);
Vue.use(NoticeBar);

// import Vant from 'vant';

// Vue.use(Vant);

class AnyChatH5 {
  #el = '#app';
  #opt;
  #events;
  #sdkInstance = null;
  #vueApp = null;

  constructor (opt, events) {
    const checkResult = this.#checkParams(opt);
    if (checkResult !== 0) {
      throw new Error(checkResult);
    }
    this.#opt = opt;
    this.#events = events;
  }

  // 初始化
  init = () => {
    return new Promise((resolve, reject) => {
      // 初始化SDK
      const initOpt = {
        appId: this.#opt.config?.appId,
        serverIp: this.#opt.config?.serverIp,
        serverPort: this.#opt.config?.serverPort,
        nickName: this.#opt.businessInfo.isInvite === '0' ? this.#opt.userInfo.userId : '游客', // 兼容密码登录方式，BRAC_Login使用的是nickName
        strUserId: this.#opt.userInfo?.userId || this.#opt.userInfo?.phone,
        onLogin: (data) => {
          // 保存用户必要信息，去掉私隐内容
          store.commit('setUserId', data.userId);
          setTimeout(() => {
            resolve();
          }, 1000);
        },
        onDisConnect: (result) => {
          reject(result);
        },
        queueOpt: {
          attribute: '',
          isAutoMode: 1, // 路由模式，0为手动路由，1为自动路由（默认 ）
          isGlobal: 1, // 服务范围，0为当前营业厅（默认），1为跨营业厅（服务器内定义好的营业厅）
          isGlobalAgent: 1, // 营业厅全局坐席，0为关闭营业厅全局坐席（默认），1为开启营业厅全局坐席（旧版本服务器适用）
          priority: 5, // 优先级，值为1-15，值越大，优先级越高
          role: 0 // 登录者的身份，0为客户，2为坐席
        }
      };
      this.#sdkInstance = window.AnyChatH5SDK.sdkInit(initOpt);
    })
      .then(this.#createVueApp)
      .then(vueApp => {
        this.#vueApp = vueApp;
        return this;
      })
      .catch(err => {
        const errMsg = err.code && err.msg ? err.msg : '初始化失败';
        console.error(err, errMsg);
      });
  }

  #createVueApp = () => {
    // 创建Vue实例
    Vue.prototype.$AnyChatH5SDK = this.#sdkInstance;
    document.getElementById('loading').remove();
    this.#vueApp = new Vue({
      store,
      render: h =>
        h(App, {
          // 传入参数
          props: { importData: this.#opt },
          on: this.#events
        })
    }).$mount(this.#el);

    return this;
  }

  #checkParams = opt => {
    if (!opt.config) return '配置信息不能为空';
    if (!opt.config.serverIp) return '服务器地址不能为空';
    if (!opt.config.serverPort) return '服务器端口不能为空';
    if (!opt.config.appId) return '应用ID不能为空';
    if (!opt.userInfo?.userId) return '用户信息不能为空';
    return 0;
  }
};

window.AnyChatH5 = AnyChatH5;

// 注册message事件
messageEventsRegister();
