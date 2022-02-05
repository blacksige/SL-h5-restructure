<template>
  <van-loading size="60px" vertical v-if="isLoading" style="top:30%">加载中...</van-loading>
  <div class="investment-detail" v-else>
    <div class="top">
      <div class="expert-detail">
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
            {{consultant.realName}}
            <level-icon></level-icon>
          </div>
          <div class="number">
            执业证号：{{consultant.certNum}}
          </div>
          <div class="rate">
            综合评分:&nbsp;
            <van-rate v-model="consultant.score" allow-half void-icon="star" color="#EC662B" readonly size="16px"/>
            <span class="score">{{consultant.score}}</span>
          </div>
        </div>
        <div class="collection" style="width: 25px">
          <van-icon :name="consultant.isCollected === 1? 'like':'like-o'" color="#EC662B" size="22px" @click="getLike"/>
        </div>
      </div>
      <div class="introduction-box">
        <van-field
          v-model="introductionAfter"
          rows="2"
          :autosize='isExtend'
          type="textarea"
          readonly
        />
      </div>
    </div>
    <div class="center">
      <div class="ask-title">投顾领域</div>
      <div class="ask-tag">
        <van-tag type="primary" size="large" plain  v-for="item, index in consultant.consultTags" text-color="#888"
        :key="index" color="#ccc" >{{item.tagName}}</van-tag>
      </div>
    </div>
    <div class="bottom">
      <div class="ask-title">咨询时间</div>
      <div class="date-selector">
        <div class="arrow-left" style="color: #EC662B">
          <van-icon name="arrow-left" />
        </div>
        <div class="dateList">
          <div class="dateItem" v-bind:style="{ width: itemWidth + '%' }">
            <van-tag :plain="item.isActive?false:true" :text-color="item.isActive?'white':'#333'"
              :color="item.isActive?'#EC662B':'#ccc'" v-for="item, index in reservationDataList" :key="index"
              @click="selectDate(item, index)"
              >{{ item.reservationData | capitalize }}<br>
              {{ item.reservationData | weekDay }}
            </van-tag>
          </div>
        </div>
        <div class="arrow-right" style="color: #EC662B">
          <van-icon name="arrow" />
        </div>
      </div>
      <div class="date-selector-time">
        <ul v-if="upTime">
          <li v-for="item, index in appointmentTimeList" :key="index">
            <span style="font-size:14px">{{item.timeRange}}</span>
            <van-tag size="large" :plain="item.isExpired === 0 && item.scheduleStatus === 0"
            :color="item.isExpired === 1 || item.scheduleStatus === 1?'#ddd':'#bbb'" text-color="#666"
            @click="item.isExpired === 0 && item.scheduleStatus === 0 ? selectTime(item, index) : ''" v-if="!item.selected">
              <template v-if="item.isExpired === 1">
                已过期
              </template>
              <template v-else-if="item.scheduleStatus === 0">
                空闲
              </template>
              <template v-else>
                约满
              </template>
            </van-tag>
            <van-tag size="large" plain color="#EC662B" @click="selectTime(item, index)" v-else>
               <van-icon name="success" size="20px"/>
            </van-tag>
            </li>
        </ul>
        <van-divider class="footerLine">
          到底啦
        </van-divider>
      </div>
    </div>
    <footer>
      <div class="appointment-btn">
        <van-button color="#EC662B" block @click="showPanel">立即预约</van-button>
      </div>
    </footer>
    <van-popup v-model="show" round position="bottom"  closeable :style="{ height: '85%', marginBottom: '0px' }" >
      <div class="popup-avatar">
        <div class="expert-avatar">
          <van-image :src="avatar" width="64" height="64">
            <template v-slot:loading>
              <van-loading type="spinner" size="20" />
            </template>
            <template v-slot:error>加载失败</template>
          </van-image>
        </div>
        <div class="expert-money">
          <div class="money">{{money}}</div>
        </div>
      </div >
      <div class="tags">
          <div style="margin-bottom:10px"><van-tag :plain='false' text-color='#EC662B' color="#FFEAE1" size="medium">可取消</van-tag><span class="hint">{{calHint}}</span></div>
          <div><van-tag :plain='false' text-color='#EC662B' color="#FFEAE1" size="medium">可退款</van-tag><span class="hint">{{returnHint}}</span></div>
      </div>
      <ask-time class="popup-time" :obj="askTime"></ask-time>
      <ask-content class="popup-content" :isReadonly = 'false' @getInputValue = getInputValue></ask-content>
      <div class="popup-phone">
        <modify-phone></modify-phone>
      </div>
      <div class="popup-tips">
        <div>
          <van-notice-bar color="#333" background="#FFEDE5" left-icon="warning-o" wrapable :scrollable="false">
            每个阴影由 2-4 个长度值、一个可选的颜色值和一个可选的 inset 关键字来规定。
          </van-notice-bar>
        </div>
        <div style="margin: 15px 0px">
          <van-icon :name="ischecked?'checked':'circle'" @click="checkAgreement" color="#EC662B" size="14px"/>
          <span class="agreement-text">已阅读并同意《远程投顾服务协议》</span>
        </div>
        <div>
          <van-button color="#EC662B" block @click="payMoney" :disabled="!ischecked">立即支付{{money}}</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import apiHandel from '../../api/apiHandel';
