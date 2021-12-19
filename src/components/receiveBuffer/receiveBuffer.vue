// 接收透明通道
<template>
  <div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'ReceiveBuffer',
  data() {
    return {
      cmdObj: {
        rbShareDesktop: 'CMDShareMyDesktop',
        rbPlayMP4: 'CMDStreamPlayMP4',
        rbPlayPPT: 'CMDStreamPlayPPT',

        rbShareDocument: 'CMDStartShareDocument',
        rbEndShareDocument: 'CMDEndShareDocument',

        rbChatModeAudio: 'CMDChatModeAudio',
        rbChatModeVideo: 'CMDChatModeVideo',
        rbChatHandup: 'CMDChatHandup',
        rbChatRestart: 'CMDChatRestart',

        rbSetDefinition: 'CMDSetDefinition', // 设置清晰度
        rbChatTransfer: 'CMDChatTransfer' // 转接
      }
    };
  },
  computed: {
    ...mapState(['friendList'])
  },
  mounted() {
    window.onbeforeunload = () => {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
    };
    // 初始化透明通道回调
    this.setBufferOpt();
  },
  methods: {
    setBufferOpt() {
      var bufferOpt = {
      // 接收透明通道消息通知
        onReceiveBuffer: this.onReceiveBuffer
      };
      this.$AnyChatH5SDK.callbackFunctionRegister(bufferOpt);
    },
    // 透明通道回调
    onReceiveBuffer(data) {
      console.log(data.msg, data.userId);
      switch (data.msg.cmd) {
        // 区域共享、MP4、PPT
        case this.cmdObj.rbShareDesktop || this.cmdObj.rbPlayMP4 || this.cmdObj.rbPlayPPT:
          if (data.msg.data.status === 0) {
            this.$emit('updateModel', 3);
            this.$nextTick(() => {
              let errorCodeCamera = this.$AnyChatH5SDK.getRemoteVideoStream({
                remoteUserId: data.userId,
                renderId: 'SHARE',
                streamIndex: data.msg.data.streamIndex
              });
              console.log(errorCodeCamera, '切换流结果');
            });
          } else {
            this.$AnyChatH5SDK.cancelRemoteVideoStream({
              remoteUserId: data.userId,
              streamIndex: data.msg.data.streamIndex
            });
            this.$AnyChatH5SDK.cancelRemoteVideoStream({
              remoteUserId: data.userId,
              streamIndex: 0
            });
            this.$emit('setVideoPos', this.friendList);
          }
          break;
        // 打开屏幕共享
        case this.cmdObj.rbShareDocument:
          this.$emit('updateModel', 3);
          this.$nextTick(() => {
            let errorCodeCamera = this.$AnyChatH5SDK.getRemoteVideoStream({
              remoteUserId: data.userId,
              renderId: 'SHARE',
              streamIndex: data.msg.data.streamIndex
            });
            console.log(errorCodeCamera, '切换流结果');
          });
          break;
        // 关闭屏幕共享
        case this.cmdObj.rbEndShareDocument:
          this.$AnyChatH5SDK.cancelRemoteVideoStream({
            remoteUserId: data.userId,
            streamIndex: data.msg.data.streamIndex
          });
          this.$AnyChatH5SDK.cancelRemoteVideoStream({
            remoteUserId: data.userId,
            streamIndex: 0
          });
          this.$emit('setVideoPos', this.friendList);
          break;

        default:
          break;
      }
    }
  }
};
</script>

