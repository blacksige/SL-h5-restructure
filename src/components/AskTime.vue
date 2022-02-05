<template>
  <div class="ask-time" v-cloak>
    <div class="ask-title">咨询时间</div>
      <p>
        <span class="ask-time-text">{{obj.year | capitalize}}</span>
        <span class="cline">|</span>
        <span class="ask-time-text">{{obj.year | weekDay}}</span>
        <span class="cline">|</span>
        <span class="ask-time-text">{{obj.time}}</span>
      </p>
  </div>
</template>

<script>
import { getWeek } from '../utils/index';
export default {
  name: 'AskTime',
  props: {
    obj: {
      type: Object,
      default() {
        return {
          year: '2022',
          time: '00 : 00'
        };
      }
    }
  },
  data() {
    return {

    };
  },
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      let arr = value.split('-');
      return arr[0] + '年' + arr[1] + '月' + arr[2] + '日';
    },
    weekDay: function (val) {
      if (!val) return '';
      let weekday = getWeek(val);
      return weekday;
    }
  },
  methods: {

  }
};
</script>

<style lang="less" scoped>
[v-cloak]{
  display: none;
}
.ask-time{
  text-align: left;
  font-weight: 500;
  .ask-title{
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }
  .cline{
    margin: 0 10px;
  }
  .ask-time-text,.cline{
    color: #929292;
  }
  &>p{
    margin-block-end: 0.5em;
    margin-block-start: 0.5em;
    font-size: 14px;
    color: #333;
  }
}
</style>
