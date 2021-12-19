<template>
    <div class="queue">
      <div class="panel" v-if="!isLineUp">
            <i class="el-icon-loading"></i>
             <div class="waitText">
                <div style="font-size: 16px;">
                        正在进入营业厅队列，请稍候
                </div>
            </div>
      </div>
      <div class="panel" v-else>
            <img src="../../assets/clock.png"/>
            <div class="lineUpTime">{{setTime}}</div>
             <div class="waitText">
                <div style="font-size: 16px;">
                        正在呼叫坐席，请稍后
                        <div class="loadingSpan">
                            <div class="typing_loader"></div>
                        </div>
                </div>
            </div>
      </div>
      <div class="footer">
            <el-button type="primary" round class="btnStyle" @click="exitLineUp">结束呼叫</el-button>
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
      isLineUp: false,
      isCall: false,

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
      this.$confirm('正在呼叫坐席, 是否结束并退出?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false
      }).then(() => {
        setTimeout(() => {
          if (this.agentId) {
            this.$AnyChatH5SDK.cancelVideoCall({
              userId: this.agentId,
              szUserStr: '' // 用户自定义参数
            });
          } else {
            this.$AnyChatH5SDK.cancelQueuing({
              done: (result) => {
                this.$notify({
                  title: '提示',
                  message: result.code === 0 ? '已取消' : result.msg,
                  type: 'success'
                });
              }
            });
          }
          this.timer ? clearInterval(this.timer) : this.timer = null;
          this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
          throw new Error('用户取消呼叫');
        }, 300);
      }).catch(() => {
        this.$notify.info({
          title: '提示',
          message: '已取消'
        });
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
            throw new Error('进入营业厅失败: ' + (result.code === 9 ? '营业厅不存在' : result.msg));
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
            this.isLineUp = true;
            this.LineUp();
          } else {
            throw new Error('进入队列失败: ' + (result.code === 9 ? '队列不存在' : result.msg));
          }
        },
        onProcessChanged: (result, data) => { // 排队状态变化回调
          if (result.code === 0) {
            this.enterQueueProcessData = data;
          } else {
            throw new Error('进入队列失败: ' + (result.code === 9 ? '队列不存在' : result.msg));
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
              console.log(data);
              this.isCall = true;
            } else {
              this.$confirm(result.msg, '提示', {
                confirmButtonText: '确定',
                type: 'error',
                showCancelButton: false
              }).then(() => {
                throw new Error(result.msg);
              });
            }
          }
        });
      }
    },
    // 通话开始回调
    onReceiveVideoCallStart(data) {
      console.log(data, 'data');
      this.$store.commit('setRoomId', data.roomId);
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
      throw new Error(result.msg);
    },
    onReceiveVideoCallError(result, data) {
      console.log(result, data);
      if (result.code !== '9999') {
        this.timer ? clearInterval(this.timer) : this.timer = null;
        throw new Error(result.msg);
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import './queue.less';
</style>
