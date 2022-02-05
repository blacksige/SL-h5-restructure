<template>
  <div class="top-nav-bar">
    <van-nav-bar
      :title="navbarTitle"
      :fixed = 'true'
      :placeholder='true'
      left-arrow
      @click-left="onClickLeft"
    >
      <template #left v-if="isExit">
        <van-icon name="cross" size="20" color="black"/>
      </template>
    </van-nav-bar>

  </div>
</template>

<script>
export default {
  name: 'TopNavBar',
  props: {
    isExit: {
      type: Boolean,
      default: false
    },
    navbarTitle: {
      type: String
    }
  },
  data() {
    return {

    };
  },
  methods: {
    onClickLeft() {
      this.$router.back(-1);
    }
  }
};
</script>

<style lang="less" scoped>
::v-deep {
  .van-nav-bar__title{
    font-size: 17px;
  }
  .van-nav-bar .van-icon{
    color: black;
  }
  .van-icon-arrow-left{
    font-size: 20px;
  }
}
.top-nav-bar{
  position: relative;
  z-index: 9999;
}
</style>
