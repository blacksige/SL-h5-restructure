<template>
  <div class="level-icon" >
    <img src="../assets/slices/level-1.png" alt="" v-if="level === 1"/>
    <img src="../assets/slices/level-2.png" alt="" v-else-if="level === 2"/>
  </div>
</template>

<script>
export default {
  name: 'LevelIcon',
  props: {
    level: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {

    };
  },
  methods: {

  }
};
</script>

<style lang="less" scoped>
.level-icon{
  display: flex;
  align-items: center;
  text-align: center;
  margin: 0 5px;
    &>img{
    width: 68px;
    height: 17px;
  }
}
</style>
