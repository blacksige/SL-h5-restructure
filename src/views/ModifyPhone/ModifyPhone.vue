<template>
  <div class="modify-phone">
    <van-notice-bar
      left-icon="warning-o"
      :scrollable="false"
      color="#EC662B"
      background="#FFEDE5"
      style="font-size:12px"
      text="此手机号仅用于本次服务过程中的通知用途。"
    />
    <phone-verification></phone-verification>
    <div class="btn">
      <van-button type="primary" color="#EC662B" style="width: 100%">确认修改</van-button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import PhoneVerification from '../../components/PhoneVerification.vue';
export default {
  name: 'Home',
  components: {
    PhoneVerification

  },
  data() {
    return {
      barTitle: '修改手机号',
      sms: '',
      tel: '123122908099',
      newTel: ''
    };
  },
  computed: {

  },
  created() {
    this.updateTitle(this.barTitle);
  },
  methods: {
    ...mapMutations(['updateTitle'])
  }
};
</script>

<style lang="less" scoped>
@defualtColor: #EC662B;
.modify-phone{
  padding: 0 15px;
  background-color: white;
  height: calc(100% - 46px);
  .van-notice-bar{
    margin: 0 -15px 15px -15px;
  }
  .btn{
    margin-top: 50px;
  }
}

</style>
