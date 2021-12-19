<template>
  <div class="Intreactive">
    <div class="btnBox" >
      <img src="../../assets/Mute.png" alt="关闭麦克风" @click="microphoneControl">
        <p v-text="muteTip"></p>
    </div>
    <div class="btnBox">
      <img src="../../assets/camera.png" alt="关闭摄像头" @click="cameraControl">
      <p v-text="cameraTip"></p>
    </div>
    <div class="btnBox">
      <el-badge :value="msgNum" class="item" :hidden = 'msgNum === 0'>
        <img src="../../assets/message.png" alt="聊天" @click="messText">
      </el-badge>
      <p>聊天</p>
    </div>
    <div class="btnBox">
      <img src="../../assets/Hangup.png" alt="挂断" @click="hungUp">
      <p>挂断</p>
    </div>
    <div class="mess-box" v-show="isChatting">
      <div class="mess-content" id="message">
        <div class="mess-item" v-for="item in messTextList" :key="item.index">
          <div v-if="item.id === userid" class="client-mess">
            <img src="../../assets/camera.png" alt="">
            <div class="mess-right">
              <div class="mess-time">{{item.time}}</div>
              <div class="mess-text">{{item.msg}}</div>
            </div>
          </div>
          <div v-else class="agent-mess">
            <div class="mess-left">
              <div class="mess-time">{{item.time}}</div>
              <div class="mess-text">{{item.msg}}</div>
            </div>
            <img src="../../assets/camera.png" alt="">
          </div>
        </div>
      </div>
      <div class="mess-send">
        <el-input v-model="input" placeholder="请输入内容"></el-input>
        <el-button type="primary" @click="sendMess">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import { current } from '../toolkit';
let presetInfo = localStorage.getItem('H5PresetData');
export default {
  name: 'Intreactive',
  data() {
    return {
      businessInfo: JSON.parse(presetInfo).businessInfo,
      muteTip: '关闭麦克风',
      cameraTip: '关闭摄像头',
      isChatting: false,
      input: ''
    };
  },
  computed: {
    ...mapState(['agentid', 'messTextList', 'unread', 'userid']),
    msgNum() {
      if (!this.isChatting) {
        let num = 0;
        num = this.unread;
        return num;
      } else {
        return 0;
      }
    }
  },
  methods: {
    ...mapMutations(['setUnread', 'setMessText']),
    microphoneControl() {
      this.isChatting = false;
      if (this.muteTip === '关闭麦克风') {
        this.$emit('microphoneHandel', false);
        this.muteTip = '打开麦克风';
      } else {
        this.$emit('microphoneHandel', true);
        this.muteTip = '关闭麦克风';
      }
    },
    cameraControl() {
      this.isChatting = false;
      if (this.muteTip === '关闭摄像头') {
        this.$emit('cameraHandel', false);
        this.muteTip = '打开摄像头';
      } else {
        this.$emit('cameraHandel', true);
        this.muteTip = '关闭摄像头';
      }
    },
    messText() {
      this.isChatting ? this.isChatting = false : this.isChatting = true;
      this.$nextTick(() => {
        var div = document.getElementById('message');
        div.scrollTop = div.scrollHeight;
      });
      this.setUnread(0);
      this.$emit('clearUnread');
    },
    hungUp() {
      this.$confirm('将结束本次通话，确定挂断吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false
      }).then(() => {
        if (this.businessInfo.isInvite === '0') {
          this.$AnyChatH5SDK.hangupVideoCall({
            userId: this.agentid
          });
        }
        this.$AnyChatH5SDK.leaveRoom();
        this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
        // 避免被catch捕捉
        console.log('视频结束');
      }).catch(() => {
        this.$notify.info({
          title: '提示',
          message: '已取消'
        });
      });
    },
    sendMess() {
      if (this.input === '') {
        return;
      }
      let code = this.$AnyChatH5SDK.sendMsg({
        msg: this.input
      });
      if (code === 0) {
        let msgObj = {
          id: this.userid,
          msg: this.input,
          time: current()
        };
        this.setMessText(msgObj);
        this.$nextTick(() => {
          this.input = '';
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.Intreactive {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  &>.btnBox{
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .item{
      height: 42px;
    }
    &>img, &>.item>img{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: white;
        border: 1px solid #ccc;
    }
    &>p, &>.item>p{
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        color: #ccc;
        margin: 9px 0px;
    }
  }
  .mess-box{
    width: 80%;
    height: 40%;
    position: fixed;
    left: 50%;
    top: 40%;
    transform: translateX(-50%);
    background-color: whitesmoke;
    z-index: 9999;
    border-radius: 10px;
    -moz-box-sizing: border-box; /*Firefox3.5+*/
    -webkit-box-sizing: border-box; /*Safari3.2+*/
    -o-box-sizing: border-box; /*Opera9.6*/
    -ms-box-sizing: border-box; /*IE8*/
    box-sizing: border-box;
    padding: 15px 10px;
    .mess-content{
      width: 100%;
      height: 75%;
      overflow-y: scroll;
      &>.mess-item{
        width: 96%;
        margin: 10px 0;
        &>.client-mess{
          display: flex;
          flex-direction: row;
          justify-content: left;
          align-items: flex-start;
          &>img{
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin: 5px;
          }
          &>.mess-right{
            text-align: left;
            &>.mess-time{
              color: #666;
              font-size: 12px;
            }
            &>.mess-text{
              word-break: break-all;
              font-size: 13px;
              -moz-box-sizing: border-box; /*Firefox3.5+*/
              -webkit-box-sizing: border-box; /*Safari3.2+*/
              -o-box-sizing: border-box; /*Opera9.6*/
              -ms-box-sizing: border-box; /*IE8*/
              box-sizing: border-box;
              padding: 9px;
              color: #333;
              background-color: #ddd;
              border-top-left-radius:0px;
              border-top-right-radius:8px;
              border-bottom-right-radius:8px;
              border-bottom-left-radius:8px;
            }
          }
        }
         &>.agent-mess{
          display: flex;
          flex-direction: row;
          justify-content: right;
          align-items: flex-start;
          &>img{
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin: 5px;
          }
          &>.mess-left{
            &>.mess-time{
              color: #666;
              font-size: 12px;
              text-align: right;
            }
            &>.mess-text{
              word-break: break-all;
              font-size: 13px;
              text-align: left;
              -moz-box-sizing: border-box; /*Firefox3.5+*/
              -webkit-box-sizing: border-box; /*Safari3.2+*/
              -o-box-sizing: border-box; /*Opera9.6*/
              -ms-box-sizing: border-box; /*IE8*/
              box-sizing: border-box;
              padding: 9px;
              color: white;
              background-color: #34C758;
              border-top-left-radius:8px;
              border-top-right-radius:0px;
              border-bottom-right-radius:8px;
              border-bottom-left-radius:8px;
            }
          }
        }
      }
    }
    .mess-send{
      display: flex;
    }
  }
}
</style>

