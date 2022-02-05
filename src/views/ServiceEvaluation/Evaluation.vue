<template>
  <van-loading size="60px" vertical v-if="isLoading" style="top:30%">加载中...</van-loading>
  <div class="score" v-else>
      <div class="bottom-line">
        <div class="text-align-center">
        <van-image round width="80" height="80" :src="baseInfo.avatarUrl" />
      </div>
      <div class="text-align-center bold title">{{ baseInfo.realName }}</div>
      <div class="flex title">
        <div class="rate-type">综合评价</div>
        <van-rate
          v-model="value"
          allow-half
          void-icon="star"
          void-color="#eee"
          color="#EC662B"
          size="26px"
        />
      </div>
    </div>
    <div class="bottom-line" v-for="item,index in baseInfo.evaluationTypeModels" :key="index">
      <div class="title" >{{item.typeName}}</div>
      <div class="tag-box">
        <van-tag
          v-for="(item, index) in item.evaluationTemplateModels"
          :key="index"
          :text-color="item.isActive ? '#fff' : '#6B6B6B'"
          :plain="!item.isActive"
          round
          size="large"
          :color="item.isActive ? '#EC662B' : '#ccc'"
          @click="isCheck(item)"
          >{{ item.value }}</van-tag
        >
      </div>
    </div>
    <div class="title">建议与留言</div>
    <van-field
      v-model="message"
      rows="3"
      autosize
      border
      type="textarea"
      placeholder="请输入服务建议内容"
    />
    <van-button color="#EC662B" block @click="addEvaluation">提交</van-button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import apiHandel from '../../api/apiHandel';
export default {
  name: 'Evaluation',
  data() {
    return {
      barTitle: '服务评价',
      message: '',
      value: 0,
      scoreData: {},
      baseInfo: {},
      isLoading: true
    };
  },
  created() {
    this.updateTitle(this.barTitle);
    this.getEvaluationPageInfo();
  },
  methods: {
    ...mapMutations(['updateTitle']),
    isCheck(item) {
      item.isActive = !item.isActive;
      return item;
    },
    getEvaluationPageInfo() {
      let params = {
        consultantId: parseInt(this.$route.query.consultantId),
        orderId: parseInt(this.$route.query.orderId)
      };
      apiHandel.getEvaluationPageInfo(params).then(res => {
        this.baseInfo = res.content;
        this.baseInfo.evaluationTypeModels.forEach(element => {
          element.evaluationTemplateModels = element.evaluationTemplateModels.map(item => {
            return {
              id: item.id,
              value: item.value,
              isActive: false
            };
          });
          this.isLoading = false;
        });
      });
    },
    addEvaluation() {
      this.scoreData = {
        consultantId: parseInt(this.$route.query.consultantId),
        evaluationTemplateParams: [],
        message: this.message,
        orderId: parseInt(this.$route.query.orderId),
        star: this.value
      };
      this.scoreData.evaluationTemplateParams = this.baseInfo.evaluationTypeModels.map(element => {
        let arr = [];
        element.evaluationTemplateModels.forEach(item => {
          if (item.isActive) {
            arr.push(item.id);
          }
        });
        return {
          evaluationType: element.id,
          evaluationTemplates: arr
        };
      });
      apiHandel.setEvaluation(this.scoreData).then(res => {
        if (res) {
          this.$dialog.alert({
            title: '成功',
            message: res.content,
            theme: 'round-button',
            confirmButtonColor: '#EC662B'
          }).then(() => {
            this.$router.push('/history');
          });
        }
      });
    }
  }
};
</script>

<style scoped  lang="less" >
.flex {
  display: flex;
  line-height: 26px;
}
.score {
  box-sizing: border-box;
  margin: 10px;
  padding: 20px;
  background-color: #fff;
  text-align: left;
  border-radius: 8px;
  .bottom-line{
    padding-bottom: 20px;
    border-bottom: 1px dashed #ddd;
  }
}
.title{
  margin: 1em 0;
  font-size: 15px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #333333;
}
.bold{
  font-size: 18px;
  font-weight: 500;
  color: #333;
  height: 24px;
  line-height: 24px;
}
.text-align-center {
  text-align: center;
}
.rate-type {
  margin-right: 40px;
}
.score .van-tag {
  padding: 10px 20px;
  margin-right: 10px;
  margin-bottom: 10px;
}
.van-button {
  border-radius: 5px;
}
.tag-box {
  margin-right: -20px;
}
.van-cell {
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 15px !important;
}
.van-button {
  height: 40px;
  line-height: 40px;
}
</style>
