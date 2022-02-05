<template>
  <div class="elite-investment">
    <van-search
      v-model="realName"
      shape="round"
      background="#F2F2F7"
      placeholder="请输入专家名称"
      input-align="center"
      @search="getInputValue"
    />
    <swiper :Info="reservedData"></swiper>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        error-text = '请求失败'
        @load="onLoad"
        v-show="!refreshing"
      >
        <expert :obj="item" v-for="(item, index) in expertData" :key="index"></expert>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import apiHandel from '../../api/apiHandel';
import Expert from '../../components/Expert.vue';
import Swiper from '../../components/Swiper.vue';
import { mapState } from 'vuex';
export default {
  components: { Expert, Swiper },
  name: 'ElitInvestment',
  data() {
    return {
      loading: false,
      finished: false,
      refreshing: false,
      expertData: [],
      reservedData: [],
      realName: ''
    };
  },
  computed: {
    ...mapState(['userId'])
  },
  created() {
    this.getMyReservation();
    // if (this.expertData.length === 0) {
    //   this.onLoad();
    // }
  },
  methods: {
    getInputValue(value) {
      // 清空列表数据
      this.realName = value;
      this.expertData = [];
      this.offset = 0;
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    },
    onLoad() {
      let params = {
        offset: this.offset || 0,
        pageSize: 10,
        realName: this.realName || '',
        sortField: '',
        sortType: '',
        tagCode: ''
      };
      apiHandel.getConsultantList(params).then(res => {
        if (this.refreshing) {
          this.expertData = [];
          this.offset = 0;
          this.refreshing = false;
        }
        this.expertData.push(...res.content.resultList);
        this.totalLength = res.content.count;
        this.offset = this.offset + res.content.pageSize;

        this.loading = false;
        if (this.expertData.length >= this.totalLength) {
          this.finished = true;
        }
      });
    },
    onRefresh() {
      // 清空列表数据
      this.expertData = [];
      this.offset = 0;
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    },
    getMyReservation() {
      let params = {
        userId: this.userId || '',
        offset: this.offset || 0,
        type: 'Paid'
      };
      apiHandel.getMyReservation(params).then(res => {
        this.reservedData = res;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.elite-investment{
  .van-search{
    padding: 5px 12px 5px 12px;
    .van-search__content{
      background-color: white;
    }
  }
}
</style>
