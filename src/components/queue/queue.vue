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
                        已进入队列，排队中
                        <div class="loadingSpan">
                            <div class="typing_loader"></div>
                        </div>
                </div>
            </div>
      </div>
      <div class="footer">
            <el-button type="primary" round class="btnStyle" @click="exitLineUp">结束排队</el-button>
      </div>
    </div>
</template>

<script>
import TimeFormat from '../script';
let presetInfo = localStorage.getItem('H5PresetData');
export default {
  name: 'Queue',
  data () {
    return {
      setTime: '00:00',
      configInfo: JSON.parse(presetInfo).config,
      timer: {},
      isLineUp: false
    };
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  mounted() {
    this.LineUp();
  },
  methods: {
    exitLineUp() {
      this.$confirm('正在呼叫坐席, 是否结束并退出?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          clearInterval(this.timer);
        }, 300);
      }).catch(() => {
        this.$notify.info({
          title: '',
          message: '已取消'
        });
      });
    },
    LineUp() {
      let second = 0;
      this.timer = setInterval(() => {
        second++;
        this.setTime = TimeFormat(second);
      }, 1000);
    },
    entyArea(userid) {
      // 录像添加时间戳
      window.BRAC_SetSDKOption(window.BRAC_SO_LOCALVIDEO_OVERLAYTIMESTAMP, 1);
      // 业务对象身份初始化
      window.BRAC_SetSDKOption(window.BRAC_SO_OBJECT_INITFLAGS, window.ANYCHAT_OBJECT_FLAGS_CLIENT);
      // 客户端用户对象优先级
      window.BRAC_ObjectSetValue(window.ANYCHAT_OBJECT_TYPE_CLIENTUSER, userid, window.ANYCHAT_OBJECT_INFO_PRIORITY, 5);
      // 进入营业厅
      window.BRAC_ObjectControl(window.ANYCHAT_OBJECT_TYPE_AREA, this.configInfo.areaId, window.ANYCHAT_AREA_CTRL_USERENTER, 0, 0, 0, 0, '');
    },
    entyQueue() {
      var errorcode = window.BRAC_ObjectControl(window.ANYCHAT_OBJECT_TYPE_QUEUE, this.configInfo.queueId, window.ANYCHAT_QUEUE_CTRL_USERENTER, 0, 0, 0, 0, '');
      console.log(errorcode);
    },
    callAgent(agentid) {
      var errorcode = window.BRAC_VideoCallControl(window.BRAC_VIDEOCALL_EVENT_REQUEST, agentid, 0, 0, 0, presetInfo);
      console.log(errorcode);
    }
  }
};
</script>

<style lang="less" scoped>
@import './queue.less';
</style>
