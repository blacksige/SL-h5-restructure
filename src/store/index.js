import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    barTitle: '', // 导航标题
    activeVal: '', // 首页激活内容缓存
    orderCache: {}, // 订单数据缓存
    userId: 2, // 用户id

    // 系统配置相关
    appId: 'CE8400FB-D755-BE42-8E91-B35EDD5E4CB4',
    anychatIp: 'dev.bairuitech.cn',
    anychatPort: 19003
  },
  mutations: {
    updateTitle(state, barTitle) {
      state.barTitle = barTitle;
    },
    updateActiveVal(state, activeVal) {
      state.activeVal = activeVal;
    },
    updateUserId(state, userId) {
      state.userId = userId;
    },
    updateAppId(state, appId) {
      state.appId = appId;
    },
    updateanychatIp(state, anychatIp) {
      state.anychatIp = anychatIp;
    },
    updateAnychatPort(state, anychatPort) {
      state.anychatPort = anychatPort;
    },
    updateOrderCache(state, obj) {
      state.orderCache = obj;
    }
  },
  actions: {
  },
  modules: {
  }
});
