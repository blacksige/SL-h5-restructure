import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userid: -1, // 用户id
    agentid: 0, // 坐席id
    roomid: 0, // 房间号
    userlist: [] // 房间内用户
  },
  mutations: {
    setUserId (state, userid) {
      state.userid = userid;
    },
    setAgentId (state, agentid) {
      state.agentid = agentid;
    },
    setRoomId (state, roomid) {
      state.roomid = roomid;
    },
    setUserList (state, userlist) {
      state.userlist = userlist;
    }
  },
  actions: {
  },
  modules: {
  }
});