import AskTime from '../../components/AskTime.vue';
import LevelIcon from '../../components/LevelIcon.vue';
import { getWeek } from '../../utils/index.js';
import { mapMutations, mapState } from 'vuex';
import AskContent from '../../components/AskContent.vue';
import ModifyPhone from '../../components/Phone.vue';
export default {
  components: { AskTime, LevelIcon, AskContent, ModifyPhone },
  name: 'InvestmentDetail',
  data() {
    return {
      barTitle: '顾问详情',
      upTime: true,
      isExtend: true, // 简介自适应
      show: false, // popup弹出
      ischecked: false, // 是否同意协议
      money: '￥300',
      page: 0, // 日期页数
      size: 7,
      consultantId: '', // 专家id
      reservationDataList: [],
      appointmentTimeList: [],
      isLoading: true,
      askTime: {
        year: '',
        time: ''
      }, // 咨询时间
      consultant: {},
      orderData: {
        serviceId: '',
        consultRemark: '',
        userId: ''
      },
      avatar: require('../../assets/slices/defAvatar.png'),

      calHint: '取消文本描述',
      returnHint: '退款文本描述'
    };
  },
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      let arr = value.split('-');
      return arr[1] + '月' + arr[2] + '日';
    },
    weekDay: function (val) {
      if (!val) return '';
      let weekday = getWeek(val);
      return weekday;
    }
  },
  computed: {
    ...mapState(['userId']),
    introductionAfter() {
      if (this.consultant.introduce) {
        return '简介：' + this.consultant.introduce;
      } else {
        return '简介：' + '无';
      }
    },
    itemWidth() {
      return this.size * 20;
    }
  },
  created() {
    this.updateTitle(this.barTitle);
    this.consultantId = this.$route.query.consultantId;
    console.log(this.consultantId);
    this.getOrderInfo();
  },
  methods: {
    ...mapMutations(['updateTitle']),
    getOrderInfo() {
      let params = {
        consultantId: this.consultantId,
        userId: this.userId
      };
      apiHandel.getConsultantInfo(params).then(res => {
        console.log(res);
        this.consultant = res.content;
        if (this.consultant.avatarUrl) {
          this.avatar = this.consultant.avatarUrl;
        }
        console.log(this.consultant);
      });
      this.getReservation();
    },
    getLike() {
      let params = {
        consultantId: this.consultantId,
        userId: this.userId,
        action: ''
      };
      if (this.consultant.isCollected === 1) {
        params.action = 1;
        apiHandel.collection(params).then(res => {
          if (res) {
            this.Stocks = res.content;
            this.consultant.isCollected = 0;
            this.$toast('已取消收藏');
          }
        });
      } else {
        params.action = 0;
        apiHandel.collection(params).then(res => {
          if (res) {
            this.Stocks = res.content;
            this.consultant.isCollected = 1;
            this.$toast('收藏成功');
          }
        });
      }
    },
    // 可预约时间列表
    async getReservation() {
      let arr = [];
      let params = {
        page: this.page,
        size: this.size,
        consultantId: this.consultantId
      };
      await apiHandel.getReservation(params).then(res => {
        arr = res.content.map(item => {
          item.isActive = false;
          item.page = this.page;
          return item;
        });
        this.reservationDataList = arr;
        console.log(this.reservationDataList);
        this.selectDate(this.reservationDataList[0]);
        this.isLoading = false;
      });
    },

    selectDate(item, index) {
      this.orderData.serviceId = '';
      this.reservationDataList.forEach(it => {
        it.isActive = false;
        return it;
      });
      item.isActive = true;
      this.appointmentTimeList = item.reservationTimeRangeModels.map(it => {
        it.selected = false;
        return it;
      });
      this.askTime.year = item.reservationData;
      return item;
    },
    selectTime(item, index) {
      if (!this.appointmentTimeList[index].selected) {
        this.appointmentTimeList.forEach(it => {
          it.selected = false;
          return it;
        });
        this.$nextTick(() => {
          this.appointmentTimeList[index].selected = true;
          this.upTime = false;
          // 在组件移除后，重新渲染组件
          // this.$nextTick可实现在DOM 状态更新后，执行传入的方法。
          this.$nextTick(() => {
            this.upTime = true;
          });
        });
      } else {
        return;
      }
      this.askTime.time = item.timeRange;
      this.orderData.serviceId = item.serviceTimeId;
    },

    showPanel() {
      this.ischecked = false;
      if (!this.orderData.serviceId) {
        this.$dialog.alert({
          title: '错误',
          message: '请选择咨询时间',
          theme: 'round-button',
          confirmButtonColor: '#EC662B'
        }).then(() => {
        });
        return;
      }
      this.show = !this.show;
      // let orderCache = {
      //   askTime: this.askTime,
      //   serviceId: this.orderData.serviceId
      // }
    },
    checkAgreement() {
      this.ischecked = !this.ischecked;
    },
    payMoney() {
      if (!this.orderData.consultRemark) {
        this.$dialog.alert({
          title: '错误',
          message: '请输入咨询内容',
          theme: 'round-button',
          confirmButtonColor: '#EC662B'
        }).then(() => {
        });
        return;
      }
      this.orderData.userId = this.userId;
      apiHandel.addOrder(this.orderData).then(res => {
        if (res) {
          this.$router.push('/paysuccessful');
        }
      });
    },
    // 获取咨询内容
    getInputValue(val) {
      this.orderData.consultRemark = val;
    }
  }
};
</script>

