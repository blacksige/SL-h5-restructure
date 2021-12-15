<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <queue v-if="Step === 'queue'" @updatedStep = "updatedStep"></queue>
    <call v-else-if="Step === 'call'"></call>

    <div v-else style="margin: 30px 0 0 0; color: #666;">
      <img src="./assets/404.png" alt="" style="width: 200px;height: 200px;">
      <h4>页面已丢失</h4>
    </div>
  </div>
</template>

<script>
import Queue from './components/queue/queue.vue';
import Call from './components/call/call.vue';

let presetInfo = localStorage.getItem('H5PresetData');
export default {
  name: 'App',
  components: {
    Queue,
    Call
  },
  data() {
    return {
      Step: 'queue',
      connectTitle: '登录成功',
      config: JSON.parse(presetInfo).config,
      userInfo: JSON.parse(presetInfo).userInfo,
      businessInfo: JSON.parse(presetInfo).businessInfo
    };
  },
  created() {
    if (this.businessInfo.isInvite === '0') {
      this.updatedStep(1);
    } else {
      this.updatedStep(2);
    }
  },
  mounted() {
    window.onbeforeunload = () => {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
    };
  },
  methods: {
    updatedStep(step) {
      if (step === 1) {
        this.Step = 'queue';
      } else if (step === 2) {
        this.Step = 'call';
      } else {
        this.Step = '';
      }
    }
  }
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}

//element全局样式
.el-message-box__wrapper{
  .el-message-box{
    width: auto;
    min-width: 278px;
  }
}
body>.el-notification{
  width: 90%;
  max-width: 400px;
}
</style>
