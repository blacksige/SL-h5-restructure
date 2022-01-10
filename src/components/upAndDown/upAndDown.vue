<!--视频上下行速率组件-->
<template>
  <div class="UpAndDown" v-cloak>
    <span>上行: {{upData}}KB/s</span>
    <span>下行: {{downData}}KB/s</span>
  </div>
</template>

<script>
export default {
  name: 'UpAndDown',
  data() {
    return {
      uploadAudioRate: 0,
      uploadVideoRate: 0,
      downloadAudioRate: 0,
      downloadVideoRate: 0,

      userList: [],
      showRatetimer: {},

      upData: 0,
      downData: 0
    };
  },
  mounted() {
    this.showRatetimer ? clearInterval(this.showRatetimer) : this.showRatetimer = null;
    this.startGetRate();
  },
  beforeDestroy() {
    this.showRatetimer ? clearInterval(this.showRatetimer) : this.showRatetimer = null;
  },
  methods: {
    startGetRate() {
      let W = window;
      this.showRatetimer = setInterval(() => {
        this.uploadAudioRate = W.BRAC_QueryUserStateInt(-1, W.BRAC_USERSTATE_AUDIOBITRATE) || 0;
        this.uploadVideoRate = W.BRAC_QueryUserStateInt(-1, W.BRAC_USERSTATE_VIDEOBITRATE) || 0;
        this.userList = W.BRAC_GetOnlineUser();
        this.userList.forEach((id) => {
          this.downloadAudioRate += W.BRAC_QueryUserStateInt(id, W.BRAC_USERSTATE_AUDIOBITRATE) || 0;
          this.downloadVideoRate += W.BRAC_QueryUserStateInt(id, W.BRAC_USERSTATE_VIDEOBITRATE) || 0;
        });

        this.upData = this.uploadAudioRate + this.uploadVideoRate;
        this.downData = this.downloadVideoRate + this.downloadAudioRate;

        this.uploadAudioRate = 0;
        this.uploadVideoRate = 0;
        this.downloadAudioRate = 0;
        this.downloadVideoRate = 0;
      }, 1000);
    }
  }
};
</script>

<style lang="less" scoped>
[v-cloak] {
    display: none;
}
.UpAndDown {
  width: 100%;
  height: 100%;
  text-align: left;
  font-size: 15px;
  color: rgb(112, 209, 136);
  &>span{
    margin-right: 12px;
  }
}
</style>
