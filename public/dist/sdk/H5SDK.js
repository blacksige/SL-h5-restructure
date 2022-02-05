var connectErrorCode = null;
//事件构造函数
function AnyChatSDKEventTarget() {
  // 事件处理程序数组集合
  this.handlers = {};
  this.doneHandlers = [];
}

//事件的原型对象
AnyChatSDKEventTarget.prototype = {

  // 注册给定类型的事件处理程序，
  addEvent: function (type, handler, isDoneEvent) {
    // 判断事件处理数组是否有该类型事件
    if (typeof this.handlers[type] == 'undefined') {
      this.handlers[type] = [];
      // 将处理事件push到事件处理数组里面
      this.handlers[type].push(handler);

    } else {
      if (isDoneEvent) {
        this.handlers[type].push(handler);
      } else {
        this.handlers[type].length = 0;
        this.handlers[type].push(handler);
      }
    }

    if (isDoneEvent) {
      this.doneHandlers.push(type);
    }

  },

  // 触发一个事件
  fireEvent: function (event) {
    // 模拟真实事件的event
    if (!event.target) {
      event.target = this;
    }
    // 判断是否存在该事件类型
    if (this.handlers[event.type] instanceof Array) {
      var handlers = this.handlers[event.type];
      // 在同一个事件类型下的可能存在多种处理事件，找出本次需要处理的事件
      for (var i = 0; i < handlers.length; i++) {
        // 执行触发
        var args = [];
        for (var k in event) {
          if (k != 'type') {
            args.push(event[k]);
          }
        }
        //(args);
        handlers[i].apply(null, args);
      }
      for (var j = 0; j < this.doneHandlers.length; j++) {
        if (event.type == this.doneHandlers[j]) {
          this.removeEvent(event);
          this.doneHandlers.splice(j, 1);
          break;
        }
      }
    }
  },

  // 注销事件
  removeEvent: function (event) {
    // 模拟真实事件的event
    if (!event.target) {
      event.target = this;
    }
    // 判断是否存在该事件类型
    if (this.handlers[event.type] instanceof Array) {
      delete this.handlers[event.type];
    }
  },

  //清空所有
  removeAll: function () {
    this.handlers = {};
    this.doneHandlers = [];
  }
};

var eventTarget = new AnyChatSDKEventTarget();

// 插拔式回调
function OnAnyChatPluginServer(data) {
  console.log("OnAnyChatPluginServer", data)
}

function OnAnyChatTransFileEx(dwTaskId, dwUserId, dwStatus, dwParam, lpParam) {}

function OnAnyChatNotifyMessage(dwNotifyMsg, wParam, lParam) {
  switch (dwNotifyMsg) {
    case WM_GV_CONNECT:
      OnAnyChatConnect(wParam, lParam);
      break;
    case WM_GV_LOGINSYSTEM:
      eventTarget.fireEvent({
        type: 'OnAnyChatLoginSystem',
        dwUserId: wParam,
        errorcode: lParam
      })
      break;
    case WM_GV_ENTERROOM:
      eventTarget.fireEvent({
        type: 'OnAnyChatEnterRoom',
        dwUserId: wParam,
        errorcode: lParam
      })
      break;
    case WM_GV_ONLINEUSER:
      eventTarget.fireEvent({
        type: 'OnAnyChatRoomOnlineUser',
        dwUserId: wParam,
        errorcode: lParam
      })
      break;
    case WM_GV_USERATROOM:
      eventTarget.fireEvent({
        type: 'OnAnyChatUserAtRoom',
        dwUserId: wParam,
        errorcode: lParam
      })
      break;
    case WM_GV_LINKCLOSE:
      eventTarget.fireEvent({
        type: 'OnAnyChatLinkClose',
        dwUserId: wParam,
        errorcode: lParam
      })
      break;
    case WM_GV_MEDIAAUTHORITY:
      eventTarget.fireEvent({
        type: 'OnAnyChatMediaAuthority',
        dwUserId: wParam,
        errorcode: lParam
      })
      break;
    case WM_GV_H5MEDIAOPENSTATUS:
      eventTarget.fireEvent({
        type: 'OnAnyChatH5MediaOpenStatus',
        dwUserId: wParam,
        errorcode: lParam
      })
      break
    default:
      break;
  }
}

