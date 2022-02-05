<template>
  <div class="my-appointment">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        v-show="!refreshing"
      >
        <agent-info v-for="(item, index) in reservedData" :key="index" :opt="item"></agent-info>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import AgentInfo from '../../components/AgentInfo.vue';
import { mapMutations, mapState } from 'vuex';
import apiHandel from '../../api/apiHandel';
export default {
  components: { AgentInfo },
  name: 'MyAppointment',
  data() {
    return {
      barTitle: '我的预约',
      loading: false,
      finished: false,
      refreshing: false,
      reservedData: [],
      offset: 0
    };
  },
  created() {
    this.updateTitle(this.barTitle);
  },
  computed: {
    ...mapState(['userId'])
  },
  methods: {
    ...mapMutations(['updateTitle']),
    onLoad() {
      let params = {
        userId: this.userId,
        offset: this.offset || 0,
        pageSize: 10,
        type: 'PaidOfWaittingPay'
      };
      apiHandel.getMyReservation(params).then(res => {
        if (this.refreshing) {
          this.reservedData = [];
          this.offset = 0;
          this.refreshing = false;
        }
        this.reservedData.push(...res);
        this.totalLength = this.reservedData.length;
        this.offset = this.offset + 10;

        this.loading = false;
        if (this.reservedData.length >= this.totalLength) {
          this.finished = true;
        }
      });
    },
    onRefresh() {
      // 清空列表数据
      this.reservedData = [];
      this.offset = 0;
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    }
  }
};
</script>

<style lang="less" scoped>

</style>
