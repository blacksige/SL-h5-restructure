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
              <!-- 多方通话 -->
              <div class="manySides">
                <div v-bind:class="classObject" v-for="item in manySidesList" :key="item.index" :id="item"></div>
              </div>
            </template>
            <template v-else-if="model === 'share'">
              <!-- 多媒体共享 -->
              <div class="share-box" >
                    <div id="SHARE" ></div>
              </div>
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
          <interactive @microphoneHandel = 'microphoneHandel' @cameraHandel = 'cameraHandel' @clearUnread = 'clearUnread'></interactive>
        </footer>
        <receive-buffer @updateModel="updateModel" @setVideoPos = 'setVideoPos'></receive-buffer>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import { current } from '../toolkit';
import Interactive from '../interactive/interactive.vue';
import UpAndDown from '../upAndDown/upAndDown';
import ReceiveBuffer from '../receiveBuffer/receiveBuffer.vue';
let _ = require('lodash');
let presetInfo = localStorage.getItem('H5PresetData');
export default {
  name: 'Call',
  data () {
    return {
      model: 'loading',
      isCVLoading: true,
      isAVLoading: true,
      userList: [], // 好友列表
      camera: null,
      microphone: null,
      loading: true,
      configInfo: JSON.parse(presetInfo).config,
      businessInfo: JSON.parse(presetInfo).businessInfo,
      manySidesList: [],

      unRead: 0
    };
  },
  components: {
    UpAndDown,
    Interactive,
    ReceiveBuffer
  },
  computed: {
    ...mapState(['userid', 'agentid', 'roomid', 'friendList']),
    classObject () {
      return {
        fourSides: this.friendList.length === 1 && this.friendList.length <= 3, // 四方通话 房间好友人数为2,3
        sixSides: this.friendList.length > 3 && this.friendList.length <= 5, // 六方通话 房间好友人数为4,5
        nineSide: this.friendList.length > 5 && this.friendList.length <= 8 // 九方通话 房间好友人数为6,7,8
      };
    }
  },
  mounted() {
    window.onbeforeunload = () => {
      this.$AnyChatH5SDK && this.$AnyChatH5SDK.logout();
    };

    console.log(this.userid, this.agentid, this.roomid);

    this.microphone = this.$AnyChatH5SDK.getMicrophones()[0];
    this.camera = this.$AnyChatH5SDK.getCameras()[0];
    try {
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
    } catch (error) {
      throw new Error('摄像头打开失败');
    }
    // 初始化房间回调
    this.setRoomOpt();
  },
  methods: {
    ...mapMutations(['setUserList', 'setMessText', 'setUnread']),
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
        roomId: this.businessInfo.isInvite === '0' ? this.roomid : this.configInfo.roomId,
        password: '',
        done: (result, data) => {
          if (result.code === 0) {
            console.log(result, data);
            setTimeout(() => {
              this.userList = window.BRAC_GetOnlineUser();
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
    // 房间事件回调
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
      let msgObj = {
        id: data.userId,
        msg: data.msg,
        time: current()
      };
      this.setMessText(msgObj);
      this.unRead++;
      this.setUnread(this.unRead);
    },
    // 根据用户列表渲染视频页面
    setVideoPos(list) {
      try {
        // 先关闭摄像头
        this.camera.close();
        this.microphone.close();
      } catch (error) {
        console.log(error);
      }
      // 去重
      let List = _.uniqWith(list, _.isEqual);
      console.log(List, '-去重后的列表');
      // 更新好友列表到vuex
      this.setUserList(List);

      if (List.length < 1) { // 人数不足
        this.updateModel(0);
      } else if (List.length === 1) {
        // 双方通话
        this.updateModel(1);
        this.$nextTick(() => {
          let errorCodeCamera = this.camera.open({
            id: 'CLIENT-AREA'
          });
          let errorCodeMicrophone = this.microphone.open();
          console.log(errorCodeCamera, errorCodeMicrophone, '打开摄像头与麦克风');
          let errorCodeStream = this.$AnyChatH5SDK.getRemoteVideoStream({
            remoteUserId: List[0],
            renderId: 'AGENT-AREA',
            streamIndex: 0
          });
          let errorCodeMicroStream = this.$AnyChatH5SDK.getRemoteAudioStream({
            remoteUserId: List[0]
          });
          console.log(errorCodeStream, errorCodeMicroStream, '打开摄像头与麦克风');
        });
      } else if (List.length > 1) {
        // 多方通话
        this.manySidesList = List.map(item => {
          return ('manySide' + item).toString();
        });
        this.manySidesList.unshift(('manySide' + this.userid).toString());
        console.log(this.manySidesList, '--id 列表');
        this.updateModel(2);

        this.$nextTick(() => {
          // 打开自己的摄像头与麦克风
          let errorCodeCamera = this.camera.open({
            id: ('manySide' + this.userid).toString()
          });
          let errorCodeMicrophone = this.microphone.open();
          console.log(errorCodeCamera, errorCodeMicrophone, '打开摄像头与麦克风');
          // 拉好友的流
          List.forEach(item => {
            this.$AnyChatH5SDK.getRemoteVideoStream({
              remoteUserId: item,
              renderId: ('manySide' + item).toString(),
              streamIndex: 0
            });
            this.$AnyChatH5SDK.getRemoteAudioStream({
              remoteUserId: List[0]
            });
          });
        });
      }
    },
    // 开关麦克风---供子组件调用 opt = false 为关闭
    microphoneHandel(opt) {
      opt ? this.microphone.open() : this.microphone.close();
    },
    // 开关摄像头---供子组件调用 opt = false 为关闭
    cameraHandel(opt) {
      opt ? this.camera.open() : this.camera.close();
    },
    // 清除未读信息
    clearUnread() {
      this.unRead = 0;
    }
  }
};
</script>

<style lang="less" scoped>
@import './call.less';
</style>
