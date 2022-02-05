<template>
  <div class="phone">
      <div class="title">
        服务手机号
        <span class="tips">(此手机号仅用于本次服务过程中的通知用途)</span>
      </div>
      <van-field
        v-model="tel"
        center
        clearable
        label="手机号"
        placeholder="请输入手机号"
      >
        <template #button >
          <span @click="modifyPhone">修改</span><van-icon name="arrow" />
        </template>
      </van-field>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {

  },
  data() {
    return {
      tel: '123122908099'
    };
  },
  computed: {

  },
  created() {

  },
  methods: {
    modifyPhone() {
      this.$router.push('/modifyPhone');
    }
  }
};
</script>

<style lang="less" scoped>
@defualtColor: #EC662B;
.phone{
  background-color: white;
  &>.title{
    font-size: 15px;
    font-weight: 500;
    color: #333;
    &>.tips{
      font-size: 11px;
      color: #999;
    }
  }
  &>.van-cell{
    padding: 10px 0;
  }
}

</style>
