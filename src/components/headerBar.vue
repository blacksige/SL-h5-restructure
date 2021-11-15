<template>
    <div class="header-bar">
        <div class="icon" @click="goBack"><i class="el-icon-arrow-left"></i></div>
        <div class="title">{{title}}</div>

    </div>
</template>

<script>
export default {
    name:'HeaderBar',
    props: {
        title: {
            type: String,
            default: 'hello world'
        }
    },
    methods: {
        goBack(){
            this.$router.go(-1)
        }
    },
}
</script>

<style lang="less">
    .header-bar{
        text-align: center;
        font-size: 18px;
        font-weight: normal;
        color: #ffffff;
        line-height: 45px;
        background-color: #1098EC;
        .icon{
           position: absolute;
           font-size: 24px;
        }
    }
</style>