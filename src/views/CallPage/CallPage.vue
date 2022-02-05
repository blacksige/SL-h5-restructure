<template>
  <div class="call-index">
    <!-- 提供嵌入方式 -->
    <iframe class="iframe-box" src="./dist/index.html" id="h5App"></iframe>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'CallIndex',
  components: {

  },
  data() {
    return {
      barTitle: 'CallIndex',
      configData: {}
    };
  },
  created() {
    this.updateTitle(this.barTitle);
    console.log(this.appId, this.anychatIp, this.anychatPort);
  },
  mounted() {
    this.startCall();
  },
  computed: {
    ...mapState(['appId', 'anychatIp', 'anychatPort'])
  },
  methods: {
    ...mapMutations(['updateTitle']),
    startCall() {
      let that = this;
      let defaultPresetData = {
        config: {
          appId: this.appId,
          serverIp: this.anychatIp,
          serverPort: this.anychatPort,
          areaId: '1',
          queueId: '10311',
          roomId: ''
        },
        userInfo: {
          sex: 'male',
          name: '张三',
          phone: '13200000000',
          userId: '2'
        },
        businessInfo: {
          business: '理财咨询',
          isInvite: '0'
        }
      };
      var presetData = defaultPresetData;
      localStorage.setItem('H5PresetData', JSON.stringify(defaultPresetData));

      // 初始化
      var agentAppFrame = document.querySelector('#h5App');
      if (!agentAppFrame) return;
      agentAppFrame = agentAppFrame.contentWindow;
      if (!agentAppFrame) return;
      // 发送消息
      function sendMessage (cmd, data) {
        agentAppFrame.postMessage({ cmd: cmd, msg: data }, '*');
      };

      // 监听回调
      window.addEventListener('message', function (event) {
        var cmd = event.data.cmd;
        var msg = event.data.msg;
        if (cmd === 'CMDAnyChatAgentReady') {
          sendMessage('CMDAnyChatH5Init', { presetData: presetData });
        }

        if (cmd === 'CMDAnyChatH5InitDone') {
          // TODO something
          console.log('初始化成功');
        }

        // 视频通话开始回调
        if (cmd === 'CMDAnyChatH5VideoStart') {
          console.log(msg);
        }
        // 视频通话结束回调
        if (cmd === 'CMDAnyChatH5VideoEnd') {
          console.log(msg);
          that.$router.go(-1);
        }

        // 视频通话异常结束回调
        if (cmd === 'CMDAnyChatH5Error') {
          console.log(msg);
          that.$router.go(-1);
        }

        if (cmd === 'CMDAnyChatH5Submit') {
          // TODO something
          console.log(msg);
        }
      }, false);
    }
  }
};
</script>


<style lang="less" scoped>
@defualtColor: #EC662B;
.call-index{
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  .iframe-box{
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    overflow: hidden;
  }
}

</style>
