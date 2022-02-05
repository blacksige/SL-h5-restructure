<!--视频上下行速率组件-->
<template>
  <div class="time-reminder" v-cloak>
    <div></div>
    <div>通话时长：10:00</div>
    <div style="text-align: right">倒计时：30秒</div>
  </div>
</template>

<script>
export default {
  name: 'TimeReminder',
  data() {
    return {

    };
  },
  mounted() {
    // this.showRatetimer ? clearInterval(this.showRatetimer) : this.showRatetimer = null;
    // this.startGetRate();
  },
  beforeDestroy() {
    // this.showRatetimer ? clearInterval(this.showRatetimer) : this.showRatetimer = null;
  },
  methods: {

  }
};
</script>

<style lang="less" scoped>
[v-cloak] {
    display: none;
}
.time-reminder {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #eee;
  line-height: 30px;
  font-size: 14px;
  &>div{
    width: 33.33%;
  }
}
</style>
