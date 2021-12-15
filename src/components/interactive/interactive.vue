<template>
  <div class="Intreactive">
    <div class="btnBox" >
      <img src="../../assets/Mute.png" alt="静音" @click="microphoneControl">
        <p v-text="muteTip"></p>
      </div>
        <div class="btnBox">
        <img src="../../assets/camera.png" alt="关闭摄像头" @click="cameraControl">
        <p v-text="cameraTip"></p>
      </div>
        <div class="btnBox">
        <img src="../../assets/message.png" alt="聊天" @click="messText">
        <p>聊天</p>
      </div>
        <div class="btnBox">
        <img src="../../assets/Hangup.png" alt="挂断" @click="hungUp">
        <p>挂断</p>
      </div>
  </div>
</template>

<script>
export default {
  name: 'Intreactive',
  data() {
    return {
      muteTip: '静音',
      cameraTip: '关闭摄像头'
    };
  },
  methods: {
    microphoneControl() {

    },
    cameraControl() {

    },
    messText() {

    },
    hungUp() {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
      console.log('logout');
    }
  }
};
</script>

<style lang="less" scoped>
.Intreactive {
  width: 100%;
  height: 100%;
  line-height: 100px;
  display: flex;
  flex-direction: row;
  &>.btnBox{
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &>img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: white;
        border: 1px solid #ccc;
    }
    &>p {
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        color: #ccc;
        margin: 7px 0px;
    }
  }
}
</style>
