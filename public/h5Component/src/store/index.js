import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userid: -1, // 用户id
    agentid: 0, // 坐席id
    roomid: 0, // 房间号
    friendList: [], // 房间其它用户
    messTextList: [], // 文本信息
    unread: 0 // 未读信息数
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
    setUserList (state, friendList) {
      state.friendList = friendList;
    },
    setMessText (state, messText) {
      state.messTextList.push(messText);
    },
    setUnread (state, unreadNum) {
      state.unread = unreadNum;
    }
  },
  actions: {
  },
  modules: {
  }
});