function setVoiceRate(userid) {
  console.log('机器人userid', userid);
  BRAC_SetUserStreamInfo(userid, 0, BRAC_SO_AUDIO_VOLUMEGAIN, 19);
}

function OnAnyChatCoreSDKEvent(dwEventType, lpEventJsonStr, errcode) {
  // console.log("dwEventType", dwEventType, lpEventJsonStr);
  if (dwEventType == ANYCHAT_SDKCTRL_AIABILITY) { //AI能力调用
    CoreSDKEvent(dwEventType, lpEventJsonStr, errcode)
  } else if (dwEventType == ANYCHAT_SDKCTRL_BUSINESSBUFFER) { //业务透明通道
    // console.log(lpEventJsonStr);
    var result = JSON.parse(lpEventJsonStr);
    eventTarget.fireEvent({
      type: 'OnAnyChatBuffer' + result.requestId,
      result: result,
      errorcode: errcode
    })
  } else if (dwEventType == 4) { //录像生成开始回调
    // console.log(dwEventType, lpEventJsonStr, errcode);
    var result2 = JSON.parse(lpEventJsonStr);
    eventTarget.fireEvent({
      type: 'OnAnyChatStartRecord',
      result: {
        result: result2,
      }
    })
  } 
  // else if (dwEventType == ANYCHAT_SDKCTRL_SERVEROBJECT) { //插拔式
  //   var result = JSON.parse(lpEventJsonStr);
  //   if (result.eventtype == 2 && result.status == 3) {
  //     // 注册
  //     eventTarget.fireEvent({
  //       type: 'onInitPluginServer',
  //       result: result,
  //       errorcode: errcode
  //     })
  //   } else if (result.cmd == "qualitynotifycmd") {
  //     // 发消息
  //     eventTarget.fireEvent({
  //       type: 'onDoPluginServer',
  //       result: result,
  //       errorcode: errcode
  //     })
  //   } else if (result.eventtype == 2 && result.status == 1) {
  //     // 注销
  //     eventTarget.fireEvent({
  //       type: 'onRemovePluginServer',
  //       result: result,
  //       errorcode: errcode
  //     })
  //   }

  // } 
  else if (dwEventType == ANYCHAT_CORESDKEVENT_TRANSFILE) {
    console.log("图片回调---", dwEventType, lpEventJsonStr, errcode)
    var result = JSON.parse(lpEventJsonStr);
    eventTarget.fireEvent({
      type: 'onTransFile',
      result: result,
      errorcode: errcode
    })
    // console.log("OnAnyChatCoreSDKEvent---", dwEventType, lpEventJsonStr, errcode)

  }
  // else if (dwEventType == 13) { //录像心跳回调
  //   var eventJsonObj = JSON.parse(lpEventJsonStr);
  //   eventTarget.fireEvent({
  //     type: "OnRecordStatusDone",
  //     result: eventJsonObj,
  //   });
  // }
}

// 网络异常中断开始时触发
function OnAnyChatLinkCloseInstant(...args) {
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]);
  }
}

// 网络异常中断后重连成功后触发
function OnAnyChatRelink(...args) {
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]);
  }
}

function OnAnyChatConnect(bSuccess, errorcode) {
  connectErrorCode = errorcode;
}

function OnAnyChatRecordSnapShotEx(dwUserId, lpFileName, dwElapse, dwFlags, dwParam, lpUserStr) {}

// 录像完成回调
function OnAnyChatRecordSnapShotEx2(dwUserId, dwErrorCode, lpFileName, dwElapse, dwFlags, dwParam, lpUserStr) {
  // if (!lpFileName) {
  //   return
  // }
  eventTarget.fireEvent({
    type: 'OnAnyChatRecord',
    result: {
      dwUserId: dwUserId,
      filePath: lpFileName,
      elapse: dwElapse,
      errorcode: dwErrorCode,
    }
  })
}

