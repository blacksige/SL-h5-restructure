<template>
  <div class="plate" @click="gotoPlate">
    <van-image
      width="40px"
      height="40px"
      fit="cover"
      :src="tagPic"
    >
      <template v-slot:error>加载失败</template>
    </van-image>
    <p class="tagName"><span>{{info.tagName}}</span></p>
  </div>
</template>
<script>
export default {
  name: 'Plate',
  props: {
    info: {
      type: Object,
      default() {
        return {
          tagCode: '',
          tagName: '消费板块',
          tagPic: null
        };
      }
    }
  },
  data() {
    return {
      tagPic: require('../assets/slices/consumption.png')
    };
  },
  created() {
    if (this.info.tagPic) {
      this.tagPic = this.info.tagPic;
    }
  },
  methods: {
    gotoPlate() {
      let rouetrCode = this.info.tagCode;
      this.$router.push({
        path: `/plates/${rouetrCode}`,
        query: {
          tagCode: this.info.tagCode,
          tagName: this.info.tagName
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.plate {
  width: 90px;
  height: 80px;
  border-radius: 5px;
  background-color: #F2F2F2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .tagName{
    font-size: 11px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333;
    margin-block-start: 0.5em;
    margin-block-end: 0em;
  }
  .van-image{
    ::v-deep .van-image__error{
      font-size: 12px;
    }
  }
}
</style>
