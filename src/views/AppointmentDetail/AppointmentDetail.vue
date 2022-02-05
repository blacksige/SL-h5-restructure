<template>
  <van-loading size="60px" vertical v-if="isLoading" style="top:30%">加载中...</van-loading>
  <div class="appointment-detail" v-else>
    <div class="customer">
      <div class="expert-avatar">
        <van-image :src="avatar" width="66" height="66">
          <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
          <template v-slot:error>加载失败</template>
        </van-image>
      </div>
      <div class="expert-info">
        <div class="name">
          <span>{{ appointmentInfo.realName }}</span>
          <LevelIcon :level="appointmentInfo.level" />
        </div>
        <div class="number">执业证号：{{ appointmentInfo.certNum }}</div>
        <div class="rate">
          综合评分:&nbsp;
          <van-rate
            v-model="appointmentInfo.score"
            allow-half
            void-icon="star"
            color="#EC662B"
            readonly
            size="16px"
          />
          <span class="score">{{ appointmentInfo.score }}</span>
        </div>
      </div>
      <div class="money">
        ￥{{ appointmentInfo.payAmount }}
      </div>
    </div>
    <div class="consultation-time">
      <ask-time :obj="askTime"></ask-time>
      <div v-show="state === 2 && countDownTime !== 0 ">距离视频咨询开始：{{countDownTime}}</div>
      <div v-show="state === 2 && countDownTime === 0 ">已到咨询时间,请开始视频咨询</div>
    </div>
    <div class="consultation-content">
      <ask-content :obj="askContent" :hasTag = 'true'></ask-content>
      <div class="expertTitle" v-show="state === 4">专家反馈</div>
      <van-field class='expert-reply' rows="2" maxlength="300" autosize type="textarea" :value="appointmentInfo.replyContent" disabled v-show="state === 4"/>
      <van-image :src="appointmentInfo.fileUrl" width="100" height="71" v-show="state === 4">
          <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
          <template v-slot:error>加载失败</template>
      </van-image>
    </div>
    <div class="order">
      <div class="order-title">订单信息</div>
      <!-- <div class="create-time" v-show="state === 1">
        创建时间:&nbsp;&nbsp;{{createDate}}&nbsp;{{createTime}}
      </div> -->
      <div class="create-time" v-show="state !== 1">支付时间:&nbsp;&nbsp;{{ appointmentInfo.payTime }}</div>
      <div v-show="state === 5">退款时间:&nbsp;&nbsp;{{appointmentInfo.cancelTime}}</div>
      <div class="phone-number">手机号:&nbsp;&nbsp;{{appointmentInfo.userPhone}}</div>
    </div>
    <div class="footer" v-show="state && state !== 4 && state !== 5">
      <!-- <div class="appointment-button" v-if="state === 1">
        <van-button block color="#EC662B" @click="pay">立即支付</van-button>
        <van-button class="cancel" block color="#fff" @click="cancelCancellation ">取消订单</van-button>
      </div> -->
      <div class="appointment-button" v-if="state === 2">
        <van-button block disabled color="#e9e9e9" v-show="countDownTime !== 0" class="btn-disabled btn-img"><img src="../../assets/slices/Fill_g.png" />视频咨询&nbsp;{{countDownTime}}</van-button>
        <van-button class="cancel" block color="#fff" @click="cancelConsultation" v-show="countDownTime !== 0">取消预约</van-button>
        <van-button block color="#EC662B" v-show="countDownTime === 0" class="btn-img" @click="startCall"><img src="../../assets/slices/Fill.png" />视频咨询</van-button>
      </div>
      <div class="appointment-button" v-else-if="state === 3">
        <van-button block color="#EC662B" @click="goEvaluation">评价</van-button>
      </div>
    </div>
    <van-popup v-model="show" round position="bottom" :style="{ height: '55%' }" closeable>
      <div class="cancel-box">
        <p class="cancelTitel">取消预约</p>
        <div class="prompt-text">请输入验证码确认取消预约，退款将在三个工作日内退回资金账户</div>
        <phone-verification></phone-verification>
        <van-button block color="#EC662B" @click="cancelAppointment">确定</van-button>
        <van-button class="cancel" block color="#fff" @click="show = false">取消</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import AskContent from '../../components/AskContent.vue';