//初始化sdk
function sdkInit(opt) {
  var apilevel = 1;
  var errorcode = BRAC_InitSDK(apilevel); //初始化sdk
  (typeof (opt.onLogin) === "function") &&
  eventTarget.addEvent("OnAnyChatLoginSystem", opt.onLogin, true);
  (typeof (opt.onDisConnect) === "function") &&
  eventTarget.addEvent("OnAnyChatLinkClose", opt.onDisConnect, true);
  (typeof (opt.OnAnyChatRecord) === "function") &&
  eventTarget.addEvent("OnAnyChatRecord", opt.OnAnyChatRecord, true);
  if (errorcode == GV_ERR_SUCCESS) {
    BRAC_Connect(opt.serverIp, opt.serverPort);
    var timer = setInterval(function () {
      if (connectErrorCode !== null) {
        clearInterval(timer);
        if (connectErrorCode == 0) {
          if (opt.hasOwnProperty('appId')) {
            BRAC_SetSDKOption(BRAC_SO_CLOUD_APPGUID, opt.appId);
            var ANYCHAT_OBJECT_FLAGS_SELFSERVICE = 8192 //自助服务模式
            var objectflags = ANYCHAT_OBJECT_FLAGS_QUEUEUSERLIST + ANYCHAT_OBJECT_FLAGS_SELFSERVICE;
            BRAC_LoginEx(opt.nickName, -1, opt.nickName, opt.appId, 0, "", "");
          } else {
            BRAC_Login(opt.nickName, opt.password || "", 0);
          }

        } else {
          (typeof (opt.onLogin) === "function") && opt.onLogin(connectErrorCode)
        }
      }
    }, 50)
  }
  return errorcode;
}
//进入房间
function enterRoom(opt) {
  BRAC_EnterRoom(opt.roomId || 100112, opt.password || "", 0);
  (typeof (opt.done) === "function") &&
  eventTarget.addEvent("OnAnyChatEnterRoom", opt.done, true);
  (typeof (opt.onRoomUserInAndOut) === "function") &&
  eventTarget.addEvent("OnAnyChatUserAtRoom", opt.onRoomUserInAndOut, true);
  (typeof (opt.OnAnyChatRoomOnlineUser) === "function") &&
  eventTarget.addEvent("OnAnyChatRoomOnlineUser", opt.OnAnyChatRoomOnlineUser, true);
}
//退出房间
function leaveRoom() {
  BRAC_LeaveRoom(-1);
}
//音视频授权
function videoAuthor(opt) {
  BRAC_SDKControl(ANYCHAT_SDKCTRL_MEDIAAUTHORITY, ""); //获取授权
  (typeof (opt.done) === "function") &&
  eventTarget.addEvent("OnAnyChatMediaAuthority", opt.done, true);
}
//打开音视频
function openMedia(opt) {
  var userid = opt.userId || -1;
  var streamIndex = opt.streamIndex || 0;
  var width = opt.width || 640;
  var height = opt.height || 480;
  // 设置本地视频编码的码率（如果码率为0，则表示使用质量优先模式）
  BRAC_SetUserStreamInfo(userid, streamIndex, BRAC_SO_LOCALVIDEO_BITRATECTRL, 0);

  // 设置本地视频编码的质量
  BRAC_SetUserStreamInfo(userid, streamIndex, BRAC_SO_LOCALVIDEO_QUALITYCTRL, 3);

  // 设置本地视频编码的帧率
  BRAC_SetUserStreamInfo(userid, streamIndex, BRAC_SO_LOCALVIDEO_FPSCTRL, 15);

  // 设置本地视频采集分辨率
  BRAC_SetUserStreamInfo(userid, streamIndex, BRAC_SO_LOCALVIDEO_WIDTHCTRL, width);
  BRAC_SetUserStreamInfo(userid, streamIndex, BRAC_SO_LOCALVIDEO_HEIGHTCTRL, height);

  // 让视频参数生效
  // BRAC_SetUserStreamInfo(userid, streamIndex, BRAC_SO_LOCALVIDEO_APPLYPARAM, 1);

  (typeof (opt.done) === "function") &&
  eventTarget.addEvent("OnAnyChatH5MediaOpenStatus", opt.done, true);
  //音频操作
  BRAC_UserSpeakControlEx(userid, 1, streamIndex, 0, 0);
  //视频操作
  BRAC_UserCameraControlEx(userid, 1, streamIndex, 0, 0);
  //设置视频显示位置
  if (opt.videoId) {
    BRAC_SetVideoPos(userid, opt.videoId, opt.videoType || 'anychat-video');
  }
}
//关闭音视频
function closeMedia(opt) {
  opt = opt || {};
  var userid = opt.userId || -1;
  var streamIndex = opt.streamIndex || 0;
  //音频操作
  BRAC_UserSpeakControlEx(userid, 0, streamIndex, 0, 0);
  //视频操作
  BRAC_UserCameraControlEx(userid, 0, streamIndex, 0, 0);
}

