<template>
  <div class="row" @click="goDetail(opt.orderId)">
    <div class="avatar">
      <van-image :src="avatar" width="64" height="64" >
        <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
          <template v-slot:error>加载失败</template>
      </van-image>
    </div>
    <div class="expert-info">
      <div class="flex">
        <span class="expert-name">{{ opt.realName }}</span>
        <LevelIcon :level="opt.level" />
      </div>
      <div>
        <span>{{ opt.reservationDate | dateFilter}}</span>
        <span style="margin-left: 1em">{{ opt.timeRange }}</span>
      </div>
      <!-- <div v-if="opt.status === 0">等待支付</div> -->
      <div v-show='isStart' style="font-size: 11px">已到咨询时间，请开始视频咨询</div>
      <div v-show="!isStart " style="font-size: 11px">距离视频咨询开始：</div>
      <div v-show="!isStart " style="font-size: 11px">{{countDownTime}}</div>
    </div>
    <van-loading type="spinner"  v-if="countDownTime === ''"/>
    <div class="call-box" :class="isStart?'call-box-color-active':'call-box-color'" v-else>
      <!-- <div class="pay-btn" v-if="opt.status === 0">
        <p>立即支付</p>
      </div> -->
      <div class="call-btn"  @click.stop="isStart?startCall():''">
        <img src="../assets/slices/Fill.png" alt="" class="imgStyle" v-if="isStart"/>
        <img src="../assets/slices/Fill_g.png" alt="" class="imgStyle" v-else/>
        <p>视频咨询</p>
      </div>
    </div>
  </div>
</template>

<script>
import LevelIcon from '@/components/LevelIcon.vue';
import { countDown } from '../utils';
import apiHandel from '../api/apiHandel';
export default {
  name: 'AgentInfo',
  props: {
    opt: Object
  },
  components: {
    LevelIcon
  },
  data() {
    return {
      time: '2021/12/23 10:00:00',
      countDownTime: '',
      isStart: false,
      avatar: require('../assets/slices/defAvatar.png')
    };
  },
  filters: {
    dateFilter(val) {
      let arr = val.split(' ');
      return arr[0];
    }
  },
  created() {
    if (this.opt.status === 1) {
      this.getCountDown();
    }
    if (this.opt.avatarUrl) {
      this.avatar = this.obj.avatarUrl;
    }
  },
  beforeDestroy() {
  },
  methods: {
    goDetail(id) {
      this.$router.push({
        path: '/appointmentDetail',
        query: {
          orderId: id,
          state: this.opt.status === 0 ? 1 : 2 // 1为待支付，2为待咨询
        }
      });
    },
    getCountDown() {
      let timeStamp = new Date(this.opt.systemTime).getTime();
      let Intervaler = setInterval(() => {
        this.countDownTime = countDown(timeStamp, this.opt.startTime);
        if (this.countDownTime === 0) {
          clearInterval(Intervaler);
          this.isStart = true;
        }
        timeStamp = timeStamp + 1000;
      }, 1000);
    },
    startCall() {
      let params = {
        orderId: this.opt.orderId
      };
      apiHandel.startcall(params).then(res => {
        if (res) {
          this.$router.push('/callPage');
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
@defualtColor: #EC662B;
.row {
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 8px;
  background-color: #fff;
  margin: 10px;
  padding: 15px;
  box-sizing: border-box;
  &>div{
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909090;
  }
  .avatar {
    margin-right: 12px;
    .van-image {
      border-radius: 5px;
    }
  }
  .expert-info{
    height: 100%;
    flex: 1;
    color: #919191;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .flex{
      display: flex;
      flex-direction: row;
      align-items: center;
      .expert-name{
        color: #333;
        font-size: 15px;
        font-weight: 500;
        font-family: PingFangSC-Medium, PingFang SC;
      }
    }
  }
  .call-box{
    border-radius: 3px;
    .call-btn{
      box-sizing: content-box;
      padding: 8px 5px 4px 5px;
      text-align: center;
      .imgStyle{
        width: 20px;
      }
      p{
        margin-block-start: 0em;
        margin-block-end: 0em;
      }
    }
    .pay-btn {
      box-sizing: content-box;
      padding: 2px 5px;
    }
  }
  .call-box-color{
    background-color: #f2f2f2;
  }
  .call-box-color-active{
    background-color: #ED662C;
    color: #fff;
  }
}

</style>
