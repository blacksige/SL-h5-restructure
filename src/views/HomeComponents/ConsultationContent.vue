<template>
  <div class="consultation-content">
    <swiper :Info="reservedData"></swiper>
    <van-collapse v-model="labels" v-for="obj, index in Stocks" :key="index">
      <van-collapse-item :title="obj.tagTypeName" :name="obj.tagTypeName" class="item" right-icon = ''>
        <p v-if="obj.tagList.length === 0 || !obj.tagList">暂无</p>
        <plate v-for="item, index in obj.tagList" :key="index" :info="item" v-else></plate>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script>
import Plate from '../../components/Plate.vue';
import Swiper from '../../components/Swiper.vue';
import apiHandel from '../../api/apiHandel.js';
import { mapState } from 'vuex';
export default {
  name: 'ConsultationContent',
  components: {
    Swiper,
    Plate

  },
  data() {
    return {
      Stocks: [],
      reservedData: [],
      labels: []
    };
  },
  computed: {
    ...mapState(['userId'])
  },
  created() {
    this.getMyReservation();
    this.getTagsList();
  },
  methods: {
    getTagsList() {
      apiHandel.getConsulttagList().then(res => {
        this.Stocks = res.content;
      });
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
.consultation-content{
  .van-collapse{
    margin: 12px 10px;
    text-align: left;
    font-weight: 700;
  }
  ::v-deep .van-cell{
    border-radius: 8px 8px 8px 8px;
    padding: 12px 16px;
    webkit-transition: all 1s;
    transition: all 1s;
  }
  ::v-deep .van-collapse-item__title--expanded{
    border-radius: 8px 8px 0px 0px;
    .van-cell__title{
      font-weight: 400;
      font-family: PingFangSC-Regular, PingFang SC;
    }
  }
  ::v-deep .van-collapse-item__title{
    .van-cell__title{
      font-weight: 400;
      font-family: PingFangSC-Regular, PingFang SC;
    }
  }
  ::v-deep .van-collapse-item__wrapper{
    border-radius: 0 0 8px 8px;
      .van-collapse-item__content {
        padding: 12px 16px 16px 16px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
      }
  }
}
</style>
