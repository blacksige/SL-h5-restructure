<template>
  <div class="home">
    <van-tabs v-model="active"  color="#EC662B" swipeable animated>
      <van-tab title="咨询内容" name="content">
        <consultation-content></consultation-content>
      </van-tab>
      <van-tab title="精英投顾" name="list">
        <elite-investment></elite-investment>
      </van-tab>
    </van-tabs>
    <my-btn></my-btn>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import MyBtn from '../../components/MyBtn.vue';
import ConsultationContent from '../HomeComponents/ConsultationContent.vue';
import EliteInvestment from '../HomeComponents/EliteInvestment.vue';
export default {
  name: 'Home',
  components: {
    ConsultationContent,
    EliteInvestment,
    MyBtn
  },
  data() {
    return {
      barTitle: '投顾预约',
      active: 'content'
    };
  },
  computed: {
    ...mapState(['activeVal'])
  },
  created() {
    this.updateTitle(this.barTitle);
    this.active = this.activeVal;
  },
  methods: {
    ...mapMutations(['updateTitle', 'updateActiveVal'])
  },
  watch: {
    'active'(newVal) {
      this.updateActiveVal(newVal);
    }
  }
};
</script>

<style lang="less" scoped>
@defualtColor: #EC662B;
.home{
  .van-tabs{
    ::v-deep .van-tabs__wrap{
      margin-bottom: 8px;
    }
  }
}

</style>