<style lang="less" scoped>
.investment-detail{
  &>div{
    margin-bottom: 12px;
  }
  .top,.center,.bottom{
    padding: 15px;
    background-color: white;
    .ask-title{
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }
  }
  .top{
    .expert-detail{
      display: flex;
      flex-direction: row;

      .expert-info{
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        text-align: left;
        margin-left: 13px;
        .name{
          font-size:16px;
          font-weight: 500;
          display: flex;
        }
        .number{
          font-size: 12px;
          color: #929292;
        }
        .rate{
          font-size: 12px;
          color: #929292;
          .score{
            font-size: 15px;
            margin-left: 5px;
            color: #EC662B;
          }
        }
      }
    }
    .introduction-box{
      margin-top: 15px;
      background-color: #F2F2F2;
      border-radius: 5px;
      .van-cell{
        background-color: #F2F2F2;
        padding: 10px 10px 8px 10px;
        font-size: 12px;
        text-align: left;
        border-radius: 5px;
        ::v-deep{
          .van-field__control{
            color: #888;
            min-height: auto;
            overflow: hidden;
          }
        }
      }
    }
  }
  .center{
    text-align: left;
    .ask-tag{
      margin: 15px 0 10px 0;
      .van-tag{
        margin-right: 10px;
        padding: 5px 8px;
        font-size: 14px;
        border-radius: 3px;
      }
    }
  }
  .bottom{
    text-align: left;
    margin-bottom: 70px;
    &>div{
      margin-bottom: 15px;
    }
    &>.date-selector{
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 50px;
      text-align: center;
      .dateList{
        overflow-x: scroll;
        width: 100%;
        .dateItem{
          display: flex;
          justify-content: space-evenly;
          &>.van-tag{
            padding: 0px 5px;
            height: 50px;
            font-size: 10px;
            border-radius: 3px;
          }
        }
      }
      ::-webkit-scrollbar{
        height: 2px;
      }
      ::-webkit-scrollbar-thumb{
        border-radius: 3px;
        background-color: rgba(221,221,221, .7);
      }
    }
    &>.date-selector-time{
      width: 100%;
      color: #555;
      ul{
        width: 100%;
        list-style: none;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        font-size: 15px;
        margin-bottom: 15px;
        li{
          width: 46%;
          line-height: 24px;
          border-bottom: 1px solid #eee;
          padding: 8px 0px;
          display: flex;
          justify-content: space-between;
          &>.van-tag{
            padding: 2px 4px;
            font-size: 12px;
            width: 42px;
            height: 16px;
            justify-content: center;
          }
        }
      }
      .footerLine{
        color: #888;
        border-color: #888;
        padding: 0 16px;
        width: 40%;
        margin: 0 auto;
      }
    }
  }
  footer{
    box-sizing: border-box;
    width: 100%;
    position: fixed;
    bottom: 0;
    background-color: white;
    padding: 10px 12px 25px 12px;
    border-top: 1px solid #eee;
  }
  .van-popup{
    &>div{
      margin: 0px 15px;
      padding: 10px 0;
      text-align: left;
    }
    &>.popup-avatar{
      display: flex;
      flex-direction: row;
      text-align: left;
      padding: 15px 0 0 0;
      .expert-money{
        padding-left: 10px;
        flex: 1;
        .money{
          font-size: 36px;
          color: #E31717;
        }
      }
    }
    .tags{
      &>div>.van-tag{
        padding: 2px 8px;
        margin-right: 10px;
      }
      &>div>.hint{
        font-size: 12px;
        color: #777;
      }
       border-bottom: 1px dashed #ddd;
    }
    &>.popup-time{
      border-bottom: 1px dashed #ddd;
    }
    &>.popup-content{
      border-bottom: 1px dashed #ddd;
    }
    &>.popup-phone{
      .phone{
        border-bottom: 1px solid #ddd;
      }
      margin-bottom: 20px;
    }
    &>.popup-tips{
      padding-top: 0px;
      &>div{
        text-align: center;
        .van-notice-bar{
          text-align: left;
          ::v-deep .van-icon{
            color: #EC662B;
          }
          ::v-deep .van-notice-bar__content{
            line-height: 17px;
            font-size: 12px;
            text-align: left;
            color: #666;
          }
        }
        .agreement-text{
          margin-left: 5px;
          font-size: 12px;
          line-height: 18px;
          color: #787777;
        }
      }
    }
  }
  .van-button {
    height: 40px;
    line-height: 40px;
  }
}
</style>
