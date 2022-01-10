<!--视频上下行速率组件-->
<template>
  <div class="time-reminder" v-cloak>
    <div></div>
    <div></div>
    <div></div>
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
  height: 100%;
  text-align: center;
  font-size: 12px;
  color: #eee;
  &>div{
    width: 33.33%;
  }
}
</style>