//单独关闭音频
function closeAudioAlone(userId) {
  userId = userId || -1
  return BRAC_UserSpeakControl(userId, 0)
}
//单独开启音频
function openAudioAlone(userId) {
  userId = userId || -1
  return BRAC_UserSpeakControl(userId, 1)
}


var recordParams = BRAC_RECORD_FLAGS_SERVER + BRAC_RECORD_FLAGS_VIDEO + BRAC_RECORD_FLAGS_AUDIO +
  BRAC_RECORD_FLAGS_MIXAUDIO + BRAC_RECORD_FLAGS_MIXVIDEO + BRAC_RECORD_FLAGS_STEREO +
  BRAC_RECORD_FLAGS_LOCALCB;

var rec_tag = BRAC_RECORD_FLAGS_SERVER + BRAC_RECORD_FLAGS_VIDEO + BRAC_RECORD_FLAGS_AUDIO +
  BRAC_RECORD_FLAGS_MIXAUDIO + BRAC_RECORD_FLAGS_MIXVIDEO + BRAC_RECORD_FLAGS_STEREO +
  BRAC_RECORD_FLAGS_LOCALCB;

//开始录制视频
function startRecord(opt) {
  opt = opt || {};
  var streamIndex = opt.streamIndex || 0;
  var width = opt.width || 640;
  var height = opt.height || 480;
  var userid = opt.userId || -1;
  var string = {
    "recordlayout": 1,
    "streamlist": [{
      "userid": -1,
      "streamindex": streamIndex,
      "recordindex": 0
    }]
  };

  // statusnotify是录像状态返回频率
  // if (opt.hasOwnProperty("statusnotify")) {
  //   string.statusnotify = opt.statusnotify;
  // }
  if (opt.hasOwnProperty("clipMode")) {
    //视频裁剪模式设置
    BRAC_SetSDKOption(BRAC_SO_RECORD_CLIPMODE, parseInt(opt.clipMode));
  }
  if (opt.hasOwnProperty("fileName")) {
    string.filename = opt.fileName;
  }
  //文字水印
  if (opt.hasOwnProperty("textWatermark")) {
    string.textoverlay = opt.textWatermark;
  }
  //图片水印
  if (opt.hasOwnProperty("picWatermark")) {
    string.watermark = opt.picWatermark;
  }
  (typeof (opt.done) === "function") &&
  eventTarget.addEvent("OnAnyChatRecord", opt.done);
  (typeof (opt.event) === "function") &&
  eventTarget.addEvent("OnAnyChatStartRecord", opt.event);
  // (typeof (opt.OnRecordStatusDone) === "function") &&
  // eventTarget.addEvent("OnRecordStatusDone", opt.OnRecordStatusDone);
  BRAC_SetSDKOption(BRAC_SO_RECORD_WIDTH, width);
  BRAC_SetSDKOption(BRAC_SO_RECORD_HEIGHT, height);

  var errorCode = BRAC_StreamRecordCtrlEx(userid, 1, recordParams, streamIndex, JSON.stringify(string));
  return errorCode; //目前开始录制没有错误回调
}
//停止录制
function stopRecord(opt) {
  opt = opt || {};
  var userid = opt.userId || -1;
  var streamIndex = opt.streamIndex || 0;
  var string = {
    "recordlayout": 1,
    "streamlist": [{
      "userid": -1,
      "streamindex": streamIndex,
      "recordindex": 0
    }]
  };
  (typeof (opt.done) === "function") &&
  eventTarget.addEvent("OnAnyChatRecord", opt.done, true);
  return BRAC_StreamRecordCtrlEx(userid, 0, recordParams, streamIndex, JSON.stringify(string));
}
//释放sdk资源
function anychatLogout() {
  console.log('退出房间');
  closeMedia();
  leaveRoom();
  BRAC_Logout();
}
//发送业务透明通道
function sendBuffer(option) {
  var msg = {
    "requestId": option.taskid,
    "params": option.data,
    "command": option.api,
  };
  var instr = {
    "flags": 0,
    "timeout": option.timeout || 5000, //超时时间默认5000
    "strparam": msg //需要发送的字符串数据
  };
  console.log(instr);
  (typeof (option.done) === "function") &&
  eventTarget.addEvent("OnAnyChatBuffer" + option.taskid, option.done, true);
  BRAC_SDKControl(ANYCHAT_SDKCTRL_BUSINESSBUFFER, JSON.stringify(instr));
  // console.log('透明通道参数', instr);
}
// H5传图片到集群
function transFileH5(option) {
  var taskGuid = renderGuid();
  var json_ = {};
  json_.data = option.base64;
  json_.category = option.category; //用户自定义文件夹名字
  json_.filename = option.filename; //用户自定义文件名字
  // 注册回调
  (typeof (option.done) === "function") &&
  eventTarget.addEvent("onTransFile", option.done, true);
  BRAC_TransFileEx(taskGuid, 0, option.filename, ANYCHAT_TRANS_FILE_DATA_TYPE_BASE4, JSON.stringify(json_));
}
// //init插拔式服务
// function initPluginServer(option) {
//   var serverobject = renderGuid();
//   var jsoncmd1 = {
//     cmd: 1,
//     serverobject: serverobject,
//     svrflags: 2148532224
//   };
//   // 注册回调
//   (typeof (option.done) === "function") &&
//   eventTarget.addEvent("onInitPluginServer", option.done, true);
//   BRAC_SDKControl(ANYCHAT_SDKCTRL_SERVEROBJECT, JSON.stringify(jsoncmd1));
// }
// //执行插拔式服务
// function doPluginServer(option) {
//   if (!option.cmd) {
//     return
//   }
//   if (!option.code) {
//     return
//   }

//   var json1 = JSON.stringify({
//     "cmd": option.cmd,
//     "code": option.code,
//     "data": option.data,
//   })
//   var jsoncmd1 = {
//     "cmd": 4,
//     "serverobject": option.taskid,
//     "svrflags": 2148532224,
//     "databuf": json1
//   };
//   // 注册插拔式回调
//   (typeof (option.done) === "function") &&
//   eventTarget.addEvent("onDoPluginServer", option.done, true);
//   BRAC_SDKControl(ANYCHAT_SDKCTRL_SERVEROBJECT, JSON.stringify(jsoncmd1));

// }
// //销毁插拔式服务
// function removePluginServer(option) {
//   var jsoncmd1 = {
//     cmd: 2,
//     serverobject: option.taskid,
//     svrflags: 2148532224
//   };
//   // 销毁回调
//   (typeof (option.done) === "function") &&
//   eventTarget.addEvent("onRemovePluginServer", option.done, true);
//   BRAC_SDKControl(ANYCHAT_SDKCTRL_SERVEROBJECT, JSON.stringify(jsoncmd1));
// }
window.onunload = function () {
  if (anychat) {
    anychatLogout()
  }
}