import AskTime from '../../components/AskTime.vue';
import PhoneVerification from '../../components/PhoneVerification.vue';
import LevelIcon from '../../components/LevelIcon.vue';
import { mapMutations, mapState } from 'vuex';
import apiHandel from '../../api/apiHandel';
import { countDown } from '../../utils';

export default {
  name: 'Details',
  components: {
    LevelIcon,
    PhoneVerification,
    AskTime,
    AskContent
  },
  data() {
    return {
      barTitle: '',
      createDate: '2021-12-06',
      createTime: '10:00:00',
      countDownTime: '00:00:00', // 倒计时
      refundTime: '2021-12-08 10:00:00', // 退款时间
      state: null, //  2 待咨询 3 待评价 4 已完成 5 已取消
      show: false,

      isLoading: true,
      appointmentInfo: {},
      askTime: {},
      askContent: {},

      avatar: require('../../assets/slices/defAvatar.png')
    };
  },
  watch: {
    'state'(val) {
      switch (val) {
        // case 1:
        //   this.barTitle = '待支付';
        //   break;
        case 2:
          this.barTitle = '待咨询';
          break;
        case 3:
          this.barTitle = '待评价';
          break;
        case 4:
          this.barTitle = '已完成';
          break;
        case 5:
          this.barTitle = '已取消';
          break;
        default:
          this.barTitle = '待咨询';
          break;
      }
      this.updateTitle(this.barTitle);
    }
  },
  created() {
    this.updateTitle(this.barTitle);
    this.state = Number(this.$route.query.state) || 2;
    this.getHistoryInfo();
  },
  computed: {
    ...mapState(['userId'])
  },
  beforeDestroy() {
    this.countDownTime ? clearInterval(this.countDownTime) : this.countDownTime = null;
  },
  methods: {
    ...mapMutations(['updateTitle']),
    getHistoryInfo() {
      let params = {
        orderId: Number(this.$route.query.orderId),
        userId: this.userId
      };
      apiHandel.getHistoryInfo(params).then(res => {
        this.appointmentInfo = res.content[0];
        // 默认头像
        if (this.appointmentInfo.avatarUrl) {
          this.avatar = this.appointmentInfo.avatarUrl;
        }
        this.askTime = {
          year: this.appointmentInfo.serviceDate,
          time: this.appointmentInfo.timeRange
        };
        this.getCountDown();
        this.getTagsList();
        this.isLoading = false;
      });
    },
    getTagsList() {
      let params = {
        consultantId: this.appointmentInfo.consultantId,
        userId: this.appointmentInfo.userId
      };
      apiHandel.getConsultantInfo(params).then(res => {
        let arr = [];
        arr = res.content.consultTags.map(item => {
          return item.tagName;
        });
        this.askContent = {
          askText: this.appointmentInfo.consultRemark,
          asktagsList: arr
        };
        console.log(this.askContent);
      });
    },
    getCountDown() {
      if (this.state === 2) {
        let timeStamp = new Date(this.appointmentInfo.systemTime).getTime();
        this.countDownTime = countDown(timeStamp, this.appointmentInfo.startTime);
        let Intervaler = setInterval(() => {
          if (this.countDownTime === 0) {
            clearInterval(Intervaler);
          }
          timeStamp = timeStamp + 1000;
          this.countDownTime = countDown(timeStamp, this.appointmentInfo.startTime);
        }, 1000);
      }
    },
    // cancelCancellation() {
    //   this.$dialog.confirm({
    //     title: '取消订单',
    //     message: '预约不易,确定取消订单吗？'
    //   })
    //     .then(() => {
    //       let params = {
    //         orderNo: this.appointmentInfo.orderNo
    //       };
    //       apiHandel.cancelOrder(params).then(res => {
    //         if (res) {
    //           this.state = 5;
    //         }
    //       });
    //     })
    //     .catch(() => {
    //     // on cancel
    //     });
    // },
    cancelConsultation() {
      this.show = true;
    },
    cancelAppointment() {
      this.$dialog.confirm({
        title: '取消订单',
        message: '预约不易,确定取消订单吗？'
      })
        .then(() => {
          let params = {
            orderNo: this.appointmentInfo.orderNo
          };
          apiHandel.cancelOrder(params).then(res => {
            if (res) {
              this.state = 5;
              this.show = false;
            }
          });
        })
        .catch(() => {
        // on cancel
        });
    },
    // pay() {
    //   this.$router.push('/paysuccessful');
    // },
    goEvaluation() {
      this.$router.push({
        path: '/evaluation',
        query: {
          consultantId: this.appointmentInfo.consultantId,
          orderId: this.appointmentInfo.orderId
        }
      });
    },
    startCall() {
      let params = {
        orderId: this.appointmentInfo.orderId
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
.appointment-detail {
  display: flex;
  flex-direction: column;
  background-color: #eee;
  text-align: left;
  height: 100%;
  &>div{
    padding: 15px;
  }
  .customer {
    display: flex;
    flex-direction: row;
    background-color: #fff;
    margin-bottom: 10px;
    .expert-avatar {
      .van-image {
        border-radius: 5px;
        overflow: hidden;
      }
    }
    .expert-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      text-align: left;
      margin-left: 13px;
      .name {
        display: flex;
        & > span {
         margin-right: 17.5px;
         height: 20px;
         font-size: 15px;
         font-weight: 500;
         color: #333;
         line-height: 20px;
        }
      }
      .number {
        height: 16px;
        font-size: 12px;
        font-weight: 400;
        color: #929292;
        line-height: 16px;
      }
      .rate {
        height: 16px;
        font-size: 12px;
        font-weight: 400;
        color: #929292;
        line-height: 16px;
        .score {
          font-size: 15px;
          margin-left: 5px;
          color: #ec662b;
        }
      }
    }
    .money {
        font-size: 20px;
        font-weight: 500;
        color: #E02020;
    }
  }
  .consultation-time {
    background-color: #fff;
    margin-bottom: 10px;
    color: #888;
    font-size: 15px;
    & > div {
      margin-bottom: 10px;
    }
    .interval {
      display: inline-block;
      height: 12px;
      margin: 0 10px;
      border-right: 1.5px solid #333;
    }
  }
  .consultation-content {
    background-color: #fff;
    margin-bottom: 10px;
    .label {
      margin-right: -10px;
      & > span {
        padding: 5px 15px;
        margin: 10px 10px 10px 0;
      }
    }
    .van-cell {
      background-color: #f2f2f2;
      border-radius: 5px;
      font-weight: 400;
      font-size: 11px;
      ::v-deep .van-field__control:disabled {
        color: #888;
        -webkit-text-fill-color: #888 !important;
      }
    }
    .expertTitle {
      margin-top: 10px;
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }
    .expert-reply {
      margin: 10px 0;
    }
  }
  .order {
    background-color: #fff;
    flex: 1;
    .order-title{
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }
    div:nth-child(n+2){
      margin-top: 10px;
      font-size: 14px;
      font-weight: 400;
      color: #929292;
    }
    .phone-number {
      font-size: 13px;
    }
  }
  .footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    border-top: 1px solid #eee;
    background-color: #fff;
    box-sizing: border-box;
    .appointment-button {
      .van-button:nth-child(-n+1){
        margin-bottom: 10px;
        border-radius: 3px;
      }
      .cancel {
        color: #888 !important;
      }
      .btn-disabled {
        color: #A8A8A8 !important;
      }
      .btn-img {
        .van-button__text {
          position: relative;
          img {
            height: 18px;
            position: absolute;
            top: 50%;
            left: -10px;
            transform: translate(-100%,-50%);
          }
        }
      }
    }
  }
}
.van-popup{
  box-sizing: border-box;
  padding: 20px 15px 10px 15px !important;
  .cancel-box {
    height: 100%;
    box-sizing: border-box;
    color: #333;
    font-size: 15px;
    font-weight: 500;
    .cancelTitel{
      font-weight: 500;
      font-family: PingFangSC-Medium, PingFang SC;
      color: #333;
    }
    .prompt-text {
      margin: 10px 0 20px;
      font-size: 14px;
      font-weight: 400;
      color: #929392;
    }
    .van-button {
      margin-top: 50px;
    }
    .cancel {
      margin-top: 10px;
      color: #888 !important;
    }
  }
}
.van-button {
  height: 40px;
  line-height: 40px;
}

</style>
