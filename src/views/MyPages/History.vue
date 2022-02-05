<template>
  <div class="history">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        v-show="!refreshing"
      >
        <div class="expert"  v-for="obj, index in expertData" :key="index" @click="goDetail(obj.payStatus, obj.commentStatus, obj.orderId)">
          <div class="expert-item">
            <div class="expert-avatar">
              <van-image :src="obj.avatarUrl?obj.avatarUrl:avatar" width="64" height="64">
                <template v-slot:loading>
                  <van-loading type="spinner" size="20" />
                </template>
                <template v-slot:error>加载失败</template>
              </van-image>
            </div>
            <div class="expert-info">
              <div class="head-info">
                <span style="font-size:16px;font-weight: 500;">{{obj.realName}}</span>
                <span style="flex:1">
                </span>
                <span>
                  <van-tag  color="#a6a6a6" size="medium" v-if="obj.payStatus === 2 || obj.payStatus === 3">{{ obj.payStatus | formatPayStauts }}</van-tag>
                  <van-tag  color="#a6a6a6" size="medium" v-else>{{ obj.commentStatus | formatCommentStauts }}</van-tag>
                </span>
              </div>
              <div class="center-info">{{obj.serviceDate | formatDate }}&nbsp;&nbsp;{{obj.timeRange}}</div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import apiHandel from '../../api/apiHandel';
export default {
  name: 'History',
  data() {
    return {
      barTitle: '历史记录',
      loading: false,
      finished: false,
      refreshing: false,
      expertData: [],
      offset: 0,
      PAY_STATUSList: [],
      COMMENT_STATUSList: [],
      avatar: require('../../assets/slices/defAvatar.png')
    };
  },
  filters: {
    formatDate: function (value) {
      if (!value) return '';
      let arr = value.split('-');
      let val = arr[0] + '年' + arr[1] + '月' + arr[2] + '日';
      return val;
    },
    formatCommentStauts: function (val) {
      let arr = JSON.parse(localStorage.getItem('COMMENT_STATUSList'));
      let text = '';
      arr.forEach(item => {
        if (parseInt(item.dictKey) === val) {
          text = item.dictValue;
        }
      });
      return text;
    },
    formatPayStauts: function (val) {
      let arr = JSON.parse(localStorage.getItem('PAY_STATUSList'));
      let text = '';
      arr.forEach(item => {
        if (parseInt(item.dictKey) === val) {
          text = item.dictValue;
        }
      });
      return text;
    }
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
      apiHandel.getHistoryList(params).then(res => {
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
    goDetail(payState, commentState, orderId) {
      let stauts = 0;
      if (payState === 2 || payState === 3) { // 已取消
        stauts = 5;
      } else if (commentState === 1) { // 已完成
        stauts = 4;
      } else if (commentState === 0) { // 待评价
        stauts = 3;
      }
      this.$router.push({
        path: '/appointmentDetail',
        query: {
          orderId: orderId,
          state: stauts
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.history{
  .expert{
    width: 100%;
    .expert-item {
      margin: 10px;
      padding: 8px;
      background-color: white;
      display: flex;
      border-radius: 8px;
      flex-direction: row;
      .expert-avatar{
        margin: 8px;
      }
      .expert-info{
        margin-left: 5px;
        margin-top: 5px;
        margin-right: 5px;
        display: flex;
        flex-direction: column;
        flex: 1;
        &>div{
          width: 100%;
          text-align: left;
        }
        .head-info{
          display: flex;
          align-items: center;
          &>span {
            display: block;
          }
        }
        .center-info {
          margin-top: 5px;
          font-size: 12px;
          color: #929299;
          font-weight: 400;
          font-family: PingFangSC-Regular, PingFang SC;
        }
      }
    }
  }
}
</style>
