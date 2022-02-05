<!--接收透明通道-->
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: 'VideoHandel',
  data() {
    return {
    };
  },
  computed: {
    // ...mapState(['friendList'])
  },
  mounted() {
    window.onbeforeunload = () => {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
    };
    let videoCallOpt = {
      // 接收视频呼叫请求通知
      onReceiveVideoCallRequest: this.onReceiveVideoCallRequest,

      // 接收视频呼叫开始通知
      onReceiveVideoCallStart: this.onReceiveVideoCallStart,

      // 接收视频呼叫结束通知
      onReceiveVideoCallFinish: this.onReceiveVideoCallFinish,

      // 接收视频呼叫异常通知
      onReceiveVideoCallError: this.onReceiveVideoCallError
    };
    this.$AnyChatH5SDK.callbackFunctionRegister(videoCallOpt);
  },
  methods: {
    // 通话开始回调
    onReceiveVideoCallStart(data) {
      this.$store.commit('setRoomId', data.roomId);
      this.$emit('onReceiveVideoCallStart');
    },
    onReceiveVideoCallRequest(data) {
      console.log(data, '接收视频呼叫请求通知');
    },
    // 视频结束回调
    onReceiveVideoCallFinish(result, data) {
      this.$emit('onReceiveVideoCallFinish', result);
      this.$AnyChatH5SDK.leaveRoom();
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
      let second = 2;
      let secondTimer = setInterval(() => {
        if (second === 0) {
          clearInterval(secondTimer);
        }
        this.$toast('当前视频通话已经结束，' + second + '秒后自动退出');
        second--;
      }, 1000);
    },
    onReceiveVideoCallError(result, data) {
      console.log(result, data);
      if (result.code !== '9999') {
        this.$dialog.alert({
          message: result.msg,
          theme: 'round-button',
          confirmButtonColor: '#EC662B'
        }).then(() => {
          this.$emit('onReceiveVideoCallError', result);
        });
      }
    }
  }
};
</script>
