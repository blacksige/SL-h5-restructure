<template>
  <div class="index">
        <div class="contain">
            <div class="image_top">
                <img class="logo_bg" src='../assets/images/logoBg.png'>
                <img class="first_logo" src='../assets/images/firstLOGO.png'>
            </div>
            <div class="container">
                <div class="contant_top">
                    <input type="text" placeholder="请输入手机号码" id="userName" v-model="userName" />
                    <input type="text" placeholder="请输入商户编码" id="appCode" v-model="appCode"/>
                    <!-- <div class="message"><img src="../assets/images/error.jpg"><span>手机号码格式有误</span></div> -->
                    <button class="btn loginBtn" id="login"  readonly="readonly" @click="toProduct">下一步</button>
                </div>
            </div>
            <div class="footer">
                <div id="setBtn" @click="toSetting">设置</div>
            </div>
        </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Index',
  components: {
  },
  data() {
    return {
        userName:'',
        appCode:''
    }
  },
  methods:{
    toProduct(){
      if (this.userName == '') {
         this.$notify.error({
          title: '错误',
          message: '手机号码格式有误'
        });
      }else if(this.appCode == ''){
        this.$notify.error({
          title: '错误',
          message: 'appId格式有误'
        });
      }else{
        this.$router.push('/product')
      }
    },
    toSetting(){
      this.$router.push('/setting')
    }
  }
}
</script>

<style lang="less" scoped>
.index{
  width: 100%;
  height: 100%;
  .contain{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .image_top{
        flex:1;
        width: 100%;
        text-align: center;
        .logo_bg{
            width: 100%;
            height: 100%;
        }
        .first_logo {
            position: absolute;
            left: 50%;
            width: 60%;
            transform: translateX(-50%);
            height: 27%;
            top: 30px;
        }
    }
    .container{
      padding: 0 26px;

      .contant_top img{
          margin: 70px auto 30px;
          display: block;
          width: 150px;
      }
      input{
          border-top: 0px;
          box-shadow: none;
          border-right: none;
          border-left: none;
          border-radius: 0px;
          text-align: center;
          font-size: 20px;
          border-bottom: 1px solid #AEAEAE;
          width: 100%;
          line-height: 22px;
          padding: 7px;
          outline:none;
          margin: 20px auto 10px;
          color: #777777;
          font-size: 14px;
      }
      .contant_top p{
          color: #C8C6C6;
          font-size: 14px;
          line-height: 27px;
          margin-top: 10px;
          letter-spacing: 1px;
      }
      .contant_top span{
          text-align: center;
          display: block;
          margin: 20px auto;
          font-size: 15px;
      }
      .contant_top span i{
          font-style: inherit;
      }
      .contant_top a{
          display: block;
          text-align: center;
          color: #7E7E7E;
          margin: 10px auto;
          cursor: pointer;
      }
      .contant_top a span{
          display: inline-block;
      }
      .contant_top a i{
          font-style: inherit;
      }
      .contant_top button,.contant_top #codeNext,.contant_top button:visited,.contant_top #codeNext:visited{
          width: 100%;
          margin: 10px auto;
          border-radius: 20px;
          color: #fff !important;
          background: #1098ec;
          border: 1px solid #1098ec;
          line-height: 42px;
          height: 42px;
          margin-top: 35px;
      }
      .contant_top button.hd{
          background: #AFAFAF;
          border: 1px solid #AFAFAF;
      }
      .contant_top button:hover,.contant_top #codeNext:hover{
          background: #1098ec !important;
          border: 1px solid #1098ec !important;
          color: #fff !important;
      }
      .contant_top button:active,.contant_top #codeNext:active{
          background: #1098ec !important;
          border: 1px solid #1098ec !important;
          color: #fff !important;
      }
      .contant_top button:focus{
          outline: none;
      }
    }
    .footer{
      position: absolute;
      bottom: 0px;
      width: 100%;

      #setBtn{
        height: 60px;
        line-height: 60px;
        font-size: 20px;
      }
    }
  }
}
</style>
