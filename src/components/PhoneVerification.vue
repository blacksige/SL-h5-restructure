<template>
  <div class="phone-verification">
    <van-field
      v-model="phoneNumber"
      center
      label-width='4em'
      clearable
      label="手机号"
      @input="getPhone"
      placeholder="请输入手机号">
    </van-field>

    <van-field
      v-model="veerCode"
      center
      clearable
      label-width='4em'
      label="验证码"
      @input="getveerCode"
      placeholder="请输入短信验证码">
      <template #button>
        <van-button size="small" type="primary" plain color="#EC662B">发送验证码</van-button>
      </template>
    </van-field>
  </div>
</template>

<script>
export default {
  name: 'PhoneVerification',
  data() {
    return {
      veerCode: 123456,
      phoneNumber: 123344
    };
  },
  methods: {
    getPhone(e) {
      console.log(e);
    },
    getveerCode(e) {
      console.log(e);
    }
  }
};
</script>

<style lang="less" scoped>
.phone-verification{
  .van-cell{
    padding: 10px 0px;
    font-size: 15px;
    border-bottom: 1px solid #ddd;
  }
}
</style>
