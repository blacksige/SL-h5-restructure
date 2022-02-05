<template>
  <div class="my-btn">
   <van-popover
    v-model="showPopover"
    trigger="click"
    :actions="actions"
    @select="onSelect"
    placement="top-end"
  >
    <template #reference>
      <van-button class="btn-style">我的</van-button>
    </template>
  </van-popover>

  </div>
</template>

<script>
export default {
  name: 'MyBtn',
  data() {
    return {
      showPopover: false,
      // 通过 actions 属性来定义菜单选项
      actions: [{ text: '我的预约' }, { text: '历史记录' }, { text: '我的收藏' }]
    };
  },
  methods: {
    onSelect(action) {
      if (action.text === '我的预约') {
        this.$router.push('/appointment');
      } else if (action.text === '历史记录') {
        this.$router.push('/history');
      } else if (action.text === '我的收藏') {
        this.$router.push('/collection');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.my-btn{
  width: 50px;
  height: 50px;
  position: fixed;
  bottom: 40px;
  right: 20px;
}
.btn-style{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 12px;
  padding: 0;
  color: white;
  // color: #EC662B;
  background-color: #EC662B;
}
::v-deep .van-icon{
  color: white;
  font-size: 25px;
}
</style>
