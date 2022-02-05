<template>
  <div class="ask-content" v-cloak>
    <div class="ask-title">咨询内容</div>
    <div class="ask-tag" v-if="hasTag">
      <van-tag type="primary" size="large" plain  v-for="item, index in obj.asktagsList" :key="index" color="#ccc" text-color = "#888">{{item}}</van-tag>
    </div>
    <div class="ask-content-text">
      <van-field
        v-model="obj.askText"
        :autosize = 'isAutosize'
        :readonly = 'isReadonly'
        type="textarea"
        placeholder="请输入咨询内容"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AskContent',
  props: {
    obj: {
      type: Object,
      default() {
        return {
          asktagsList: [],
          askText: ''
        };
      }
    },
    hasTag: {
      type: Boolean,
      default: false
    },
    isReadonly: {
      type: Boolean,
      default: true
    },
    isAutosize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    };
  },
  watch: {
    obj: {
      handler: function (val, oldVal) {
        this.$emit('getInputValue', val.askText);
      },
      deep: true
    }
  },
  methods: {

  }
};
</script>

<style lang="less" scoped>
.ask-content{
  text-align: left;
  .ask-title{
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }
  .ask-tag{
    margin: 15px 0 10px 0;
    .van-tag{
      margin-right: 10px;
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 1.5px;
      font-weight: 500;
    }
  }
  .ask-content-text{
    margin-bottom: 0.5em;
    .van-cell{
      background-color: #f2f2f2;
      font-size: 11px;
      text-align: left;
      border-radius: 3px;
      margin: 7px 0;
      font-weight: 400;
      ::v-deep{
        .van-field__control{
          color: #888;
        }
      }
    }
  }
}
</style>
