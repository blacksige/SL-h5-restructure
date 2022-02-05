<template>
  <div class="my-collection">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        v-show="!refreshing"
      >
      <expert v-for="item, index in expertData" :key="index" :obj="item"></expert>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import Expert from '../../components/Expert.vue';
import { mapMutations, mapState } from 'vuex';
import apiHandel from '../../api/apiHandel';
export default {
  components: { Expert },
  name: 'MyACollection',
  data() {
    return {
      barTitle: '我的收藏',
      loading: false,
      finished: false,
      refreshing: false,
      expertData: []
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
        offset: this.offset || 0,
        pageSize: 10,
        userId: this.userId || '',
        sortField: '',
        sortType: ''
      };
      apiHandel.getCollectionList(params).then(res => {
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
    }
  }
};
</script>

<style lang="less" scoped>
// .my-collection{
// }
</style>
