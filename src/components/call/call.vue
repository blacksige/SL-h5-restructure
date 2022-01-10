<template>
    <div class="call" v-cloak>
        <header>
           <up-and-down></up-and-down>
           <!-- <van-notice-bar
            wrapable
            :scrollable="false"
            left-icon="volume-o"
            style="font-size: 12px; padding: 4px 8px;"
            text="在代码阅读过程中人们说脏话的频率是衡量代码质量的唯一标准。"
          /> -->
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
                <van-loading type="spinner" color="#1989fa" size="50" style="top: 49%"/>
            </template>
        </main>
        <footer>
          <interactive @microphoneHandel = 'microphoneHandel' @cameraHandel = 'cameraHandel' @clearUnread = 'clearUnread'></interactive>
        </footer>
        <receive-buffer @updateModel="updateModel" @setVideoPos = 'setVideoPos' @deviceConfig = 'deviceConfig'></receive-buffer>
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
      show: true,
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
    // function onSuccess(stream) {
    //   console.log('已点击容许,开启成功');
    // }
    // function onError(error) {
    //   console.log('错误：', error);
    // }
    // this.getUserMedia({ video: true, audio: true }, onSuccess.bind(this), onError.bind(this));
    this.microphone = this.$AnyChatH5SDK.getMicrophones()[0];
    this.camera = this.$AnyChatH5SDK.getCameras()[0];
    // 设备配置
    this.deviceConfig();
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
    // getUserMedia(constraints, success, error) {
    //   console.log(navigator.mediaDevices, navigator);
    //   if (navigator.mediaDevices.getUserMedia) {
    //     // 新版API
    //     navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    //   } else if (navigator.webkitGetUserMedia) {
    //     // webkit核心浏览器
    //     navigator.webkitGetUserMedia(constraints, success, error);
    //   } else if (navigator.mozGetUserMedia) {
    //     // Firefox浏览器
    //     navigator.mozGetUserMedia(constraints, success, error);
    //   } else if (navigator.getUserMedia) {
    //     // 旧版API
    //     navigator.getUserMedia(constraints, success, error);
    //   }
    // },
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
            setTimeout(() => {
              this.userList = window.BRAC_GetOnlineUser();
              this.setVideoPos(this.userList);
            }, 500);
          } else {
            this.$dialog.alert({
              message: result.msg
            }).then(() => {
              this.$emit('onError', result.msg);
            });
          }
        }
      });
    },
    deviceConfig(data) {
      try {
        this.camera.config({
          bitRate: data?.bit || 300000, // 视频编码码率设置（参数为int型，单位bps）
          gop: 30, // 视频编码关键帧间隔控制（参数为int型）
          width: data?.width || 640, // 设置本地视频采集分辨率(宽度)
          height: data?.height || 480, // 设置本地视频采集分辨率(高度)
          fps: data?.fps || 15, // 设置本地视频编码的帧率
          recordBitRate: 0, // 设置录像视频码率  （参数为int型，单位bps）
          preset: 3, // 设置视频编码预设参数（值越大，编码质量越高，占用CPU资源也会越高）
          quality: 3 // 设置本地视频编码的质量
        });
        this.microphone.config({
          vadctrl: 1, // 音频静音检测控制,（1打开(默认)，0关闭）
          nsctrl: 1, // 音频噪音抑制控制,（1打开(默认)，0关闭）
          echoctrl: 1, // 音频回音消除控制,（1打开(默认)，0关闭）
          agcctrl: 1, // 音频自动增益控制,（1打开(默认)，0关闭）
          capturemode: 0 // 音频采集模式设置（0 发言模式（默认），1 放歌模式，2 卡拉OK模式，3 线路输入模式）
        });
      } catch (error) {
        this.$emit('onError', '摄像头打开失败');
      }
    },
    // 房间事件回调
    onAnyChatUserAtRoom(data) {
      console.log(data, '用户进出房间通知事件');
      if (data.action === 0) {
        this.userList = this.userList.filter((item) => { return item !== data.userId; });
      } else if (data.action === 1) {
        this.userList.push(data.userId);
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
          this.camera.open({
            id: 'CLIENT-AREA'
          });
          this.microphone.open();
          // 拉流
          this.$AnyChatH5SDK.getRemoteVideoStream({
            remoteUserId: List[0],
            renderId: 'AGENT-AREA',
            streamIndex: 0
          });
          this.$AnyChatH5SDK.getRemoteAudioStream({
            remoteUserId: List[0]
          });
        });
      } else if (List.length > 1) {
        // 多方通话
        this.manySidesList = List.map(item => {
          return ('manySide' + item).toString();
        });
        // 将本地视频divid添加到view列表渲染
        this.manySidesList.unshift(('manySide' + this.userid).toString());
        this.updateModel(2);

        this.$nextTick(() => {
          // 打开自己的摄像头与麦克风
          this.camera.open({
            id: ('manySide' + this.userid).toString()
          });
          this.microphone.open();
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
      opt ? window.BRAC_UserSpeakControl(-1, 1) : window.BRAC_UserSpeakControl(-1, 0);
    },
    // 开关摄像头---供子组件调用 opt = false 为关闭
    cameraHandel(opt) {
      if (this.friendList.length === 1) {
        // opt ? this.camera.open({ id: 'CLIENT-AREA' }) : this.camera.close();
        if (opt) {
          window.BRAC_UserCameraControlEx(-1, 1, 0, 0, '');
          window.BRAC_SetVideoPos(-1, document.getElementById('CLIENT-AREA'), 'me-video');
        } else {
          window.BRAC_UserCameraControlEx(-1, 0, 0, 0, '');
        }
      } else {
        opt ? this.camera.open({ id: ('manySide' + this.userid).toString() }) : this.camera.close();
      }
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
