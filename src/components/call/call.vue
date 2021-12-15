<template>
    <div class="call" v-cloak>
        <header>
           <up-and-down></up-and-down>
        </header>
        <main>
            <template v-if="model === 'bothSides'">
                <!-- 客户视频画面-->
                <div class="Client-Area">
                    <div id="CLIENT-AREA" ></div>
                </div>
                <!--座席视频画面-->
                <div class="Agent-Area" >
                    <div id="AGENT-AREA" ></div>
                </div>
            </template>
            <template v-else-if="model === 'manySides'">
            </template>
            <template v-else-if="model === 'share'">
            </template>
            <template v-else-if="model === 'loading'">
                <div
                  v-loading="loading"
                  style="width:100%;height:100%;font-size:30px"
                  element-loading-text="拼命加载中"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.8)">
                </div>
            </template>
        </main>
        <footer>
          <interactive></interactive>
        </footer>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Interactive from '../interactive/interactive.vue';
import UpAndDown from '../upAndDown/upAndDown';
var _ = require('lodash');
export default {
  name: 'Call',
  data () {
    return {
      model: 'loading',
      isCVLoading: true,
      isAVLoading: true,
      userList: [],
      camera: null,
      microphone: null,
      loading: true
    };
  },
  components: {
    UpAndDown,
    Interactive
  },
  computed: {
    ...mapState(['userid', 'agentid', 'roomid'])
  },
  mounted() {
    window.onbeforeunload = () => {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
    };
    console.log(this.userid, this.agentid, this.roomid);
    this.microphone = this.$AnyChatH5SDK.getMicrophones()[0];
    this.camera = this.$AnyChatH5SDK.getCameras()[0];
    this.camera.config({
      bitRate: 300000, // 视频编码码率设置（参数为int型，单位bps）
      gop: 30, // 视频编码关键帧间隔控制（参数为int型）
      width: 640, // 设置本地视频采集分辨率(宽度)
      height: 480, // 设置本地视频采集分辨率(高度)
      fps: 15, // 设置本地视频编码的帧率
      recordBitRate: 0, // 设置录像视频码率  （参数为int型，单位bps）
      preset: 3, // 设置视频编码预设参数（值越大，编码质量越高，占用CPU资源也会越高）
      quality: 3 // 设置本地视频编码的质量
    });
    // 初始化房间回调
    this.setRoomOpt();
  },
  methods: {
    updateModel(step) {
      if (step === 1) {
        this.model = 'bothSides';
      } else if (step === 2) {
        this.model = 'manySides';
      } else if (step === 3) {
        this.model = 'share';
      } else {
        this.model = 'loading';
      }
    },
    setRoomOpt() {
      // 定义房间配置对象roomOpt
      var roomOpt = {
        onRoomUserInAndOut: this.onAnyChatUserAtRoom, // 用户进出房间通知事件
        onRoomUserChanged: this.onAnyChatRoomOnlineUser, // 房间用户数变化通知事件
        onRoomUserMsgReceived: this.onAnyChatUserMsgAtRoom // 接收房间内的文本消息通知事件
      };
      // 第二种系统通知注册方式：在sdk初始化后调用instance.callbackFunctionRegister添加事件注册
      this.$AnyChatH5SDK.callbackFunctionRegister(roomOpt);
      this.enterRoom();
    },
    enterRoom() {
      this.$AnyChatH5SDK.enterRoom({
        roomId: this.roomid,
        password: '',
        done: (result, data) => {
          if (result.code === 0) {
            console.log(result, data);
            setTimeout(() => {
              this.userList = this.$AnyChatH5SDK.getRoomUsers();
              this.setVideoPos(this.userList);
            }, 500);
          } else {
            this.$confirm(result.msg, '提示', {
              confirmButtonText: '确定',
              type: 'error',
              showCancelButton: false
            }).then(() => {
              throw new Error(result.msg);
            });
          }
        }
      });
    },
    onAnyChatUserAtRoom(data) {
      console.log(data, '用户进出房间通知事件');
      if (data.action === 0) {
        this.userList = this.userList.filter((item) => { return item !== data.userId; });
        console.log(this.userList, '退出后的列表');
      } else if (data.action === 1) {
        this.userList.push(data.userId);
        console.log(this.userList, '进入后的列表');
      }
      this.setVideoPos(this.userList);
    },
    onAnyChatRoomOnlineUser(data) {
      console.log(data, '房间用户数变化通知事件');
    },
    onAnyChatUserMsgAtRoom(data) {
      console.log(data, '接收房间内的文本消息通知事件');
    },
    // 根据用户列表
    setVideoPos(list) {
      // 去重
      let List = _.uniqWith(list, _.isEqual);
      console.log(List, '-去重后的列表');
      if (List.length < 2) {
        this.updateModel(0);
      } else if (List.length === 2) {
        // 双方通话
        this.updateModel(1);
        List.forEach(item => {
          if (item === this.userid) {
            this.$nextTick(() => {
              let errorCodeCamera = this.camera.open({
                id: 'CLIENT-AREA'
              });
              let errorCodeMicrophone = this.microphone.open();
              console.log(errorCodeCamera, errorCodeMicrophone, '打开摄像头与麦克风');
            });
          } else {
            this.$nextTick(() => {
              let errorCodeCamera = this.$AnyChatH5SDK.getRemoteVideoStream({
                remoteUserId: item,
                renderId: 'AGENT-AREA',
                streamIndex: 0
              });
              let errorCodeMicrophone = this.$AnyChatH5SDK.getRemoteAudioStream({
                remoteUserId: item
              });
              console.log(errorCodeCamera, errorCodeMicrophone, '打开摄像头与麦克风');
            });
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import './call.less';
video{
  width: 100%;
  height: 100%;
}
</style>
