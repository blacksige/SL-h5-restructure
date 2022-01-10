<!--聊天交互-->
<template>
  <div class="Intreactive">
    <div class="btnBox" >
      <img src="../../assets/slices/no-mute.png" alt="静音" @click="microphoneControl" v-show="muteTip === '静音'">
      <img src="../../assets/slices/mute.png" alt="取消静音" @click="microphoneControl" v-show="muteTip === '取消静音'">
        <p v-text="muteTip"></p>
    </div>
    <div class="btnBox">
      <img src="../../assets/slices/open-camera.png" alt="关闭摄像头" @click="cameraControl" v-show="cameraTip === '关闭摄像头'">
      <img src="../../assets/slices/close-camera.png" alt="打开摄像头" @click="cameraControl" v-show="cameraTip === '打开摄像头'">
      <p v-text="cameraTip"></p>
    </div>
    <div class="btnBox">
      <van-badge :content="msgNum" class="item" :class="{ iconnone : msgNum === 0 ? true : false}">
        <img src="../../assets/slices/message.png" alt="聊天" @click="messText">
      </van-badge>
      <p>聊天</p>
    </div>
    <div class="btnBox">
      <img src="../../assets/slices/Hangup.png" alt="挂断" @click="hungUp">
      <p>挂断</p>
    </div>
    <div class="mess-box" v-show="isChatting">
      <div class="mess-content" id="message">
        <div class="mess-item" v-for="item in messTextList" :key="item.index">
          <div v-if="item.id === userid" class="client-mess">
            <img src="../../assets/slices/avatar.png" alt="">
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
            <img src="../../assets/slices/avatar.png" alt="">
          </div>
        </div>
      </div>
      <div class="mess-send">
        <van-field v-model="input" placeholder="请输入内容" />
        <van-button type="info" @click="sendMess" style="margin-left: 10px; width: 70px; font-size: 13px;">发送</van-button>
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
      muteTip: '静音',
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
      if (this.muteTip === '静音') {
        this.$emit('microphoneHandel', false);
        this.$toast('麦克风已关闭');
        this.muteTip = '取消静音';
      } else {
        this.$emit('microphoneHandel', true);
        this.$toast('麦克风已打开');
        this.muteTip = '静音';
      }
    },
    cameraControl() {
      this.isChatting = false;
      if (this.cameraTip === '关闭摄像头') {
        this.$emit('cameraHandel', false);
        this.$toast('摄像头已关闭');
        this.cameraTip = '打开摄像头';
      } else {
        this.$emit('cameraHandel', true);
        this.$toast('摄像头已打开');
        this.cameraTip = '关闭摄像头';
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
      this.isChatting = false;
      this.$dialog.confirm({
        title: '提示',
        message: '确认结束通话吗？'
      })
        .then(() => {
          if (this.businessInfo.isInvite === '0') {
            this.$AnyChatH5SDK.hangupVideoCall({
              userId: this.agentid
            });
          }
          // this.$AnyChatH5SDK.leaveRoom();
          // this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
        })
        .catch(() => {
          this.$notify({ type: 'primary', message: '已取消' });
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
          var div = document.getElementById('message');
          div.scrollTop = div.scrollHeight;
          this.input = '';
        });
      } else {
        this.$toast('信息发送失败');
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
    justify-content: center;
    .item{
      height: 42px;
    }
    .iconnone{
      ::v-deep .van-badge{
        display: none;
      }
    }
    &>img, &>.item>img{
        width: 40px;
        height: 40px;
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
    background-color: white;
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
              background-color: #f2f2f2;
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
      .van-cell{
        background-color: #f2f2f2;
      }
    }
  }
}
</style>

