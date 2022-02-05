<template>
  <div id="app">
    <top-nav-bar :isExit="isExit" :navbarTitle="barTitle" v-if="barTitle !== 'CallIndex'"></top-nav-bar>
      <router-view/>
  </div>
</template>

<script>
import TopNavBar from './components/TopNavBar.vue';
import { mapState, mapMutations } from 'vuex';
import apiHandel from './api/apiHandel';
export default {
  name: 'App',
  components: {
    TopNavBar
  },
  data() {
    return {
      isExit: true
    };
  },
  watch: {
    '$route.path': function (newVal, oldVal) {
      if (newVal === '/') {
        this.isExit = true;
      } else {
        this.isExit = false;
      }
    }
  },
  computed: {
    ...mapState(['barTitle'])
  },
  created() {
    if (localStorage.getItem('SEXList') && localStorage.getItem('ORDER_STATUSList') &&
    localStorage.getItem('PAY_STATUSList') && localStorage.getItem('COMMENT_STATUSList')) {
    } else {
      this.getDict();
    }
    this.getConfig();
  },
  methods: {
    ...mapMutations(['updateAppId', 'updateanychatIp', 'updateAnychatPort']),
    getDict() {
      let prarms;
      let arr = ['SEX', 'ORDER_STATUS', 'PAY_STATUS', 'COMMENT_STATUS']; // 字典code
      arr.forEach(item => {
        prarms = {
          typeCode: item
        };
        apiHandel.getDictInfoListByTypeCode(prarms).then(res => {
          let arr = JSON.stringify(res);
          switch (item) {
            case 'SEX':
              localStorage.setItem('SEXList', arr);
              break;
            case 'ORDER_STATUS':
              localStorage.setItem('ORDER_STATUSList', arr);
              break;
            case 'PAY_STATUS':
              localStorage.setItem('PAY_STATUSList', arr);
              break;
            case 'COMMENT_STATUS':
              localStorage.setItem('COMMENT_STATUSList', arr);
              break;
            default:
              break;
          }
        });
      });
    },
    getConfig() {
      apiHandel.getConfig().then(res => {
        console.log(res);
        res.content.content.forEach(item => {
          if (item.configKey === 'ANYCHAT_AGENT_IP') {
            this.updateanychatIp(item.configValue);
          } else if (item.configKey === 'ANYCHAT_AGENT_PORT_H5') {
            this.updateAnychatPort(JSON.parse(item.configValue));
          } else if (item.configKey === 'BUSINESS_APP_ID') {
            this.updateAppId(item.configValue);
          }
        });
      });
    }
  }
};
</script>

<style lang="less">
@defaultsColor:#EC662B;
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #F2F1F1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.van-pull-refresh{
  overflow: unset !important;
}
.van-dialog--round-button .van-dialog__message{
  font-size: 17px;
}
[v-cloak] {
  display: none;
}
</style>
