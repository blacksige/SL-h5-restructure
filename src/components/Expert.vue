<template>
  <div class="expert" @click="obj.recentAvailable ? goDetail(obj.id) : showTips()">
    <div class="expert-item" :class="{overlay : !obj.recentAvailable}">
      <div class="expert-avatar">
        <van-image :src="avatar" width="64" height="64">
          <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
          <template v-slot:error>加载失败</template>
        </van-image>
      </div>
      <div class="expert-info">
        <div class="head-info">
          <span class="expert-name">{{obj.realName}}</span>
          <span style="flex:1">
            <level-icon :level="obj.level"></level-icon>
          </span>
          <!-- <span>
            <van-tag  color="#EC662B" size="medium" v-if="obj.recentAvailable">可预约</van-tag>
            <van-tag  color="#bbb" size="medium" v-else>不可预约</van-tag>
          </span> -->
        </div>
        <div class="center-info">
          执业证号：{{obj.certNum}}
        </div>
        <div class="center-info">
          综合评分：
          <van-rate v-model="obj.score" allow-half void-icon="star" color="#EC662B" readonly size="16px"/>
          <span class="score">{{obj.score}}</span>
        </div>
        <div class="center-info introduc">
          {{introductionAfter}}
        </div>
        <div class="footer-info" v-tagg>
          <van-tag  color="#ccc"  text-color='#888' size="medium" :plain = "true" style="margin-right:12px;" v-for="item in tagsList" :key="item">{{item}}</van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LevelIcon from './LevelIcon.vue';
export default {
  components: { LevelIcon },
  name: 'Expert',
  props: {
    obj: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  directives: {
    tagg: {
      inserted: el => {
        if (el.scrollHeight > el.clientHeight) {
          while (el.scrollHeight > el.clientHeight) {
            el.lastChild.remove();
          }
          el.lastChild.innerHTML = '···';
        }
      }
    }
  },
  data() {
    return {
      avatar: require('../assets/slices/defAvatar.png')
    };
  },
  created() {
    if (this.obj.avatarUrl) {
      this.avatar = this.obj.avatarUrl;
    }
  },
  computed: {
    tagsList() {
      if (this.obj.tags) {
        return this.obj.tags.split(',');
      } else {
        return [];
      }
    },
    introductionAfter() {
      if (this.obj.introduce) {
        return '简介：' + this.obj.introduce;
      } else {
        return '简介：' + '无';
      }
    }
  },
  methods: {
    goDetail(id) {
      this.$router.push({
        path: '/investmentDetail',
        query: {
          consultantId: id
        }
      });
    },
    showTips() {
      this.$dialog.alert({
        title: '提示',
        message: '当前顾问暂不可预约',
        theme: 'round-button',
        confirmButtonColor: '#EC662B'
      }).then(() => {

      });
    }
  }
};
</script>

<style lang="less" scoped>
@defaultsColor: #EC662B;
.overlay{
  opacity: 0.5;
}
.expert{
  width: 100%;
  .expert-item {
    margin: 10px;
    padding: 8px;
    background-color: white;
    height: 120px;
    display: flex;
    border-radius: 8px;
    flex-direction: row;
    .expert-avatar{
      margin: 8px;
    }
    .expert-info{
      margin-left: 5px;
      margin-right: 5px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      flex: 1;
      &>div{
        width: 100%;
        text-align: left;
      }
      .head-info{
        display: flex;
        align-items: center;
        &>.expert-name{
          font-size:16px;
          font-weight: 500;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        &>span {
          display: block;
          &>.van-tag--medium{
            padding: 2px 4px;
          }
        }
      }
      .center-info {
        font-size: 12px;
        font-weight: 400;
        color: #AEAEAE;
        &>.score{
          color: @defaultsColor;
          font-size: 15px;
          margin-left: 5px;
        }
      }
      .introduc{
        font-size: 10px;
        height: 32px;
        line-height: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        // &::after{
        //   content: "...";
        //   font-size: 12px;
        //   color: red;
        //   position: absolute;
        //   bottom: 0;
        //   right: 0;
        //   /*将省略号的大小设置为2个字体大小*/
        //   width: 1.0em;
        //   /*设置背景，将最后一个字覆盖掉*/
        //   background: #F2F2F2;
        // }
      }

      .footer-info{
        overflow: hidden;
        height: 21px;
      }
    }
  }
}
</style>
