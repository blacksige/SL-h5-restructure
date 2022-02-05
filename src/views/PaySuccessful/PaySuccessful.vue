<template>
  <van-loading size="60px" vertical v-if="isLoading" style="top:30%">加载中...</van-loading>
  <div class="pay-successful" v-else>
    <div class="pay-icon">
      <van-icon name="checked" color="#34C758" size="60px"/>
      <h3>支付成功</h3>
    </div>
    <ask-time :obj="askTime"></ask-time>
    <ask-content :obj="askContent"></ask-content>
    <van-button color="#EC662B" block @click="goHome">确定</van-button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import apiHandel from '../../api/apiHandel';
import AskContent from '../../components/AskContent.vue';
import AskTime from '../../components/AskTime.vue';
export default {
  components: { AskTime, AskContent },
  name: 'PaySuccessful',
  data() {
    return {
      barTitle: '支付成功',
      askTime: {
        year: '',
        time: ''
      },
      askContent: {
        askText: ''
      },
      avatarUrl: '',
      isLoading: true
    };
  },
  created() {
    this.updateTitle(this.barTitle);
    this.getOrderInfo();
  },
  methods: {
    ...mapMutations(['updateTitle']),
    goHome() {
      this.$router.push('/');
    },
    getOrderInfo() {
      let params = {
        orderNo: '20220107142344320689003484343846'
      };
      apiHandel.getOrderIfon(params).then(res => {
        this.askTime.year = res.content.serviceDate;
        this.askTime.time = res.content.timeRange;
        this.askContent.askText = res.content.consultRemark;
        this.isLoading = false;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.pay-successful {
  background-color: #fff;
  margin: 12px;
  padding: 15px;
  border-radius: 10px;
  .pay-icon{
    margin-top: 30px;
    margin-bottom: 50px;
  }
  .van-button {
    height: 40px;
    line-height: 40px;
  }
  &>div{
    margin-bottom: 15px;
  }
  .ask-time {
    border-bottom: 1px dashed #ddd;
    padding: 10px 0;
  }
}

</style>
