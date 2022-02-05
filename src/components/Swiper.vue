<template>
  <van-swipe class="my-swipe" indicator-color="orange">
    <van-swipe-item v-for="(item,index) in Info" :key="index">
      <AgentInfo :opt="item" style="border: 1px solid #EC662B;"/>
    </van-swipe-item>
  </van-swipe>
</template>

<script>
import AgentInfo from '@/components/AgentInfo.vue';

export default {
  name: 'Consultation',
  props: {
    Info: Array
  },
  components: {
    AgentInfo
  },
  methods: {
  }
};
</script>

<style lang="less" scoped>
.van-swipe {
  ::v-deep .van-swipe-item {
  width: 100%;
  color: #333;
  font-size: 18px;
  text-align: center;
  background-color: #F2F2F7;
  }
  ::v-deep .van-swipe__indicators {
    bottom: 0;
    .van-swipe__indicator {
      background-color: #E1E1E1;
      opacity: 1;
    }
  }
}
</style>
