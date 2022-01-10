<template>
    <div class="queue">
      <div class="panel" >
            <img src="../../assets/slices/call-icon.png"  height="100px" width="100px"/>
            <div class="lineUpTime">{{connectText === '正在进入队列' ? '' : setTime}}</div>
             <div class="waitText">
                <div style="font-size: 16px;">
                        {{connectText}}
                        <div class="loadingSpan" >
                            <div class="typing_loader"></div>
                        </div>
                </div>
            </div>
      </div>
      <div class="footer">
            <van-button  class="btnStyle" @click="exitLineUp">
              <img src="../../assets/slices/Hangup.png" height="74px" width="74px"/>
            </van-button>
      </div>
    </div>
</template>

<script>
import { TimeFormat } from '../toolkit';
import { szUserStr } from '../callParameter';
let presetInfo = localStorage.getItem('H5PresetData');
export default {
  name: 'Queue',
  data () {
    return {
      setTime: '00:00',
      configInfo: JSON.parse(presetInfo).config,
      userInfo: JSON.parse(presetInfo).userInfo,
      businessInfo: JSON.parse(presetInfo).businessInfo,
      agentId: null,
      timer: null,
      isCall: false,
      connectText: '正在进入队列',
      enterAreaReturnData: null,
      enterQueueReturnData: null,
      enterQueueProcessData: null

    };
  },
  mounted () {
    window.onbeforeunload = () => {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
    };
    // 注册回调事件
    this.$AnyChatH5SDK.callbackFunctionRegister({
      onServiceNotify: this.onServiceNotify
    });

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

    this.enterArea(this.configInfo.areaId);
  },
  beforeDestroy () {
    this.$AnyChatH5SDK.callbackFunctionDestroy({
      onServiceNotify: this.onServiceNotify
    });
    this.timer ? clearInterval(this.timer) : this.timer = null;
  },
  methods: {
    // 退出
    exitLineUp() {
      this.$dialog.confirm({
        title: '取消提示',
        message: '正在呼叫专家，确认要取消呼叫吗？'
      })
        .then(() => {
          setTimeout(() => {
            if (this.agentId) {
              this.$AnyChatH5SDK.cancelVideoCall({
                userId: this.agentId,
                szUserStr: '' // 用户自定义参数
              });
            } else {
              this.$AnyChatH5SDK.cancelQueuing({
                done: (result) => {
                  this.$notify({ type: 'primary', message: result.code === 0 ? '取消成功' : result.msg });
                }
              });
            }
            this.timer ? clearInterval(this.timer) : this.timer = null;
            this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
            this.$emit('onError', '用户取消呼叫');
          }, 300);
        })
        .catch(() => {
          this.$notify({ type: 'primary', message: '已取消' });
        });
    },
    // 开始排队
    LineUp() {
      let second = 0;
      this.timer = setInterval(() => {
        second++;
        this.setTime = TimeFormat(second);
      }, 1000);
    },
    // 进入营业厅
    enterArea (areaId) {
      this.$AnyChatH5SDK.enterArea({
        areaId: areaId,
        done: (result, data) => {
          if (result.code === 0) {
            this.enterAreaReturnData = data;
            this.enterQueue(this.configInfo.queueId);
          } else {
            this.$emit('onError', result.msg);
          }
        }
      });
    },
    // 进入队列
    enterQueue(queueId) {
      this.$AnyChatH5SDK.enqueue({
        queueId: queueId,
        done: (result, data) => {
          if (result.code === 0) {
            this.enterQueueReturnData = data;
            this.connectText = '在在呼叫专家，请稍后';
            this.LineUp();
          } else {
            this.$emit('onError', result.msg);
          }
        },
        onProcessChanged: (result, data) => { // 排队状态变化回调
          if (result.code === 0) {
            this.enterQueueProcessData = data;
          } else {
            this.$emit('onError', result.msg);
          }
        }
      });
    },
    // 收到坐席准备好回调
    onServiceNotify(data) {
      if (data.eventType === 'agentPrepared') {
        console.log(szUserStr);
        this.$AnyChatH5SDK.requestVideoCall({
          userId: data.agentId, // 被呼叫方用户ID
          szUserStr: JSON.stringify(szUserStr), // 用户自定义参数
          done: (result, data) => {
            if (result.code === 0) {
              this.$store.commit('setAgentId', data.userId);
              this.agentId = data.userId;
              this.isCall = true;
            } else {
              this.$dialog.alert({
                title: '提示',
                message: result.msg
              }).then(() => {
                this.$emit('onError', result.msg);
              });
            }
          }
        });
      }
    },
    // 通话开始回调
    onReceiveVideoCallStart(data) {
      this.$store.commit('setRoomId', data.roomId);
      this.$emit('onVideoStart', '通话开始');
      this.$emit('updatedStep', 2);
    },
    onReceiveVideoCallRequest(data) {
      console.log(data, '接收视频呼叫请求通知');
    },
    // 视频结束回调
    onReceiveVideoCallFinish(result, data) {
      this.timer ? clearInterval(this.timer) : this.timer = null;
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
      this.$emit('onVideoEnd', '通话结束');
    },
    onReceiveVideoCallError(result, data) {
      console.log(result, data);
      if (result.code !== '9999') {
        this.$dialog.alert({
          message: result.msg
        }).then(() => {
          this.timer ? clearInterval(this.timer) : this.timer = null;
          this.$emit('onError', result.msg);
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import './queue.less';
</style>
