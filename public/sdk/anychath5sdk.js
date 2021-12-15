/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var AnyChatSDKConstant = __webpack_require__(1);
	var AnyChatSDKEventTarget = __webpack_require__(2);
	var AnyChatSDKUserHandler = __webpack_require__(3);
	var AnyChatSDKQueueHandler = __webpack_require__(6);
	var AnyChatSDKEventDispatcher = __webpack_require__(7);
	var AnyChatSDKAudioHandler = __webpack_require__(9);
	var AnyChatSDKVideoHandler = __webpack_require__(10);
	var AnyChatSDKVideoCallHandler = __webpack_require__(8);
	var AnyChatSDKAreaHandler = __webpack_require__(4);
	var AnyChatSDKErrorCode = __webpack_require__(5);
	var AnyChatSDKSettingHandler = __webpack_require__(11);



	var info = {}; // 保存信息

	var getIntUserId = AnyChatSDKUserHandler.getIntUserId;
	var getStrUserId = AnyChatSDKUserHandler.getStrUserId;

	/*--------------------------------------------------------
	 * AnyChatSDKInstance
	 * AnyChat SDK实例，全局唯一
	 * 
	 * -------------------------------------------------------
	 */
	function AnyChatSDKInstance() {
	    this.anychat = null; // AnyChat插件DOM对象
	    this.eventTarget = AnyChatSDKEventTarget.instance;
	    this.isInitDone = false;
	    this.curConnectStatus = AnyChatSDKConstant.instance.ConnectStatus.INIT;
	    this.disconnectResultCode = 0;
	    this.eventDispatcher = AnyChatSDKEventDispatcher.instance;
	    this.constant = AnyChatSDKConstant.instance;
	    this.strUserId = info.strUserId;

	    this.bSupportCluster = false; // 是否支持集群系统
	    this.isCluster = 0; //判断是否用集群或云平台登录
	}

	//初始化AnyChat SDK DOM对象
	AnyChatSDKInstance.prototype.init = function(apilevel) {

	    var errorcode = BRAC_InitSDK("1");
	    var that = this;

	    setTimeout(function(){
	        if (errorcode === 0) {
	            that.eventDispatcher.callbackinit(that, anychat);
	            that.isInitDone = true;

	            that.curConnectStatus = that.constant.ConnectStatus.INITIALIZED;
	            that.anychat = anychat;
	            if(info.hasOwnProperty("appId") && info.appId != "") {
	                BRAC_SetSDKOption(BRAC_SO_CLOUD_APPGUID, info.appId);
	            }
	            var connectCode;

	            connectCode = BRAC_Connect(info.serverIp, info.serverPort);
	            // H5模式下，不可以这样一起调用，Login要写在Connect的回调里
	            if (connectCode == 0) {
	                that.login();   
	            }
	        } else {
	            that.eventTarget.fireEvent({
	                type: "onDisConnect",
	                result: {
	                    code: errorcode,
	                    msg: AnyChatSDKErrorCode.checkErrorMsg(errorcode)
	                }
	            });
	        }
	    },10)
	};

	//断开连接
	AnyChatSDKInstance.prototype.disConnect = function() {
	    var errorCode = BRAC_Logout();
	    if (errorCode == 0) {
	        errorCode = 101;
	        var errorMsg = AnyChatSDKErrorCode.checkErrorMsg(errorCode);
	    }
	    var result = {
	        errorCode: errorCode,
	        msg: errorMsg
	    };
	    instance.eventTarget.fireEvent({
	        type: "onDisConnect",
	        result: result
	    });
	};


	//用户登录
	AnyChatSDKInstance.prototype.login = function() {
	    var userLoginObj = {
	        nickName: info.nickName,
	        userId: info.userId,
	        strUserId: info.strUserId,
	        password: info.password,
	        appId: info.appId,
	        timeStamp: info.timeStamp,
	        signData: info.sign
	    };
	    var errorCode = AnyChatSDKUserHandler.instance.login(userLoginObj);
	    return errorCode;
	};

	//用户退出
	AnyChatSDKInstance.prototype.logout = function() {
	    var errorCode = AnyChatSDKUserHandler.instance.logout(this);
	    info = {};
	    AnyChatSDKAreaHandler.instance.areaIdArray = [];
	    AnyChatSDKAreaHandler.instance.areaIdIndex = 0;
	    AnyChatSDKUserHandler.instance.userType = -1;
	    AnyChatSDKEventTarget.instance.removeAll();
	    AnyChatH5SDK.anychatSDKInstance = null;
	    return errorCode;
	};

	//用户进入房间
	AnyChatSDKInstance.prototype.enterRoom = function(roomObj) {
	    if (!roomObj.roomId) return false;
	    info.roomId = roomObj.roomId;
	    (typeof(roomObj.done) === "function") && this.setCallBack("OnAnyChatEnterRoom", roomObj.done, true);
	    var errorCode = AnyChatSDKUserHandler.instance.enterRoom(roomObj);
	    return errorCode;
	};

	//获取房间中的用户列表
	AnyChatSDKInstance.prototype.getRoomUsers = function() {
	    var list = AnyChatSDKUserHandler.instance.getRoomUsers();
	    return list;
	};

	//用户退出房间
	AnyChatSDKInstance.prototype.leaveRoom = function() {
	    var errorCode = AnyChatSDKUserHandler.instance.leaveRoom(this);
	    return errorCode;
	};

	//发送文本消息
	AnyChatSDKInstance.prototype.sendMsg = function(opt) {
	    if (opt.targetUsers)
	        opt.targetUsers = opt.targetUsers.map(getIntUserId);
	    var errorCode = AnyChatSDKUserHandler.instance.sendMsg(opt);
	    return errorCode;
	};

	//发送透明通道消息
	AnyChatSDKInstance.prototype.transBuffer = function(opt) {
	    if (opt.targetUsers) {
	        opt.targetUsers = opt.targetUsers.map(getIntUserId);
	        for (var i = 0; i < opt.targetUsers.length; i++) {
	            (typeof(opt.done) === "function") && this.setCallBack("onTransBufferDone" +  opt.targetUsers[i], opt.done, true);
	        }
	    }
	    var taskId = AnyChatSDKUserHandler.instance.transBuffer(opt);
	    var errorCode = taskId > 0 ? 0 : -1;
	};

	//发送透明通道消息(扩展)
	AnyChatSDKInstance.prototype.transBufferEx = function(opt) {
	    if (opt.targetUsers) {
	        opt.targetUsers = opt.targetUsers.map(getIntUserId);
	        for (var i = 0; i < opt.targetUsers.length; i++) {
	            (typeof(opt.done) === "function") && this.setCallBack("onTransBufferDone" +  opt.targetUsers[i], opt.done, true);
	        }
	    }
	    var taskId = AnyChatSDKUserHandler.instance.transBufferEx(opt);
	    var errorCode = taskId > 0 ? 0 : -1;
	};

	//获取本地麦克风对象列表
	AnyChatSDKInstance.prototype.getMicrophones = function() {
	    var microDevices = []; 
	    microDevices = BRAC_EnumDevices(BRAC_DEVICE_AUDIOCAPTURE);
	    var mDeviceObj = [];
	    for (var i = 0; i < microDevices.length; i++) {
	        mDeviceObj.push(new AnyChatSDKAudioHandler.instance(microDevices[i]));
	    }
	    return mDeviceObj;
	};

	//获取本地扬声器对象列表
	AnyChatSDKInstance.prototype.getSpeaks = function() {
	    var microDevices = BRAC_EnumDevices(BRAC_DEVICE_AUDIOPLAYBACK);
	    var mDeviceObj = [];
	    for (var i = 0; i < microDevices.length; i++) {
	        mDeviceObj.push(new AnyChatSDKAudioHandler.instance(microDevices[i]));
	    }
	    return mDeviceObj;
	};

	//获取摄像头设备对象
	AnyChatSDKInstance.prototype.getCameras = function() {
	    var mDevices = [];
	    mDevices = BRAC_EnumDevices(BRAC_DEVICE_VIDEOCAPTURE);
	    var mDeviceObj = [];
	    for (var i = 0; i < mDevices.length; i++) {
	        mDeviceObj.push(new AnyChatSDKVideoHandler.instance(mDevices[i]));
	    }
	    return mDeviceObj;
	};

	//接收对方音频流
	AnyChatSDKInstance.prototype.getRemoteAudioStream = function(opt) {
	    var errorCode = AnyChatSDKAudioHandler.openAudio(getIntUserId(opt.remoteUserId));
	    return errorCode;
	};

	//终止对方音频流
	AnyChatSDKInstance.prototype.cancelRemoteAudioStream = function(opt) {
	    var errorCode = AnyChatSDKAudioHandler.closeAudio(getIntUserId(opt.remoteUserId));
	    return errorCode;
	};

	//接收对方视频流
	AnyChatSDKInstance.prototype.getRemoteVideoStream = function(opt) {
	    var params = {
	        userId: getIntUserId(opt.remoteUserId),
	        deviceName: "",
	        demoId: opt.renderId
	    };
	    if (opt.hasOwnProperty("streamIndex")) {
	        params.streamIndex = opt.streamIndex;
	    }
	    var errorCode = AnyChatSDKVideoHandler.openVideo(params);
	    return errorCode;
	};

	//终止对方视频流
	AnyChatSDKInstance.prototype.cancelRemoteVideoStream = function(opt) {
	    var params = {
	        userId: getIntUserId(opt.remoteUserId)
	    };
	    if (opt.hasOwnProperty("streamIndex")) {
	        params.streamIndex = opt.streamIndex;
	    }
	    var errorCode = AnyChatSDKVideoHandler.closeVideo(params);
	    return errorCode;
	};

	//业务通道
	AnyChatSDKInstance.prototype.businessChannel = function (option) {
	    var requestId = BRAC_NewGuid();
	    (typeof (option.event) === "function") && AnyChatH5SDK.anychatSDKInstance.setCallBack("businessChannel" + requestId, option.event, true);//任务开始
	    var flag = option.flags;
	    var instr = {
	        "flags": flag,
	        "timeout": option.timeout || 5000,//超时时间默认5000
	        "strparam": option.strparam //需要发送的字符串数据
	    };
	    option.strparam["requestId"] = requestId;
	    var errorCode = BRAC_SDKControl(ANYCHAT_SDKCTRL_BUSINESSBUFFER, JSON.stringify(instr));
	    return errorCode;
	}

	//呼叫目标用户
	AnyChatSDKInstance.prototype.requestVideoCall = function(opt) {
	    opt.userId = getIntUserId(opt.userId);
	    var errorCode = AnyChatSDKVideoCallHandler.instance.request(opt);
	    (typeof(opt.done) === "function") && this.setCallBack("onRequestVideoCallDone", opt.done, true);
	    return errorCode;
	};

	//接受呼叫请求
	AnyChatSDKInstance.prototype.acceptVideoCall = function(opt) {
	    opt.userId = getIntUserId(opt.userId);
	    var errorCode = AnyChatSDKVideoCallHandler.instance.accept(opt);
	    return errorCode;
	};

	//拒绝视频呼叫请求
	AnyChatSDKInstance.prototype.rejectVideoCall = function(opt) {
	    opt.userId = getIntUserId(opt.userId);
	    var errorCode = AnyChatSDKVideoCallHandler.instance.reject(opt);
	    return errorCode;
	};

	//挂断视频通话
	AnyChatSDKInstance.prototype.hangupVideoCall = function(opt) {
	    opt.userId = getIntUserId(opt.userId);
	    var errorCode = AnyChatSDKVideoCallHandler.instance.hangup(opt);
	    return errorCode;
	};

	//取消视频呼叫
	AnyChatSDKInstance.prototype.cancelVideoCall = function(opt) {
	    opt.userId = getIntUserId(opt.userId);
	    var errorCode = AnyChatSDKVideoCallHandler.instance.cancel(opt);
	    return errorCode;
	};

	//获取系统配置的营业厅列表
	AnyChatSDKInstance.prototype.getAreas = function(opt) {
	    var errorCode = AnyChatSDKAreaHandler.instance.getAreas(opt);
	    (typeof(opt.done) === "function") && this.setCallBack("onSyncAreasDone", opt.done, true);
	};

	//进入营业厅
	AnyChatSDKInstance.prototype.enterArea = function(opt) {
	    var errorCode = AnyChatSDKAreaHandler.instance.inArea(this, opt);
	    (typeof(opt.done) === "function") && this.setCallBack("onEnterAreaDone", opt.done, true);
	    var params = JSON.parse(JSON.stringify(opt));
	    (typeof(params.done) === "function") && delete params.done;
	};

	//离开营业厅
	AnyChatSDKInstance.prototype.leaveArea = function(opt) {
	    var errorCode = AnyChatSDKAreaHandler.instance.outArea(this);
	    (typeof(opt.done) === "function") && this.setCallBack("onLeaveAreaDone", opt.done, true);
	};

	//进入队列
	AnyChatSDKInstance.prototype.enqueue = function(opt) {
	    var errorCode = AnyChatSDKQueueHandler.instance.inQueue(this, opt);
	    (typeof(opt.done) === "function") && this.setCallBack("onEnqueueDone", opt.done, true);
	    (typeof(opt.onProcessChanged) === "function") && this.setCallBack("onProcessChanged", opt.onProcessChanged, false);
	};

	//离开队列
	AnyChatSDKInstance.prototype.cancelQueuing = function(opt) {
	    var errorCode = AnyChatSDKQueueHandler.instance.outQueue(this);
	    (typeof(opt.done) === "function") && this.setCallBack("onCancelQueuingDone", opt.done, true);
	};

	//坐席服务控制
	AnyChatSDKInstance.prototype.agentServiceCtrl = function(opt) {
	    var errorCode = AnyChatSDKAreaHandler.instance.agentServiceCtrl(this, opt);
	    (typeof(opt.done) === "function") && this.setCallBack("onServiceCtrlDone", opt.done, true);
	    (typeof(opt.onAgentStatusChanged) === "function") && this.setCallBack("onAgentStatusChanged", opt.onAgentStatusChanged, false);
	    (typeof(opt.onAgentServiceInfoNotify) === "function") && this.setCallBack("onAgentServiceInfoNotify", opt.onAgentServiceInfoNotify, false);
	};

	//主动查询坐席服务状态数据
	AnyChatSDKInstance.prototype.getAgentStatus = function() {
	    var data = AnyChatSDKAreaHandler.instance.getAgentStatus(this);
	    return data;
	};

	//查询排队时长
	AnyChatSDKInstance.prototype.getQueueTime = function(opt) {
	    var second = AnyChatSDKQueueHandler.instance.getQueueTime(opt);
	    return second;
	};

	//查询队列排队人数
	AnyChatSDKInstance.prototype.getQueueLength = function(opt) {
	    var length = AnyChatSDKQueueHandler.instance.getQueueLength(opt);
	    return length;
	};

	//查询排队的位置
	AnyChatSDKInstance.prototype.getQueuePos = function(opt) {
	    var pos = AnyChatSDKQueueHandler.instance.getQueuePos(opt);
	    return pos;
	};

	//查询队列排队用户的详细信息
	AnyChatSDKInstance.prototype.getQueueUserInfo = function(opt) {
	    var userList = AnyChatSDKQueueHandler.instance.getQueueUserInfo(opt);
	    return userList;
	};

	//查询服务区域内排队的用户数
	AnyChatSDKInstance.prototype.getAreaQueueUserCount = function(opt) {
	    var count = AnyChatSDKAreaHandler.instance.getAreaQueueUserCount(opt);
	    return count;
	};

	//设置SDK参数
	AnyChatSDKInstance.prototype.setSDKOption = function(opt) {
	    AnyChatSDKSettingHandler.instance.setSDKOption(opt);
	};

	//获取SDK参数
	AnyChatSDKInstance.prototype.getSDKOptionInt = function(infoName) {
	    return AnyChatSDKSettingHandler.instance.getSDKOptionInt(infoName);
	};
	AnyChatSDKInstance.prototype.getSDKOptionString = function(infoName) {
	    return AnyChatSDKSettingHandler.instance.getSDKOptionString(infoName);
	};
	    
	//查询用户多媒体流参数
	AnyChatSDKInstance.prototype.getStreamInfo = function(opt) {
	    var data = AnyChatSDKVideoHandler.getUserStreamInfo(opt);
	    return data;
	};

	//查询插件版本
	AnyChatSDKInstance.prototype.getVersionInfo = function() {
	    return AnyChatSDKSettingHandler.instance.getVersionInfo();
	};

	//查询指定用户相关状态
	AnyChatSDKInstance.prototype.getUserState = function(opt) {
	    opt.userId = getIntUserId(opt.userId);
	    var data = AnyChatSDKSettingHandler.instance.getState(opt);
	    return data;
	};

	//设置屏幕旋转
	AnyChatSDKInstance.prototype.setRotation = function(opt) {
	    AnyChatSDKSettingHandler.instance.setRotation(opt);
	};


	AnyChatSDKInstance.prototype.setCallBack = function(type, callback, isDoneEvent) {
	    this.eventTarget.addEvent(type, callback, isDoneEvent);
	};

	//动态注册回调事件
	AnyChatSDKInstance.prototype.callbackFunctionRegister = function(option) {
	    if (typeof option === "object") {
	        var keys = [];
	        for (var p in option) {
	            if (option.hasOwnProperty(p) && typeof(option[p]) === "function")
	                keys.push(p);
	        }
	        for (var p in keys) {
	            var key = keys[p];
	            this.setCallBack(key, option[key], false);
	        }
	    }
	};

	//动态销毁回调事件
	AnyChatSDKInstance.prototype.callbackFunctionDestroy = function(option) {
	    if (typeof option === "object") {
	        for (var p in option) {
	            if (option.hasOwnProperty(p) && typeof(option[p]) === "function")
	                this.eventTarget.removeEvent({
	                    type: p
	                });
	        }
	    }
	};

	AnyChatSDKInstance.prototype.getInitDone = function() {
	    return this.isInitDone;
	};

	AnyChatSDKInstance.prototype.turnPathToUrl = function(opt) {
	    var url = BRAC_GetSDKOptionStringEx(BRAC_SO_LOCALPATH2URL, opt.path, 0);
	    return url;
	};

	AnyChatSDKInstance.prototype.getAgentCount = function(opt) {
	    var data = {};
	    data.allAgentCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, opt.areaId, ANYCHAT_AREA_INFO_AGENTCOUNT);
	    data.idleAgentCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, opt.areaId, ANYCHAT_AREA_INFO_IDLEAGENTCOUNT);
	    return data;
	};

	AnyChatSDKInstance.prototype.getIntUserId = function(strUserId) {
	    return AnyChatSDKUserHandler.getIntUserId(strUserId);
	};

	AnyChatSDKInstance.prototype.getUserName = function(opt) {
	    // var userName = "";
	    var userName = BRAC_GetUserName(opt.userId);
	    if(userName == ""){
	        userName = BRAC_QueryInfoFromServer(ANYCHAT_SERVERQUERY_NAMEBYUSERID, opt.userId);
	        if(userName == ""){
	            userName = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_CLIENTUSER, opt.userId, ANYCHAT_OBJECT_INFO_NAME);
	        }
	    }
	    
	    return userName;
	};

	AnyChatSDKInstance.prototype.getUserInfos = function(opt) {
	    var useridlist = {},opt = opt || '';
	    if((typeof opt == 'object')&&opt.constructor == Array){
	        useridlist.useridlist = opt;
	    }else if((typeof opt == 'string')&&opt.constructor == String){
	        useridlist.userstrid = opt;
	    }else if((typeof opt=='number')&&opt.constructor==Number){
	        useridlist.userid = opt;
	    };
	    var userDatas = BRAC_QueryInfoFromServer(ANYCHAT_SERVERQUERY_USERINFOBYID, JSON.stringify(useridlist));
	    return userDatas;
	};

	AnyChatSDKInstance.prototype.selectVideoCapture = function(opt) {
	    BRAC_SelectVideoCapture(BRAC_DEVICE_VIDEOCAPTURE, opt.deviceName);
	};

	// 获取GUID字符串
	AnyChatSDKInstance.prototype.createGuid = function(){
	    return BRAC_NewGuid();
	};

	// 设置虚拟背景
	AnyChatSDKInstance.prototype.setVirtualBgImg = function(opt){
	    return AnyChatSDKSettingHandler.instance.setVirtualBkImg(opt);
	};
	// 设置虚拟演播室
	AnyChatSDKInstance.prototype.setVirtualStudio = function(opt){
	    return AnyChatSDKSettingHandler.instance.setVirtualStudio(opt);
	};

	/*----------------------------------------------------------
	 * AnyChatSDK
	 * 函数说明:AnyChatSDK 工厂,用于创建AnyChatSDK实例
	 * 
	 * ---------------------------------------------------------
	 */
	function AnyChatH5SDK() {
	    this.anychatSDKInstance = null;
	}

	AnyChatH5SDK.prototype.sdkInit = function(option) {
	    this.anychatSDKInstance = new AnyChatSDKInstance();

	    AnyChatSDKEventTarget.instance.removeAll();

	    info.serverIp = option.serverIp ? option.serverIp : "demo.anychat.cn";

	    info.serverPort = option.serverPort ? option.serverPort : 8906;

	    info.appId = option.appId ? option.appId : "";

	    info.timeStamp = option.timeStamp ? option.timeStamp : 0;

	    info.nickName = option.nickName;

	    info.userId = option.userId ? option.userId : -1;

	    info.strUserId = option.strUserId ? option.strUserId : "";

	    info.password = option.password ? option.password : "";

	    info.sign = option.sign ? option.sign : "";
	    if(info.sign != ""){
	        AnyChatH5SDK.anychatSDKInstance.isCluster = 1;
	    } else {
	        AnyChatH5SDK.anychatSDKInstance.isCluster = option.password ? 0: 1;
	    }
	 
	    if (typeof option.queueOpt === "object") {
	        if (option.queueOpt.hasOwnProperty("role")) {
	            AnyChatSDKUserHandler.instance.userType = parseInt(option.queueOpt.role);
	            info.role = option.queueOpt.role;
	        }
	        if (option.queueOpt.hasOwnProperty("name")) {
	            AnyChatSDKQueueHandler.instance.name = option.queueOpt.name;
	            info.name = option.queueOpt.name;
	        }
	        if (option.queueOpt.hasOwnProperty("priority")) {
	            AnyChatSDKQueueHandler.instance.priority = option.queueOpt.priority;
	            info.priority = option.queueOpt.priority;
	        }
	        if (option.queueOpt.hasOwnProperty("attribute")) {
	            AnyChatSDKQueueHandler.instance.attribute = option.queueOpt.attribute ? option.queueOpt.attribute : "";
	            info.attribute = option.queueOpt.attribute ? option.queueOpt.attribute : "";
	        }
	        if (option.queueOpt.hasOwnProperty("isAutoMode")) {
	            AnyChatSDKQueueHandler.instance.isAutoMode = option.queueOpt.isAutoMode;
	            info.isAutoMode = option.queueOpt.isAutoMode;
	        }
	        if (option.queueOpt.hasOwnProperty("isGlobal")) {
	            AnyChatSDKQueueHandler.instance.isGlobal = option.queueOpt.isGlobal;
	            info.isGlobal = option.queueOpt.isGlobal;
	        }
	        if (option.queueOpt.hasOwnProperty("isGlobalAgent")) {
	            AnyChatSDKQueueHandler.instance.isGlobalAgent = option.queueOpt.isGlobalAgent;
	            info.isGlobalAgent = option.queueOpt.isGlobalAgent;
	        }

	    }
	    if (typeof option.cameraOpt === "object") {
	        info.openNativeScreenCamera = option.cameraOpt.openNativeScreenCamera;
	    }



	    AnyChatSDKUserHandler.instance.callbackFunctionRegister(this, option);

	    AnyChatSDKVideoCallHandler.instance.callbackFunctionRegister(this, option);

	    AnyChatSDKQueueHandler.instance.callbackFunctionRegister(this, option);

	    this.anychatSDKInstance.init();
	    //会话保持
	    (typeof(option.onSessionKeep) === "function") && this.anychatSDKInstance.setCallBack("onSessionKeep", option.onSessionKeep, false);    

	    return this.anychatSDKInstance;
	};

	var AnyChatH5SDK = new AnyChatH5SDK();

	window.AnyChatH5SDK = AnyChatH5SDK;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	/*-----------------------------------------------------------
	 * AnyChat常量
	 * 函数说明:定义AnyChat SDK的常量
	 *
	 *
	 * ----------------------------------------------------------
	 */

	//构造函数
	function AnyChatSDKConstant() {

		
	}

	AnyChatSDKConstant.prototype = {
	    constructor: AnyChatSDKConstant,    	
		//链路连接状态枚举值
		ConnectStatus: {
		    'ERROR': -1,//链路出错
		    'INIT': 0,//初始值
			'INITIALIZED': 1,//已初始化	    
		    'OPEN': 2,//登录成功
		    'OFFLINE': 3,//链路断开
			'OPENING': 4//连接中
		},
		//出错类型定义
		ErrorType: {
			'CONNECT_ERROR': 1,  //连接出错
			'LOGIN_ERROR': 2     //登录出错		
		}
	}


	var instance = new AnyChatSDKConstant();

	exports.instance = instance;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/*-----------------------------------------------------------
	 * AnyChatSDKEventTarget
	 * 函数说明:用户回调函数存储器
	 * 
	 * 
	 * ----------------------------------------------------------
	 */
	//事件构造函数
	function AnyChatSDKEventTarget() {
	    // 事件处理程序数组集合
	    this.handlers = {};
	    this.doneHandlers = [];
	}

	//事件的原型对象
	AnyChatSDKEventTarget.prototype = {
	    // 设置原型构造函数链
	    constructor: AnyChatSDKEventTarget,

	    // 注册给定类型的事件处理程序，
	    addEvent: function(type, handler, isDoneEvent) {
	        // 判断事件处理数组是否有该类型事件
	        if (typeof this.handlers[type] == 'undefined') {
	            this.handlers[type] = [];
	            // 将处理事件push到事件处理数组里面
	            this.handlers[type].push(handler);

	        }else{
	            if(isDoneEvent){
	                this.handlers[type].push(handler);
	            }else{
	                this.handlers[type].length = 0;
	                this.handlers[type].push(handler);
	            }
	        }

	        if (isDoneEvent) {
	            this.doneHandlers.push(type);
	        }

	    },

	    // 触发一个事件
	    fireEvent: function(event) {
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
	    removeEvent: function(event) {
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
	    removeAll: function() {
	        this.handlers = {};
	        this.doneHandlers = [];
	    }
	};

	var instance = new AnyChatSDKEventTarget();
	exports.instance = instance;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------
	 * AnyChat用户处理器
	 * 函数说明:用户相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	var AnyChatSDKConstant = __webpack_require__(1);
	var AnyChatSDKAreaHandler = __webpack_require__(4);
	var CONSTANT = AnyChatSDKConstant.instance;

	//构造函数
	function AnyChatSDKUserHandler() {
	    this.atRoomUserList = []; //在房间内的用户列表	
	    this.userType = -1; //用户身份：1--客户  2--坐席
	    this.userId = -1; //用户int型userId，内部封装用
	    this.strUserId = "";
	    this.isSupportEx = true;
	    this.currentMsgTaskId = []; //存放当前执行的透明通道消息ID
	}

	AnyChatSDKUserHandler.prototype = {
	    constructor: AnyChatSDKUserHandler,

	    //用户登录
	    login: function(userLoginObj) {
	        var errorCode = -1;
	        if (!AnyChatH5SDK.anychatSDKInstance.isCluster) {
	            errorCode = BRAC_Login(userLoginObj.nickName, userLoginObj.password, 0);
	        } else {
	            errorCode = BRAC_LoginEx(userLoginObj.nickName, userLoginObj.userId, userLoginObj.strUserId, userLoginObj.appId, userLoginObj.timeStamp, userLoginObj.signData, "");
	        }
	        this.strUserId = userLoginObj.strUserId;
	        return errorCode;
	    },

	    //用户退出
	    logout: function(anychatSDKInstance) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var errorCode = BRAC_Logout();

	        if (errorCode == 0) {
	            _sdk.curConnectStatus == CONSTANT.ConnectStatus.INITIALIZED;
	            AnyChatSDKAreaHandler.instance.areaIdArray = [];
	            AnyChatSDKAreaHandler.instance.areaIdIndex = 0;
	        }
	        return errorCode;
	    },

	    //进房间
	    enterRoom: function(params) {
	        var roomPwd = "";
	        if (params.hasOwnProperty("password")) {
	            roomPwd = params.password;
	        }

	        var re = /^[1-9]+[0-9]*]*$/; //判断是否纯数字
	        if (re.test(params.roomId))
	            return BRAC_EnterRoom(parseInt(params.roomId), roomPwd, 0);
	        else
	            return BRAC_EnterRoomEx(params.roomId + "", roomPwd);
	    },

	    //获取房间中的用户列表
	    getRoomUsers: function() {
	        this.atRoomUserList = [];
	        var list = BRAC_GetOnlineUser();
	        list.push(this.userId);
	        var userList = list.map(getStrUserId);
	        for (var i = 0; i < userList.length; i++) {
	            this.atRoomUserList[i] = { intUserId: list[i], strUserId: userList[i] };
	        }
	        return userList;
	    },

	    //离开房间
	    leaveRoom: function(anychatSDKInstance) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var errorCode = BRAC_LeaveRoom(-1);
	        return errorCode;
	    },

	    //控制用户本地的视频设备
	    controlLocalVideo: function(anychatSDKInstance, controlInfoObj) {

	    },

	    //请求其他用户的视频设备
	    requestOtherUserVideo: function(anychatSDKInstance, controlInfoObj) {

	    },

	    //文字消息
	    sendMsg: function(opt) {
	        if (opt.hasOwnProperty("targetUsers")) {
	            if (opt.targetUsers.length == 0){
	                return BRAC_SendTextMessage(-1, 0, opt.msg);
	            }else{
	                var errorCode=0;
	                for (var i=0; i< opt.targetUsers.length;i++) {
	                    errorCode= BRAC_SendTextMessage(opt.targetUsers[i], 1, opt.msg);
	                }
	                return errorCode;
	            }
	                
	        } else {
	            return BRAC_SendTextMessage(-1, 0, opt.msg);
	        }
	    },

	    //透明通道
	    transBuffer: function(opt) {
	        if (opt.hasOwnProperty("targetUsers")) {
	            if (opt.targetUsers.length == 0) {
	                return 21; //参数错误
	            }
	            var errorCode = 0, that = this;
	            var timestamp = new Date().getTime();

	            for (var i = 0; i < opt.targetUsers.length; i++) {

	                (function (index, ts) {
	                    ts = ts + "" + index; //转成字符串, 时间戳+循环i, 保证唯一
	                    var msg = ts + "#" +  opt.msg;

	                    var timer = setTimeout(function() { clearTimer(ts) }, (opt.time ? opt.time : 10) * 1000);
	                    var msgTaskObj = {
	                        msgId: ts,
	                        targetId: opt.targetUsers[index],
	                        msgContent:  opt.msg,
	                        timer: timer
	                    };
	                    that.currentMsgTaskId.push(msgTaskObj);
	                    errorCode= BRAC_TransBuffer(opt.targetUsers[index], base64.encode(msg));
	                })(i, timestamp)
	              
	            }
	            return errorCode;
	        } else {
	            return BRAC_TransBuffer(-1, base64.encode(opt.msg));
	        }
	    },

	    //透明通道扩展
	    transBufferEx: function(opt) {
	        if (opt.hasOwnProperty("targetUsers")) {
	            if (opt.targetUsers.length == 0) {
	                return 21; //参数错误
	            }
	            var errorCode=0, that = this;
	            var timestamp = new Date().getTime();

	            for (var i = 0; i < opt.targetUsers.length; i++) {
	                (function (index, ts) {
	                    ts = ts + ""+ index; ////转成字符串, 时间戳+循环i, 保证唯一
	                    var msg = ts + "#" + opt.msg ;
	                    var timer = setTimeout(function() { clearTimer(ts) }, (opt.time ? opt.time : 10) * 1000);
	                    var msgTaskObj = {
	                        msgId: ts,
	                        targetId: opt.targetUsers[index],
	                        msgContent: opt.msg,
	                        timer: timer
	                    };
	                    that.currentMsgTaskId.push(msgTaskObj);
	                    errorCode= BRAC_TransBufferEx(opt.targetUsers[index], base64.encode(msg),opt.wParam || 0,opt.lParam || 0,opt.dwFlags ||0);
	                })(i, timestamp)
	               
	            }
	            return errorCode;
	        } else {
	            return BRAC_TransBufferEx(-1, base64.encode(opt.msg),opt.wParam || 0,opt.lParam || 0,opt.dwFlags ||0);
	        }
	    }
	};



	AnyChatSDKUserHandler.prototype.callbackFunctionRegister = function(AnyChatH5SDK, option) {
	    if (typeof(option.onDisConnect) === 'function') {
	        AnyChatH5SDK.anychatSDKInstance.setCallBack("onDisConnect", option.onDisConnect, false);
	    }

	    if (option.onUpdateUserInfo) {
	        AnyChatH5SDK.anychatSDKInstance.setCallBack("onUpdateUserInfo", option.onUpdateUserInfo, false);
	    }

	    if (option.onLogin) {
	        AnyChatH5SDK.anychatSDKInstance.setCallBack("onLogin", option.onLogin, false);
	    }

	    if (typeof option.bufferOpt === "object") {
	        typeof(option.bufferOpt.onReceiveBuffer) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onReceiveBuffer", option.bufferOpt.onReceiveBuffer, false);
	    }

	    if (typeof option.roomOpt === "object") {
	        typeof(option.roomOpt.onRoomUserInAndOut) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onRoomUserInAndOut", option.roomOpt.onRoomUserInAndOut, false);
	        typeof(option.roomOpt.onRoomUserChanged) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onRoomUserChanged", option.roomOpt.onRoomUserChanged, false);
	        typeof(option.roomOpt.onRoomUserMsgReceived) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onRoomUserMsgReceived", option.roomOpt.onRoomUserMsgReceived, false);
	    }
	};

	function Base64() {

	    // private property  
	    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	    // public method for encoding  
	    this.encode = function(input) {
	        var output = "";
	        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	        var i = 0;
	        input = _utf8_encode(input);
	        while (i < input.length) {
	            chr1 = input.charCodeAt(i++);
	            chr2 = input.charCodeAt(i++);
	            chr3 = input.charCodeAt(i++);
	            enc1 = chr1 >> 2;
	            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	            enc4 = chr3 & 63;
	            if (isNaN(chr2)) {
	                enc3 = enc4 = 64;
	            } else if (isNaN(chr3)) {
	                enc4 = 64;
	            }
	            output = output +
	                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
	                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
	        }
	        return output;
	    }

	    // public method for decoding  
	    this.decode = function(input) {
	        var output = "";
	        var chr1, chr2, chr3;
	        var enc1, enc2, enc3, enc4;
	        var i = 0;
	        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	        while (i < input.length) {
	            enc1 = _keyStr.indexOf(input.charAt(i++));
	            enc2 = _keyStr.indexOf(input.charAt(i++));
	            enc3 = _keyStr.indexOf(input.charAt(i++));
	            enc4 = _keyStr.indexOf(input.charAt(i++));
	            chr1 = (enc1 << 2) | (enc2 >> 4);
	            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	            chr3 = ((enc3 & 3) << 6) | enc4;
	            output = output + String.fromCharCode(chr1);
	            if (enc3 != 64) {
	                output = output + String.fromCharCode(chr2);
	            }
	            if (enc4 != 64) {
	                output = output + String.fromCharCode(chr3);
	            }
	        }
	        output = _utf8_decode(output);
	        return output;
	    }

	    // private method for UTF-8 encoding  
	    _utf8_encode = function(string) {
	        string = string.replace(/\r\n/g, "\n");
	        var utftext = "";
	        for (var n = 0; n < string.length; n++) {
	            var c = string.charCodeAt(n);
	            if (c < 128) {
	                utftext += String.fromCharCode(c);
	            } else if ((c > 127) && (c < 2048)) {
	                utftext += String.fromCharCode((c >> 6) | 192);
	                utftext += String.fromCharCode((c & 63) | 128);
	            } else {
	                utftext += String.fromCharCode((c >> 12) | 224);
	                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	                utftext += String.fromCharCode((c & 63) | 128);
	            }

	        }
	        return utftext;
	    }

	    // private method for UTF-8 decoding  
	    _utf8_decode = function(utftext) {
	        var string = "";
	        var i = 0;
	        var c = c1 = c2 = 0;
	        while (i < utftext.length) {
	            c = utftext.charCodeAt(i);
	            if (c < 128) {
	                string += String.fromCharCode(c);
	                i++;
	            } else if ((c > 191) && (c < 224)) {
	                c2 = utftext.charCodeAt(i + 1);
	                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	                i += 2;
	            } else {
	                c2 = utftext.charCodeAt(i + 1);
	                c3 = utftext.charCodeAt(i + 2);
	                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	                i += 3;
	            }
	        }
	        return string;
	    }
	}

	function getIntUserId(strUserId) {
	    return strUserId;
	}

	function getStrUserId(intUserId) {
	    return intUserId;
	}

	function clearTimer(id) {
	    for (var i = 0; i < instance.currentMsgTaskId.length; i++) {
	        if (instance.currentMsgTaskId[i].msgId == id) {
	            var content = instance.currentMsgTaskId[i].msgContent;
	            var targetId = instance.currentMsgTaskId[i].targetId;
	            var data = {
	                userId: targetId,
	                msg: content
	            };
	            AnyChatH5SDK.anychatSDKInstance.eventTarget.fireEvent({
	                type: "onTransBufferDone" + targetId,
	                result: {
	                    code: -1,
	                    msg: "发送失败"
	                },
	                data: data
	            });
	            instance.currentMsgTaskId.slice(i, 1);
	            break;
	        }
	    }
	}

	var instance = new AnyChatSDKUserHandler();
	var base64 = new Base64();
	exports.instance = instance;
	exports.Base64 = base64;
	exports.getStrUserId = getStrUserId;
	exports.getIntUserId = getIntUserId;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------
	 * AnyChat营业厅处理器
	 * 函数说明:AnyChat营业厅相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	var AnyChatSDKConstant = __webpack_require__(1);
	var AnyChatSDKErrorCode = __webpack_require__(5);
	var AnyChatSDKUserHandler = __webpack_require__(3);
	var AnyChatSDKQueueHandler = __webpack_require__(6);
	var CONSTANT = AnyChatSDKConstant.instance;

	// 自定义指令构造函数
	function AnyChatSDKAreaHandler() {
	    this.agentStatus = 0; //坐席状态：0--关闭  1--等待中  2--服务中  3--暂停服务  10--关闭
	    this.currentAgentID; //当前坐席ID
	    this.areaId; //当前营业厅ID

	    this.areaIdArray = [];
	    this.areaIdIndex = 0;
	}

	AnyChatSDKAreaHandler.prototype = {
	    constructor: AnyChatSDKAreaHandler,
	    //进入营业厅
	    inArea: function(anychatSDKInstance, opt) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var errorCode = enterArea({
	            areaId: opt.areaId
	        });
	        if (errorCode == 0) {
	            this.areaId = opt.areaId;
	        }
	        return errorCode;
	    },
	    //退出营业厅
	    outArea: function(anychatSDKInstance) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var errorCode = leaveArea({
	            areaId: this.areaId
	        });
	        if (errorCode == 0) {
	            this.areaId = "";
	        }
	        return errorCode;
	    },
	    getAreas: function() {
	        return getAreaData({
	            userId: AnyChatSDKUserHandler.instance.userId
	        });
	    },
	    agentServiceCtrl: function(anychatSDKInstance, opt) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var statusCode = 0;
	        switch (opt.ctrlCode) {
	            case 0:
	                statusCode = 1;
	                break;
	            case 1:
	                statusCode = 0;
	                break;
	            case 2:
	                statusCode = 3;
	                break;
	            case 3:
	                statusCode = 100105;
	                break;
	            case 4:
	                statusCode = 4;
	                break;
	        }
	        var errorCode = agentStatusCtrl({
	            userId: AnyChatSDKUserHandler.instance.userId,
	            ctrlCode: statusCode
	        });
	        var result = {
	            code: errorCode,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(errorCode)
	        };
	        _sdk.eventTarget.fireEvent({
	            type: "onServiceCtrlDone",
	            result: result
	        });
	        return errorCode;
	    },
	    getAgentStatus: function() {
	        var data = {};
	        data.serviceUserCount = getServiceUserCount({ userId: AnyChatSDKUserHandler.instance.userId });
	        data.serviceBeginTime = getServiceBeginTime({ userId: AnyChatSDKUserHandler.instance.userId });
	        data.serviceTotalTime = getServiceTotalTime({ userId: AnyChatSDKUserHandler.instance.userId });
	        return data;
	    },
	    getAgentCount: function(opt) {
	        return getAgentCount(opt);
	    },
	    getIdleAgentCount: function(opt) {
	        return getIdleAgentCount(opt);
	    },
	    getAreaQueueUserCount:function(opt){
	        return getAreaQueueUserCount(opt);
	    }
	};

	/*
	以下是营业厅的操作
	*/
	// 向服务器同步营业厅信息
	function getAreaData(params) {
	    var erroCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AREA, ANYCHAT_INVALID_OBJECT_ID, ANYCHAT_OBJECT_CTRL_SYNCDATA, params.userId, 0, 0, 0, "");
	    return erroCode;
	}

	// 进入营业厅
	function enterArea(params) {
	    var errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_AREA_CTRL_USERENTER, 0, 0, 0, 0, "");
	    return errorCode;
	}

	// 离开营业厅
	function leaveArea(params) {
	    var errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_AREA_CTRL_USERLEAVE, 0, 0, 0, 0, "");
	    return errorCode;
	}

	// 获取营业厅名称
	function getAreaName(params) {
	    var areaName = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_OBJECT_INFO_NAME);
	    return areaName;
	}

	// 获取营业厅描述
	function getAreaDescription(params) {
	    var areaDescription = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_OBJECT_INFO_DESCRIPTION);
	    return areaDescription;
	}


	/*
	以下是坐席操作
	*/
	// 坐席操作
	function agentStatusCtrl(params) {
	    var errorCode = 0;
	    if (AnyChatSDKQueueHandler.instance.isAutoMode == 1) {
	        if(params.ctrlCode == 100105)  {
	            BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_CTRL_FINISHSERVICE, params.ctrlCode, 0, 0, 0, "");
	            errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_CTRL_SERVICESTATUS, 0, 0, 0, 0, "");
	        } else {
	        errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_CTRL_SERVICESTATUS, params.ctrlCode, 0, 0, 0, "");
	        }
	        return errorCode;
	    } else {
	        if (params.ctrlCode == 1) {
	            errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_CTRL_SERVICEREQUEST, 0, 0, 0, 0, "");
	            return errorCode;
	        } else if (params.ctrlCode == 0) {
	            errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_CTRL_FINISHSERVICE, 0, 0, 0, 0, "");
	            return errorCode;
	        }
	    }
	}

	// 获取累计服务用户总数
	function getServiceUserCount(params) {
	    var serviceUserCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_INFO_SERVICETOTALNUM);
	    return serviceUserCount;
	}

	// 获取当前服务开始时间
	function getServiceBeginTime(params) {
	    var serviceBeginTime = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_INFO_SERVICEBEGINTIME);
	    return serviceBeginTime;
	}

	// 获取累计服务时长
	function getServiceTotalTime(params) {
	    var serviceTotalTime = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_INFO_SERVICETOTALTIME);
	    return serviceTotalTime;
	}

	// 获取当前服务状态
	function getAgentServiceStatus(params) {
	    var agentServiceStatus = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, params.userId, ANYCHAT_AGENT_INFO_SERVICESTATUS);
	    return agentServiceStatus;
	}


	/*
	以下是客户操作
	*/
	// 获取队列列表
	function getQueueList() {
	    var queueList = BRAC_ObjectGetIdList(ANYCHAT_OBJECT_TYPE_QUEUE);
	    return queueList;
	}

	//获取服务区域客服用户数
	function getAgentCount(params) {
	    return BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_AREA_INFO_AGENTCOUNT);
	}

	//获取服务区域空闲坐席数量
	function getIdleAgentCount(params) {
	    return BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_AREA_INFO_IDLEAGENTCOUNT);
	}

	//获取服务区域内排队的用户数
	function getAreaQueueUserCount(params) {
	    return BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, params.areaId, ANYCHAT_AREA_INFO_QUEUEUSERCOUNT);
	}

	var instance = new AnyChatSDKAreaHandler();

	exports.instance = instance;
	exports.getAreaName = getAreaName;
	exports.getAreaDescription = getAreaDescription;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	var errorObjList = [];
	var AC_ERROR_UNKNOW = { errorCode: -1, errorMsg: "未知错误" };

	var AC_ERROR_SUCCESS = { errorCode: 0, errorMsg: "成功" };

	var AC_ERROR_DB_ERROR = { errorCode: 1, errorMsg: "数据库错误" };
	var AC_ERROR_NOTINIT = { errorCode: 2, errorMsg: "系统没有初始化" };
	var AC_ERROR_NOTINRM = { errorCode: 3, errorMsg: "还未进入房间" };
	var AC_ERROR_MEMORYFAIL = { errorCode: 4, errorMsg: "not enough memory" };
	var AC_ERROR_EXCEPTION = { errorCode: 5, errorMsg: "出现异常" };
	var AC_ERROR_CANCEL = { errorCode: 6, errorMsg: "操作被取消" };
	var AC_ERROR_PROTOCOLFAIL = { errorCode: 7, errorMsg: "通信协议出错" };
	var AC_ERROR_SESSIONNOTEXIST = { errorCode: 8, errorMsg: "会话不存在" };
	var AC_ERROR_DATANOTEXIST = { errorCode: 9, errorMsg: "数据不存在" };
	var AC_ERROR_DATAEXIST = { errorCode: 10, errorMsg: "数据已经存在" };
	var AC_ERROR_INVALIDGUID = { errorCode: 11, errorMsg: "无效GUID" };
	var AC_ERROR_RESOURCERECOVER = { errorCode: 12, errorMsg: "资源被回收" };
	var AC_ERROR_RESOURCEUSED = { errorCode: 13, errorMsg: "资源被占用" };
	var AC_ERROR_JSONFAIL = { errorCode: 14, errorMsg: "Json解析出错" };
	var AC_ERROR_OBJECTDELETE = { errorCode: 15, errorMsg: "对象被删除" };
	var AC_ERROR_SESSIONEXIST = { errorCode: 16, errorMsg: "会话已存在" };
	var AC_ERROR_SESSIONNOTINIT = { errorCode: 17, errorMsg: "会话没有初始化" };

	var AC_ERROR_FUNCNOTALLOW = { errorCode: 20, errorMsg: "函数功能不允许" };
	var AC_ERROR_FUNCOPTERROR = { errorCode: 21, errorMsg: "function parameters error" };
	var AC_ERROR_DEVICEOPENFAIL = { errorCode: 22, errorMsg: "device open failed or device no install" };
	var AC_ERROR_NOENOUGHRESOURCE = { errorCode: 23, errorMsg: "没有足够的资源" };
	var AC_ERROR_PIXFMTNOTSUPPORT = { errorCode: 24, errorMsg: "指定的格式不能被显示设备所支持" };
	var AC_ERROR_NOTMULTICASTADDR = { errorCode: 25, errorMsg: "指定的IP地址不是有效的组播地址" };
	var AC_ERROR_MULTIRUNERROR = { errorCode: 26, errorMsg: "不支持多实例运行" };
	var AC_ERROR_FILETRUSTFAILED = { errorCode: 27, errorMsg: "文件签名验证失败" };
	var AC_ERROR_CERTVERIFYFAILED = { errorCode: 28, errorMsg: "授权验证失败" };
	var AC_ERROR_CERTUSERFAILED = { errorCode: 29, errorMsg: "授权证书用户数验证失败" };
	var AC_ERROR_MASTERISSLAVE = { errorCode: 30, errorMsg: "所指定的主服务器是热备服务器，不支持再次热备" };
	var AC_ERROR_MASTERNOTCREDIT = { errorCode: 31, errorMsg: "主服务器没有经过授权认证，不支持热备" };
	var AC_ERROR_VERSIONNOTMATCH = { errorCode: 32, errorMsg: "版本不匹配" };
	var AC_ERROR_CERTFAILSECOND = { errorCode: 33, errorMsg: "第二次授权验证失败" };
	var AC_ERROR_SERVERVERIFYFAIL = { errorCode: 34, errorMsg: "服务器安全验证失败" };
	var AC_ERROR_CLIENTCERTFAILED = { errorCode: 35, errorMsg: "客户端授权验证失败" };
	var AC_ERROR_CERTSUMFAILED = { errorCode: 36, errorMsg: "授权功能校验失败" };
	var AC_ERROR_REMOTECTRL = { errorCode: 37, errorMsg: "远程控制" };
	var AC_ERROR_DUPLICATESERVICEID = { errorCode: 38, errorMsg: "ServiceGuid重复" };
	var AC_ERROR_DIRENTERROR = { errorCode: 39, errorMsg: "目录错误" };
	var AC_ERROR_EXTRACTFILEERROR = { errorCode: 40, errorMsg: "解压文件失败" };
	var AC_ERROR_STARTPROCESSFAILED = { errorCode: 41, errorMsg: "启动进程失败" };
	var AC_ERROR_SERVICEISRUNNING = { errorCode: 42, errorMsg: "服务已启动" };
	var AC_ERROR_DISKSPACELIMITED = { errorCode: 43, errorMsg: "磁盘空间不足" };
	var AC_ERROR_REQUESTFAILED = { errorCode: 44, errorMsg: "业务服务发送请求失败" };
	var AC_ERROR_INVALIDMACHINE = { errorCode: 45, errorMsg: "无效的物理机对象" };
	var AC_ERROR_GETCERTINFOFAILED = { errorCode: 46, errorMsg: "获取授权信息失败" };
	var AC_ERROR_CLUSTERNOTMATCH = { errorCode: 47, errorMsg: "集群属性不匹配" };
	var AC_ERROR_NONECLUSTERID = { errorCode: 48, errorMsg: "集群ID为空" };
	var AC_ERROR_CREATESERVICE_MORE = { errorCode: 49, errorMsg: "同台物理机创建多个相同服务，一类服务暂时不允许创建多个" };
	var AC_ERROR_COPYFILEFAILED = { errorCode: 50, errorMsg: "拷贝文件失败" };
	var AC_ERROR_CLOUDNATIVEDBFAIL = { errorCode: 51, errorMsg: "云平台内部数据库出错" };
	var AC_ERROR_CLOUDOSSUPLOADFAIL = { errorCode: 52, errorMsg: "云平台OSS文件上传失败" };
	var AC_ERROR_SERVICEBINDCHANGE = { errorCode: 53, errorMsg: "服务绑定关系变化" };
	var AC_ERROR_SERVICENOTBIND = { errorCode: 54, errorMsg: "服务没有被绑定" };
	var AC_ERROR_SERVICEBINDFAIL = { errorCode: 55, errorMsg: "服务绑定失败" };
	var AC_ERROR_PIPELINEUSERFAIL = { errorCode: 56, errorMsg: "PipeLine通信用户ID出错" };
	var AC_ERROR_PIPELINESESSFAIL = { errorCode: 57, errorMsg: "PipeLine通信会话出错" };
	var AC_ERROR_SERVICECLOSED = { errorCode: 58, errorMsg: "服务被关闭" };
	var AC_ERROR_FILEENCRYPTED = { errorCode: 59, errorMsg: "文件已被加密过" };
	var AC_ERROR_FILEHEADINVAILD = { errorCode: 60, errorMsg: "解密无效（文件校验不通过）" };
	var AC_ERROR_FILEDECODE_PASSERR = { errorCode: 61, errorMsg: "解密失败，可能密码错误" };

	//连接部分
	var AC_ERROR_CONNECT_TIMEOUT = { errorCode: 100, errorMsg: "连接服务器超时" };
	var AC_ERROR_CONNECT_ABORT = { errorCode: 101, errorMsg: "与服务器的连接中断" };
	var AC_ERROR_CONNECT_AUTHFAIL = { errorCode: 102, errorMsg: "连接服务器认证失败（服务器设置了认证密码）" };
	var AC_ERROR_CONNECT_DNSERROR = { errorCode: 103, errorMsg: "域名解析失败" };
	var AC_ERROR_CONNECT_OVERFLOW = { errorCode: 104, errorMsg: "超过授权用户数" };
	var AC_ERROR_CONNECT_FUNCLIMIT = { errorCode: 105, errorMsg: "服务器功能受限制（演示模式）" };
	var AC_ERROR_CONNECT_INTRANET = { errorCode: 106, errorMsg: "只能在内网使用" };
	var AC_ERROR_CONNECT_OLDVERSION = { errorCode: 107, errorMsg: "版本太旧，不允许连接" };
	var AC_ERROR_CONNECT_SOCKETERR = { errorCode: 108, errorMsg: "Socket出错" };
	var AC_ERROR_CONNECT_DEVICELIMIT = { errorCode: 109, errorMsg: "设备连接限制（没有授权）" };
	var AC_ERROR_CONNECT_PAUSED = { errorCode: 110, errorMsg: "服务已被暂停" };
	var AC_ERROR_CONNECT_HOTSERVER = { errorCode: 111, errorMsg: "热备服务器不支持连接（主服务在启动状态）" };
	var AC_ERROR_CONNECT_ERRCERUSER = { errorCode: 112, errorMsg: "授权用户数校验出错，可能内存被修改" };
	var AC_ERROR_CONNECT_IPFORBID = { errorCode: 113, errorMsg: "IP被禁止连接" };
	var AC_ERROR_CONNECT_TYPEWRONG = { errorCode: 114, errorMsg: "连接类型错误，服务器不支持当前类型的连接" };
	var AC_ERROR_CONNECT_ERRORIP = { errorCode: 115, errorMsg: "服务器IP地址不正确" };
	var AC_ERROR_CONNECT_SELFCLOSE = { errorCode: 116, errorMsg: "连接被主动关闭" };
	var AC_ERROR_CONNECT_NOSVRLIST = { errorCode: 117, errorMsg: "没有获取到服务器列表" };
	var AC_ERROR_CONNECT_LBTIMEOUT = { errorCode: 118, errorMsg: "连接负载均衡服务器超时" };
	var AC_ERROR_CONNECT_NOTWORK = { errorCode: 119, errorMsg: "服务器不在工作状态" };
	var AC_ERROR_CONNECT_OFFLINE = { errorCode: 120, errorMsg: "服务器不在线" };
	var AC_ERROR_CONNECT_NETLIMITED = { errorCode: 121, errorMsg: "网络带宽受限" };
	var AC_ERROR_CONNECT_LOWTRAFFIC = { errorCode: 122, errorMsg: "网络流量不足" };
	var AC_ERROR_CONNECT_IPV6FAIL = { errorCode: 123, errorMsg: "不支持IPv6 Only网络" };
	var AC_ERROR_CONNECT_NOMASTER = { errorCode: 124, errorMsg: "没有Master服务器在线" };
	var AC_ERROR_CONNECT_NOSTATUS = { errorCode: 125, errorMsg: "没有上报工作状态" };

	//登录部分
	var AC_ERROR_CERTIFY_FAIL = { errorCode: 200, errorMsg: "认证失败，用户名或密码有误" };
	var AC_ERROR_ALREADY_LOGIN = { errorCode: 201, errorMsg: "该用户已登录" };
	var AC_ERROR_ACCOUNT_LOCK = { errorCode: 202, errorMsg: "帐户已被暂时锁定" };
	var AC_ERROR_IPADDR_LOCK = { errorCode: 203, errorMsg: "IP地址已被暂时锁定" };
	var AC_ERROR_VISITOR_DENY = { errorCode: 204, errorMsg: "游客登录被禁止（登录时没有输入密码）" };
	var AC_ERROR_INVALID_USERID = { errorCode: 205, errorMsg: "无效的用户ID（用户不存在）" };
	var AC_ERROR_SERVERSDK_FAIL = { errorCode: 206, errorMsg: "与业务服务器连接失败，认证功能失效" };
	var AC_ERROR_SERVERSDK_TIMEOUT = { errorCode: 207, errorMsg: "业务服务器执行任务超时" };
	var AC_ERROR_NOTLOGIN = { errorCode: 208, errorMsg: "没有登录" };
	var AC_ERROR_LOGIN_NEWLOGIN = { errorCode: 209, errorMsg: "该用户在其它计算机上登录" };
	var AC_ERROR_LOGIN_EMPTYNAME = { errorCode: 210, errorMsg: "用户名为空" };
	var AC_ERROR_KICKOUT = { errorCode: 211, errorMsg: "被服务器踢掉" };
	var AC_ERROR_SERVER_RESTART = { errorCode: 212, errorMsg: "业务服务器重启" };
	var AC_ERROR_FORBIDDEN = { errorCode: 213, errorMsg: "操作被禁止，没有权限" };
	var AC_ERROR_SIGSTREMPTY = { errorCode: 214, errorMsg: "签名信息为空，禁止登录" };
	var AC_ERROR_SIGVERIFYFAIL = { errorCode: 215, errorMsg: "签名验证失败" };
	var AC_ERROR_SIGPUBLICKEYEMPTY = { errorCode: 216, errorMsg: "签名验证公钥为空" };
	var AC_ERROR_SIGPRIVATEKEYEMPTY = { errorCode: 217, errorMsg: "签名私钥为空" };
	var AC_ERROR_SIGPARAMEMPTY = { errorCode: 218, errorMsg: "签名参数为空" };
	var AC_ERROR_SIGPARAMFAIL = { errorCode: 219, errorMsg: "签名参数出错" };
	var AC_ERROR_SIGTIMEFAILURE = { errorCode: 220, errorMsg: "签名时间失效" };
	var AC_ERROR_APPNOTACTIVE = { errorCode: 221, errorMsg: "应用没有被激活" };
	var AC_ERROR_APPPAUSED = { errorCode: 222, errorMsg: "应用被用户暂停" };
	var AC_ERROR_APPLOCKED = { errorCode: 223, errorMsg: "应用被用户锁定" };
	var AC_ERROR_APPEXPIRED = { errorCode: 224, errorMsg: "应用已过期" };
	var AC_ERROR_APPUNKNOWSTATUS = { errorCode: 225, errorMsg: "应用未知状态" };
	var AC_ERROR_SIGALREADYUSED = { errorCode: 226, errorMsg: "签名已经被使用" };
	var AC_ERROR_USERROLE_FAIL = { errorCode: 227, errorMsg: "获取用户角色失败" };
	var AC_ERROR_INVALID_AGENT = { errorCode: 228, errorMsg: "坐席无效(不存在)" };

	//进入房间
	var AC_ERROR_RM_LOCK = { errorCode: 300, errorMsg: "房间已被锁住，禁止进入" };
	var AC_ERROR_RM_PASSERR = { errorCode: 301, errorMsg: "房间密码错误，禁止进入" };
	var AC_ERROR_RM_FULLUSER = { errorCode: 302, errorMsg: "房间已满员，不能进入" };
	var AC_ERROR_RM_INVALID = { errorCode: 303, errorMsg: "房间不存在" };
	var AC_ERROR_RM_EXPIRE = { errorCode: 304, errorMsg: "房间服务时间已到期" };
	var AC_ERROR_RM_REJECT = { errorCode: 305, errorMsg: "房主拒绝进入" };
	var AC_ERROR_RM_OWNERBEOUT = { errorCode: 306, errorMsg: "房主不在，不能进入房间" };
	var AC_ERROR_RM_ENTERFAIL = { errorCode: 307, errorMsg: "不能进入房间" };
	var AC_ERROR_RM_ALREADIN = { errorCode: 308, errorMsg: "已经在房间里面了，本次进入房间请求忽略" };
	var AC_ERROR_RM_NOTIN = { errorCode: 309, errorMsg: "不在房间中，对房间相关的API操作失败" };

	//数据流
	var AC_ERROR_STREAM_OLDPACK = { errorCode: 350, errorMsg: "过期数据包" };
	var AC_ERROR_STREAM_SAMEPAK = { errorCode: 351, errorMsg: "相同的数据包" };
	var AC_ERROR_STREAM_PACKLOSS = { errorCode: 352, errorMsg: "数据包丢失" };
	var AC_ERROR_STREAM_MISTAKE = { errorCode: 353, errorMsg: "数据包出错，帧序号存在误差" };
	var AC_ERROR_STREAM_LACKBUFFER = { errorCode: 354, errorMsg: "媒体流缓冲时间不足" };

	//私聊
	var AC_ERROR_RM_PRINULL = { errorCode: 401, errorMsg: "用户已经离开房间" };
	var AC_ERROR_RM_REJECTPRI = { errorCode: 402, errorMsg: "用户拒绝了私聊邀请" };
	var AC_ERROR_RM_PRIDENY = { errorCode: 403, errorMsg: "不允许与该用户私聊，或是用户禁止私聊" };

	var AC_ERROR_RM_PRIREQIDERR = { errorCode: 420, errorMsg: "私聊请求ID号错误，或请求不存在" };
	var AC_ERROR_RM_PRIALRCHAT = { errorCode: 421, errorMsg: "已经在私聊列表中" };

	var AC_ERROR_RM_PRITIMEOUT = { errorCode: 431, errorMsg: "私聊请求超时" };
	var AC_ERROR_RM_PRICHATBUSY = { errorCode: 432, errorMsg: "对方正在私聊中，繁忙状态" };
	var AC_ERROR_RM_PRIUSERCLOSE = { errorCode: 433, errorMsg: "对方用户关闭私聊" };
	var AC_ERROR_RM_PRISELFCLOSE = { errorCode: 434, errorMsg: "用户自己关闭私聊" };
	var AC_ERROR_RM_PRIREQCANCEL = { errorCode: 435, errorMsg: "私聊请求被取消" };

	//视频呼叫
	var AC_ERROR_VIDEOCALL_INCHAT = { errorCode: 440, errorMsg: "正在通话中" };

	//Mic控制权
	var AC_ERROR_MICLOSE_TIMEOUT = { errorCode: 500, errorMsg: "说话时间太长，请休息一下" };
	var AC_ERROR_MICLOSE_HIGHUSER = { errorCode: 501, errorMsg: "有高级别用户需要发言，请休息一下" };


	//集群总线
	var AC_ERROR_COMMBUS_SELFMASTER = { errorCode: 610, errorMsg: "本地总线为Master状态" };
	var AC_ERROR_COMMBUS_OTHERMASTER = { errorCode: 611, errorMsg: "有其它总线存在" };
	var AC_ERROR_COMMBUS_LOWPRIORITY = { errorCode: 612, errorMsg: "优先级不够" };

	//传输部分
	var AC_ERROR_TRANSBUF_CREATEFAIL = { errorCode: 700, errorMsg: "创建任务失败" };
	var AC_ERROR_TRANSBUF_NOTASK = { errorCode: 701, errorMsg: "没有该任务，或是任务已完成" };

	var AC_ERROR_TRANSFILE_OPENFAIL = { errorCode: 710, errorMsg: "打开文件出错" };
	var AC_ERROR_TRANSFILE_ZEROLEN = { errorCode: 711, errorMsg: "文件长度为0" };
	var AC_ERROR_TRANSFILE_TLARGE = { errorCode: 712, errorMsg: "文件长度太大" };
	var AC_ERROR_TRANSFILE_READFAIL = { errorCode: 713, errorMsg: "读文件出错" };
	var AC_ERROR_TRANSFILE_DOWNLOADING = { errorCode: 714, errorMsg: "文件正在下载中" };
	var AC_ERROR_TRANSFILE_FAILED = { errorCode: 715, errorMsg: "文件下载失败" };
	var AC_ERROR_TRANSFILE_NOTASK = { errorCode: 716, errorMsg: "没有该任务，或是任务已完成" };

	//录像部分				
	var AC_ERROR_RECORD_NOTASK = { errorCode: 720, errorMsg: "没有录像任务" };
	var AC_ERROR_RECORD_CREATEFAIL = { errorCode: 721, errorMsg: "创建录像任务失败" };
	var AC_ERROR_RECORD_WAITINFO = { errorCode: 722, errorMsg: "等待用户相关信息，暂时不能录像" };

	//队列部分			
	var AC_ERROR_QUEUE_INVALID = { errorCode: 750, errorMsg: "无效的队列ID" };
	var AC_ERROR_QUEUE_PREPARESERVICE = { errorCode: 751, errorMsg: "准备接受服务，离开队列" };
	var AC_ERROR_QUEUE_TIMEOUT = { errorCode: 752, errorMsg: "排队超时，离开队列" };

	//SDK警告
	var AC_ERROR_WARNING_UDPFAIL = { errorCode: 780, errorMsg: "与服务器的UDP通信异常，流媒体服务将不能正常工作" };
	var AC_ERROR_WARNING_MISCUTILFAIL = { errorCode: 781, errorMsg: "SDK加载brMiscUtil.dll动态库失败，部分功能将失效" };
	var AC_ERROR_WARNING_MEDIAUTILFAIL = { errorCode: 782, errorMsg: "SDK加载brMediaUtil.dll动态库失败，部分功能将失效" };
	var AC_ERROR_WARNING_MEDIACOREFAIL = { errorCode: 783, errorMsg: "SDK加载brMediaCore.dll动态库失败，部分功能将失效" };
	var AC_ERROR_WARNING_MEDIASHOWFAIL = { errorCode: 784, errorMsg: "SDK加载brMediaShow.dll动态库失败，部分功能将失效" };

	//video device error code define
	var AC_ERROR_VIDEO_OPENFAIL = { errorCode: 10001, errorMsg: "Open video device fail" };
	var AC_ERROR_VIDEO_UNKNOWFMT = { errorCode: 10002, errorMsg: "Unknow output video pix format" };
	var AC_ERROR_VIDEO_VIDIOC_G_FMT = { errorCode: 10003, errorMsg: "Driver Not supported VIDIOC_G_FMT" };
	var AC_ERROR_VIDEO_VIDIOC_S_FMT = { errorCode: 10004, errorMsg: "Driver Not supported VIDIOC_S_FMT" };
	var AC_ERROR_VIDEO_VIDIOC_G_PARM = { errorCode: 10005, errorMsg: "Driver Not supported VIDIOC_G_PARM" };
	var AC_ERROR_VIDEO_VIDIOC_S_PARM = { errorCode: 10006, errorMsg: "Driver Not supported VIDIOC_S_PARM" };
	var AC_ERROR_VIDEO_VIDIOC_QUERYCAP = { errorCode: 10007, errorMsg: "Driver Not supported VIDIOC_QUERYCAP" };
	var AC_ERROR_VIDEO_V4L2_CAP_VIDEO = { errorCode: 10008, errorMsg: "This is not a capture video device" };
	var AC_ERROR_VIDEO_PREP_CAPBUFFER_FALL = { errorCode: 10009, errorMsg: "For acquisition error" };
	var AC_ERROR_VIDEO_VIDIOC_REQBUFS = { errorCode: 10010, errorMsg: "Device Not supported for mmap and usermap mode" };
	var AC_ERROR_VIDEO_VIDIOC_QUERYBUF = { errorCode: 10011, errorMsg: "get physaddr to block fail" };
	var AC_ERROR_VIDEO_MAP_FAILED = { errorCode: 10012, errorMsg: "physaddr map to viraddr fail" };
	var AC_ERROR_VIDEO_VIDIOC_QBUF = { errorCode: 10013, errorMsg: "QBUF fail" };
	var AC_ERROR_VIDEO_PREPBUF = { errorCode: 10013, errorMsg: "video prepbuff fail" };
	var AC_ERROR_VIDEO_GETVIDEO_FAIL = { errorCode: 10014, errorMsg: "get video fail" };
	var AC_ERROR_VIDEO_VIDIOC_DQBUF = { errorCode: 10015, errorMsg: "QBUF fail" };
	var AC_ERROR_VIDEO_VIDIOC_STREAMON = { errorCode: 10016, errorMsg: "VIDIOC_STREAMON fail" };
	var AC_ERROR_VIDEO_VIDIOC_STREAMOFF = { errorCode: 10017, errorMsg: "VIDIOC_STREAMOFF fail" };
	var AC_ERROR_VIDEO_CAMERA_EBUSY = { errorCode: 10018, errorMsg: "May be camera is used by other progress now" };
	var AC_ERROR_VIDEO_UNSUPPORTMODE = { errorCode: 10019, errorMsg: "unsupport video capture mode" };
	var AC_ERROR_VIDEO_CAMERA_EINVAL = { errorCode: 10020, errorMsg: "the requested buffer type not supported, or VIDIOC_TRY_FMT was called and is not supported with this buffer type." };

	//Audio device error code define
	var AC_ERROR_AUDIO_OPENFAIL = { errorCode: 10500, errorMsg: "Open Audio device fail" };
	var AC_ERROR_AUDIO_ALLOCHWPARAMS = { errorCode: 10501, errorMsg: "alloc hwparams fail" };
	var AC_ERROR_AUDIO_INTERLEAVED = { errorCode: 10502, errorMsg: "set interleaved mode fail" };
	var AC_ERROR_AUDIO_FORMAT = { errorCode: 10503, errorMsg: "set wBitsPerSample  fail" };
	var AC_ERROR_AUDIO_SAMPLESPERSEC = { errorCode: 10504, errorMsg: "set SamplesPerSec   fail" };
	var AC_ERROR_AUDIO_CHANNELS = { errorCode: 10505, errorMsg: "set channels fail" };
	var AC_ERROR_AUDIO_PERIODS = { errorCode: 10506, errorMsg: "set periods  fail" };
	var AC_ERROR_AUDIO_BUFFERSIZE = { errorCode: 10507, errorMsg: "set buffer size fail" };
	var AC_ERROR_AUDIO_PARAMS = { errorCode: 10508, errorMsg: "function :snd_pcm_hw_params fail" };
	var AC_ERROR_AUDIO_BUFFERTIME = { errorCode: 10509, errorMsg: "set rebuffer time fail" };
	var AC_ERROR_AUDIO_BUFFERFRAME = { errorCode: 10510, errorMsg: "get rebuffer frames fail" };
	var AC_ERROR_AUDIO_PERIODTIME = { errorCode: 10511, errorMsg: "get period time fail" };
	var AC_ERROR_AUDIO_PERIODFRAME = { errorCode: 10512, errorMsg: "get period time fail" };
	var AC_ERROR_AUDIO_ALLOCSWPARAMS = { errorCode: 10513, errorMsg: "alloc swparams fail" };
	var AC_ERROR_AUDIO_START_THRESHOID = { errorCode: 10514, errorMsg: "set start threshoid fail" };
	var AC_ERROR_AUDIO_START_AVAIL_MIN = { errorCode: 10515, errorMsg: "set start avail min fail" };
	var AC_ERROR_AUDIO_PCMPREPARE = { errorCode: 10516, errorMsg: "function snd_pcm_prepare fail" };
	var AC_ERROR_AUDIO_READFAIL = { errorCode: 10517, errorMsg: "function read fail" };
	var AC_ERROR_AUDIO_CAPMODE = { errorCode: 10518, errorMsg: "音频capmode出错" };


	var AC_ERROR_PLAY_INVALIDSTREAM = { errorCode: 20000, errorMsg: "无效的流" };

	var AC_ERROR_STREAM_SESSIONFAILED = { errorCode: 30000, errorMsg: "创建会话失败" };

	//插件出错代码
	var GV_ERR_PLUGINNOINSTALL = { errorCode: 1010000, errorMsg: "插件没有安装" };
	var GV_ERR_PLUGINOLDVERSION = { errorCode: 1010001, errorMsg: "插件版本太低" };

	//视频呼叫
	var AC_ERROR_VIDEOCALL_CANCEL = { errorCode: 100101, errorMsg: "源用户主动放弃会话" };
	var AC_ERROR_VIDEOCALL_OFFLINE = { errorCode: 100102, errorMsg: "目标用户不在线" };
	var AC_ERROR_VIDEOCALL_BUSY = { errorCode: 100103, errorMsg: "目标用户忙" };
	var AC_ERROR_VIDEOCALL_REJECT = { errorCode: 100104, errorMsg: "目标用户拒绝会话" };
	var AC_ERROR_VIDEOCALL_TIMEOUT = { errorCode: 100105, errorMsg: "会话请求超时" };
	var AC_ERROR_VIDEOCALL_DISCONNECT = { errorCode: 100106, errorMsg: "网络断线" };
	var AC_ERROR_VIDEOCALL_NOTINCALL = { errorCode: 100107, errorMsg: "用户不在呼叫状态" };

	//业务对象
	var AC_ERROR_OBJECT_EXISTAREA = { errorCode: 100201, errorMsg: "已经进入一个服务区域" };
	var AC_ERROR_OBJECT_EXISTQUEUE = { errorCode: 100202, errorMsg: "已经进入一个服务队列" };


	//应用ID
	var AC_ERROR_APPID_DEFAULTNOTSUPPORT = { errorCode: 100300, errorMsg: "默认的应用ID（空）不被支持" };
	var AC_ERROR_APPID_SIGNEED = { errorCode: 100301, errorMsg: "应用登录需要签名" };
	var AC_ERROR_APPID_SIGFAILED = { errorCode: 100302, errorMsg: "应用签名校验失败" };
	var AC_ERROR_APPID_NOTEXIST = { errorCode: 100303, errorMsg: "应用ID不存在" };
	var AC_ERROR_APPID_SYSLOCK = { errorCode: 100304, errorMsg: "应用ID被系统锁定" };
	var AC_ERROR_APPID_NOTMATCH = { errorCode: 100305, errorMsg: "应用ID与当前服务不匹配" };
	var AC_ERROR_APPID_NOTCLOUDSERVER = { errorCode: 100306, errorMsg: "连接的服务器不是云平台地址" };
	var AC_ERROR_APPID_CHARGEMACHINELACK = { errorCode: 100307, errorMsg: "应用所对应的计费服务器不足" };
	var AC_ERROR_APPID_CHARGEMODECHANGE = { errorCode: 100308, errorMsg: "应用计费模式改变" };

	//创建用户
	var AC_ERROR_USERCFG_PASSWDLEN_SMALL = { errorCode: 100400, errorMsg: "用户密码长度过短" };
	var AC_ERROR_USERCFG_USERNAME_SAME = { errorCode: 100401, errorMsg: "用户名重名" };
	var AC_ERROR_USERCFG_ACCESSLIMIT = { errorCode: 100402, errorMsg: "权限受限" };
	var AC_ERROR_USERCFG_USERNAME_LIMIT = { errorCode: 100403, errorMsg: "不允许创建该用户名" };

	//升级服务过程
	var AC_ERROR_LIVEUPDATE_BEGIN = { errorCode: 100500, errorMsg: "升级服务开始" };
	var AC_ERROR_LIVEUPDATE_STOPING = { errorCode: 100501, errorMsg: "升级服务，正在停止当前服务..." };
	var AC_ERROR_LIVEUPDATE_BACKUPING = { errorCode: 100502, errorMsg: "升级服务，正在备份当前服务..." };
	var AC_ERROR_LIVEUPDATE_DELETEING = { errorCode: 100503, errorMsg: "升级服务，正在删除当前服务..." };
	var AC_ERROR_LIVEUPDATE_COPYING = { errorCode: 100504, errorMsg: "升级服务，正在拷贝新服务..." };
	var AC_ERROR_LIVEUPDATE_STARTING = { errorCode: 100505, errorMsg: "升级服务，正在启动新服务..." };
	var AC_ERROR_LIVEUPDATE_RECOVERING = { errorCode: 100506, errorMsg: "升级服务，正在恢复老版本..." };
	var AC_ERROR_LIVEUPDATE_ISTAGVER = { errorCode: 100507, errorMsg: "升级服务，已经是目标版本" };
	var AC_ERROR_LIVEUPDATE_SERVICENEEDSTOP = { errorCode: 100508, errorMsg: "升级服务，当前服务需要停止，才能执行升级操作" };
	var AC_ERROR_LIVEUPDATE_BACKUPFAIL = { errorCode: 100509, errorMsg: "升级服务，备份失败" };
	var AC_ERROR_LIVEUPDATE_DELETEFAIL = { errorCode: 100510, errorMsg: "升级服务，删除失败" };
	var AC_ERROR_LIVEUPDATE_COPYFAIL = { errorCode: 100511, errorMsg: "升级服务，拷贝失败" };
	var AC_ERROR_LIVEUPDATE_RECOVERYFAIL = { errorCode: 100512, errorMsg: "升级服务，恢复老版本失败" };
	var AC_ERROR_LIVEUPDATE_BRIDGENOTREGISTER = { errorCode: 100513, errorMsg: "升级服务，通讯桥未注册" };
	var AC_ERROR_LIVEUPDATE_WRITECONFIGFILEFAILED = { errorCode: 100514, errorMsg: "升级服务，写入配置文件失败" };
	var AC_ERROR_LIVEUPDATE_CANTGETBACKUPDIR = { errorCode: 100515, errorMsg: "升级服务，获取备份文件夹失败" };
	var AC_ERROR_LIVEUPDATE_FINISH = { errorCode: 100516, errorMsg: "升级服务结束" };
	var AC_ERROR_LIVEUPDATE_UNABLETOGETMAINTAINIFO = { errorCode: 100517, errorMsg: "无法获取维护信息" };
	var AC_ERROR_LIVEUPDATE_NOTRENAMEDIR = { errorCode: 100518, errorMsg: "不能重命名文件夹" };

	//停止进程过程                             
	var AC_ERROR_STOPPROCESS_TIMEOUT = { errorCode: 100600, errorMsg: "停止进程，超时" };
	var AC_ERROR_STOPPROCESS_FAIL = { errorCode: 100601, errorMsg: "停止进程，失败(被回复失败)" };
	var AC_ERROR_STOPPROCESS_FORCEFAIL = { errorCode: 100602, errorMsg: "停止进程，强行杀死失败" };

	//启动进程                                 
	var AC_ERROR_STARTPROCESS_TIMEOUT = { errorCode: 100603, errorMsg: "启动进程,规定时间内没有收到通讯桥通知" };

	var AC_ERROR_SERVICE_CONTROLLED = { errorCode: 100604, errorMsg: "service 正在被控制中(e.g 正在执行升级任务的时候，还收到了其他控制命令)" };
	var AC_ERROR_SERVICE_EXISTELSEVER = { errorCode: 100605, errorMsg: "在启动或解压之前，发现除目标之外还存在其他版本" };
	var AC_ERROR_SERVICE_NOTSUPPORT = { errorCode: 100606, errorMsg: "不支持此操作（e.g 对PMServer下达挂起命令等 ）" };
	var AC_ERROR_NONEXISTENCE_THE_VERSION = { errorCode: 100607, errorMsg: "不存在该版本的升级包" };
	var AC_ERROR_NONEXISTENCE_THE_SERVICE = { errorCode: 100608, errorMsg: "升级包中不存在该服务" };
	var AC_ERROR_ILLEGAL_EXTRA_CONFIG = { errorCode: 100609, errorMsg: "扩展的配置参数非法（e.g LUServer 的 serviceBaseInfo 的扩展参数解析错误）" };
	var AC_ERROR_MOVETEMPFILE_FAIL = { errorCode: 100610, errorMsg: "移动临时文件到升级目录时失败" };
	var AC_ERROR_INCOMPATIBLE_CURRENT_PLATFORM = { errorCode: 100611, errorMsg: "不兼容当前OS平台" };
	var AC_ERROR_GETRT_CONNECT_FAIL = { errorCode: 100612, errorMsg: "获取 rtserverconnect 失败" };

	//业务服务器错误代码                       
	var AC_ERROR_BUSINESS_PARAM_INVALID = { errorCode: 100701, errorMsg: "无效参数" };
	var AC_ERROR_BUSINESS_APPID_NOTEXIST = { errorCode: 100702, errorMsg: "应用ID不存在" };
	var AC_ERROR_BUSINESS_BODY_INVALID = { errorCode: 100703, errorMsg: "Body无效" };
	var AC_ERROR_BUSINESS_SIGVERIFYFAIL = { errorCode: 100704, errorMsg: "签名验证失败" };
	var AC_ERROR_BUSINESS_SIGTIMEINVALID = { errorCode: 100705, errorMsg: "签名时间戳无效" };
	var AC_ERROR_BUSINESS_MEMORYFAIL = { errorCode: 100706, errorMsg: "not enough memory" };
	var AC_ERROR_BUSINESS_EXCEPTION = { errorCode: 100707, errorMsg: "出现异常" };
	var AC_ERROR_BUSINESS_PROTOCOLFAIL = { errorCode: 100708, errorMsg: "通信协议出错" };
	var AC_ERROR_BUSINESS_TIMEOUT = { errorCode: 100709, errorMsg: "业务服务器执行任务超时" };
	var AC_ERROR_BUSINESS_FILENOEXIST = { errorCode: 100710, errorMsg: "文件不存在" };

	//数据库服务器错误代码                     
	var AC_ERROR_DB_EXECUTE_ERROR = { errorCode: 100801, errorMsg: "数据库执行错误" };
	var AC_ERROR_DB_SELECT_NODATA = { errorCode: 100802, errorMsg: "数据库查询不到数据" };
	var AC_ERROR_DB_FETCH_ERROR = { errorCode: 100803, errorMsg: "数据库读取行数据错误" };
	var AC_ERROR_DB_EXCEPTION = { errorCode: 100804, errorMsg: "出现异常" };
	var AC_ERROR_DB_CONNECT_ERROR = { errorCode: 100805, errorMsg: "连接异常" };

	//PPT播放相关错误码                        
	var AC_ERROR_PPTHELPER_INVALIAD_URL = { errorCode: 100901, errorMsg: "无效URL地址" };
	var AC_ERROR_PPTHELPER_RETURNED_ERROR = { errorCode: 100902, errorMsg: "页面不存在" };
	var AC_ERROR_PPTHELPER_COULDNT_CONNECT = { errorCode: 100903, errorMsg: "主机或代理失败" };
	//AI能力错误码
	var AC_ERROR_AI_ABILITY_AIROBOTIDEXIST = { errorCode: 200000, errorMsg: "机器人ID已存在" };
	var AC_ERROR_AI_ABILITY_AITASKIDEXIST = { errorCode: 200001, errorMsg: "ai任务ID已存在" };
	var AC_ERROR_AI_ABILITY_AIOBJNOTEXIST = { errorCode: 200002, errorMsg: "ai对象不存在" };
	var AC_ERROR_AI_ABILITY_PARAMINVALID = { errorCode: 200003, errorMsg: "ai参数错误" };
	var AC_ERROR_AI_ABILITY_FUNCTIONNOTSUPPORT = { errorCode: 200004, errorMsg: "ai能力不支持" };
	var AC_ERROR_AI_ABILITY_UNKNOWAIFUNCTION = { errorCode: 200005, errorMsg: "未知AI能力" };
	var AC_ERROR_AI_ABILITY_HTTPREQUESTFAIL = { errorCode: 200006, errorMsg: "HTTP请求失败" };
	var AC_ERROR_AI_ABILITY_AIREQUESTINITFAIL = { errorCode: 200007, errorMsg: "ai请求初始化失败" };
	var AC_ERROR_AI_ABILITY_AIREQUESTFAIL = { errorCode: 200008, errorMsg: "ai请求失败" };
	var AC_ERROR_AI_ABILITY_AIREQUESTTIMEOUT = { errorCode: 200009, errorMsg: "ai请求超时" };
	var AC_ERROR_AI_ABILITY_AITHREADDATAINVALID = { errorCode: 200010, errorMsg: "ai线程数据信息无效" };
	var AC_ERROR_AI_ABILITY_AITHREADOBJINVALID = { errorCode: 200011, errorMsg: "ai线程对象无效" };
	var AC_ERROR_AI_ABILITY_AIRELATEDATAINVALID = { errorCode: 200012, errorMsg: "ai关联数据无效" };
	var AC_ERROR_AI_ABILITY_HEARTBEATTIMEOUT = { errorCode: 200013, errorMsg: "心跳超时" };
	var AC_ERROR_AI_ABILITY_ROBOTOFFLINE = { errorCode: 200014, errorMsg: "机器人离线" };
	var AC_ERROR_AI_ABILITY_CONTENTOVERLENGTH = { errorCode: 200015, errorMsg: "内容超长" };
	var AC_ERROR_AI_ABILITY_COMMANDOVERLENGTH = { errorCode: 200016, errorMsg: "信令超长" };
	var AC_ERROR_AI_ABILITY_AIOVERCUNCURRENCY = { errorCode: 200017, errorMsg: "ai请求超过并发数" };
	var AC_ERROR_AI_ABILITY_MEDIAPARAMINVALID = { errorCode: 200018, errorMsg: "媒体参数无效" };
	var AC_ERROR_AI_ABILITY_REQUESTIDEXIST = { errorCode: 200019, errorMsg: "请求ID已存在" };
	var AC_ERROR_AI_ABILITY_ABNORMALERROR = { errorCode: 200020, errorMsg: "ai异常错误" };

	//录像标签错误码
	var AC_ERROR_RECORD_TAG_PARAMINVALID = { errorCode: 400000, errorMsg: "标签参数错误" };
	var AC_ERROR_RECORD_TAG_NOTSTART = { errorCode: 400001, errorMsg: "标签未开始" };
	var AC_ERROR_RECORD_TAG_NOTEXIST = { errorCode: 400002, errorMsg: "未找到待更新标签" };
	var AC_ERROR_RECORD_TAG_TASKIDEXIST = { errorCode: 400003, errorMsg: "taskId已存在" };

	errorObjList = [
	    AC_ERROR_UNKNOW,
	    AC_ERROR_SUCCESS,
	    AC_ERROR_DB_ERROR,
	    AC_ERROR_NOTINIT,
	    AC_ERROR_NOTINRM,
	    AC_ERROR_MEMORYFAIL,
	    AC_ERROR_EXCEPTION,
	    AC_ERROR_CANCEL,
	    AC_ERROR_PROTOCOLFAIL,
	    AC_ERROR_SESSIONNOTEXIST,
	    AC_ERROR_DATANOTEXIST,
	    AC_ERROR_DATAEXIST,
	    AC_ERROR_INVALIDGUID,
	    AC_ERROR_RESOURCERECOVER,
	    AC_ERROR_RESOURCEUSED,
	    AC_ERROR_JSONFAIL,
	    AC_ERROR_OBJECTDELETE,
	    AC_ERROR_SESSIONEXIST,
	    AC_ERROR_SESSIONNOTINIT,
	    AC_ERROR_FUNCNOTALLOW,
	    AC_ERROR_FUNCOPTERROR,
	    AC_ERROR_DEVICEOPENFAIL,
	    AC_ERROR_NOENOUGHRESOURCE,
	    AC_ERROR_PIXFMTNOTSUPPORT,
	    AC_ERROR_NOTMULTICASTADDR,
	    AC_ERROR_MULTIRUNERROR,
	    AC_ERROR_FILETRUSTFAILED,
	    AC_ERROR_CERTVERIFYFAILED,
	    AC_ERROR_CERTUSERFAILED,
	    AC_ERROR_MASTERISSLAVE,
	    AC_ERROR_MASTERNOTCREDIT,
	    AC_ERROR_VERSIONNOTMATCH,
	    AC_ERROR_CERTFAILSECOND,
	    AC_ERROR_SERVERVERIFYFAIL,
	    AC_ERROR_CLIENTCERTFAILED,
	    AC_ERROR_CERTSUMFAILED,
	    AC_ERROR_REMOTECTRL,
	    AC_ERROR_DUPLICATESERVICEID,
	    AC_ERROR_DIRENTERROR,
	    AC_ERROR_EXTRACTFILEERROR,
	    AC_ERROR_STARTPROCESSFAILED,
	    AC_ERROR_SERVICEISRUNNING,
	    AC_ERROR_DISKSPACELIMITED,
	    AC_ERROR_REQUESTFAILED,
	    AC_ERROR_INVALIDMACHINE,
	    AC_ERROR_GETCERTINFOFAILED,
	    AC_ERROR_CLUSTERNOTMATCH,
	    AC_ERROR_NONECLUSTERID,
	    AC_ERROR_CREATESERVICE_MORE,
	    AC_ERROR_COPYFILEFAILED,
	    AC_ERROR_CLOUDNATIVEDBFAIL,
	    AC_ERROR_CLOUDOSSUPLOADFAIL,
	    AC_ERROR_SERVICEBINDCHANGE,
	    AC_ERROR_SERVICENOTBIND,
	    AC_ERROR_SERVICEBINDFAIL,
	    AC_ERROR_PIPELINEUSERFAIL,
	    AC_ERROR_PIPELINESESSFAIL,
	    AC_ERROR_SERVICECLOSED,
	    AC_ERROR_FILEENCRYPTED,
	    AC_ERROR_FILEHEADINVAILD,
	    AC_ERROR_FILEDECODE_PASSERR,
	    AC_ERROR_CONNECT_TIMEOUT,
	    AC_ERROR_CONNECT_ABORT,
	    AC_ERROR_CONNECT_AUTHFAIL,
	    AC_ERROR_CONNECT_DNSERROR,
	    AC_ERROR_CONNECT_OVERFLOW,
	    AC_ERROR_CONNECT_FUNCLIMIT,
	    AC_ERROR_CONNECT_INTRANET,
	    AC_ERROR_CONNECT_OLDVERSION,
	    AC_ERROR_CONNECT_SOCKETERR,
	    AC_ERROR_CONNECT_DEVICELIMIT,
	    AC_ERROR_CONNECT_PAUSED,
	    AC_ERROR_CONNECT_HOTSERVER,
	    AC_ERROR_CONNECT_ERRCERUSER,
	    AC_ERROR_CONNECT_IPFORBID,
	    AC_ERROR_CONNECT_TYPEWRONG,
	    AC_ERROR_CONNECT_ERRORIP,
	    AC_ERROR_CONNECT_SELFCLOSE,
	    AC_ERROR_CONNECT_NOSVRLIST,
	    AC_ERROR_CONNECT_LBTIMEOUT,
	    AC_ERROR_CONNECT_NOTWORK,
	    AC_ERROR_CONNECT_OFFLINE,
	    AC_ERROR_CONNECT_NETLIMITED,
	    AC_ERROR_CONNECT_LOWTRAFFIC,
	    AC_ERROR_CONNECT_IPV6FAIL,
	    AC_ERROR_CONNECT_NOMASTER,
	    AC_ERROR_CONNECT_NOSTATUS,
	    AC_ERROR_CERTIFY_FAIL,
	    AC_ERROR_ALREADY_LOGIN,
	    AC_ERROR_ACCOUNT_LOCK,
	    AC_ERROR_IPADDR_LOCK,
	    AC_ERROR_VISITOR_DENY,
	    AC_ERROR_INVALID_USERID,
	    AC_ERROR_SERVERSDK_FAIL,
	    AC_ERROR_SERVERSDK_TIMEOUT,
	    AC_ERROR_NOTLOGIN,
	    AC_ERROR_LOGIN_NEWLOGIN,
	    AC_ERROR_LOGIN_EMPTYNAME,
	    AC_ERROR_KICKOUT,
	    AC_ERROR_SERVER_RESTART,
	    AC_ERROR_FORBIDDEN,
	    AC_ERROR_SIGSTREMPTY,
	    AC_ERROR_SIGVERIFYFAIL,
	    AC_ERROR_SIGPUBLICKEYEMPTY,
	    AC_ERROR_SIGPRIVATEKEYEMPTY,
	    AC_ERROR_SIGPARAMEMPTY,
	    AC_ERROR_SIGPARAMFAIL,
	    AC_ERROR_SIGTIMEFAILURE,
	    AC_ERROR_APPNOTACTIVE,
	    AC_ERROR_APPPAUSED,
	    AC_ERROR_APPLOCKED,
	    AC_ERROR_APPEXPIRED,
	    AC_ERROR_APPUNKNOWSTATUS,
	    AC_ERROR_SIGALREADYUSED,
	    AC_ERROR_USERROLE_FAIL,
	    AC_ERROR_INVALID_AGENT,
	    AC_ERROR_RM_LOCK,
	    AC_ERROR_RM_PASSERR,
	    AC_ERROR_RM_FULLUSER,
	    AC_ERROR_RM_INVALID,
	    AC_ERROR_RM_EXPIRE,
	    AC_ERROR_RM_REJECT,
	    AC_ERROR_RM_OWNERBEOUT,
	    AC_ERROR_RM_ENTERFAIL,
	    AC_ERROR_RM_ALREADIN,
	    AC_ERROR_RM_NOTIN,
	    AC_ERROR_STREAM_OLDPACK,
	    AC_ERROR_STREAM_SAMEPAK,
	    AC_ERROR_STREAM_PACKLOSS,
	    AC_ERROR_STREAM_MISTAKE,
	    AC_ERROR_STREAM_LACKBUFFER,
	    AC_ERROR_RM_PRINULL,
	    AC_ERROR_RM_REJECTPRI,
	    AC_ERROR_RM_PRIDENY,
	    AC_ERROR_RM_PRIREQIDERR,
	    AC_ERROR_RM_PRIALRCHAT,
	    AC_ERROR_RM_PRITIMEOUT,
	    AC_ERROR_RM_PRICHATBUSY,
	    AC_ERROR_RM_PRIUSERCLOSE,
	    AC_ERROR_RM_PRISELFCLOSE,
	    AC_ERROR_RM_PRIREQCANCEL,
	    AC_ERROR_VIDEOCALL_INCHAT,
	    AC_ERROR_MICLOSE_TIMEOUT,
	    AC_ERROR_MICLOSE_HIGHUSER,
	    AC_ERROR_COMMBUS_SELFMASTER,
	    AC_ERROR_COMMBUS_OTHERMASTER,
	    AC_ERROR_COMMBUS_LOWPRIORITY,
	    AC_ERROR_TRANSBUF_CREATEFAIL,
	    AC_ERROR_TRANSBUF_NOTASK,
	    AC_ERROR_TRANSFILE_OPENFAIL,
	    AC_ERROR_TRANSFILE_ZEROLEN,
	    AC_ERROR_TRANSFILE_TLARGE,
	    AC_ERROR_TRANSFILE_READFAIL,
	    AC_ERROR_TRANSFILE_DOWNLOADING,
	    AC_ERROR_TRANSFILE_FAILED,
	    AC_ERROR_TRANSFILE_NOTASK,
	    AC_ERROR_RECORD_NOTASK,
	    AC_ERROR_RECORD_CREATEFAIL,
	    AC_ERROR_RECORD_WAITINFO,
	    AC_ERROR_QUEUE_INVALID,
	    AC_ERROR_QUEUE_PREPARESERVICE,
	    AC_ERROR_WARNING_UDPFAIL,
	    AC_ERROR_WARNING_MISCUTILFAIL,
	    AC_ERROR_WARNING_MEDIAUTILFAIL,
	    AC_ERROR_WARNING_MEDIACOREFAIL,
	    AC_ERROR_WARNING_MEDIASHOWFAIL,
	    AC_ERROR_VIDEO_OPENFAIL,
	    AC_ERROR_VIDEO_UNKNOWFMT,
	    AC_ERROR_VIDEO_VIDIOC_G_FMT,
	    AC_ERROR_VIDEO_VIDIOC_S_FMT,
	    AC_ERROR_VIDEO_VIDIOC_G_PARM,
	    AC_ERROR_VIDEO_VIDIOC_S_PARM,
	    AC_ERROR_VIDEO_VIDIOC_QUERYCAP,
	    AC_ERROR_VIDEO_V4L2_CAP_VIDEO,
	    AC_ERROR_VIDEO_PREP_CAPBUFFER_FALL,
	    AC_ERROR_VIDEO_VIDIOC_REQBUFS,
	    AC_ERROR_VIDEO_VIDIOC_QUERYBUF,
	    AC_ERROR_VIDEO_MAP_FAILED,
	    AC_ERROR_VIDEO_VIDIOC_QBUF,
	    AC_ERROR_VIDEO_PREPBUF,
	    AC_ERROR_VIDEO_GETVIDEO_FAIL,
	    AC_ERROR_VIDEO_VIDIOC_DQBUF,
	    AC_ERROR_VIDEO_VIDIOC_STREAMON,
	    AC_ERROR_VIDEO_VIDIOC_STREAMOFF,
	    AC_ERROR_VIDEO_CAMERA_EBUSY,
	    AC_ERROR_VIDEO_UNSUPPORTMODE,
	    AC_ERROR_VIDEO_CAMERA_EINVAL,
	    AC_ERROR_AUDIO_OPENFAIL,
	    AC_ERROR_AUDIO_ALLOCHWPARAMS,
	    AC_ERROR_AUDIO_INTERLEAVED,
	    AC_ERROR_AUDIO_FORMAT,
	    AC_ERROR_AUDIO_SAMPLESPERSEC,
	    AC_ERROR_AUDIO_CHANNELS,
	    AC_ERROR_AUDIO_PERIODS,
	    AC_ERROR_AUDIO_BUFFERSIZE,
	    AC_ERROR_AUDIO_PARAMS,
	    AC_ERROR_AUDIO_BUFFERTIME,
	    AC_ERROR_AUDIO_BUFFERFRAME,
	    AC_ERROR_AUDIO_PERIODTIME,
	    AC_ERROR_AUDIO_PERIODFRAME,
	    AC_ERROR_AUDIO_ALLOCSWPARAMS,
	    AC_ERROR_AUDIO_START_THRESHOID,
	    AC_ERROR_AUDIO_START_AVAIL_MIN,
	    AC_ERROR_AUDIO_PCMPREPARE,
	    AC_ERROR_AUDIO_READFAIL,
	    AC_ERROR_AUDIO_CAPMODE,
	    AC_ERROR_PLAY_INVALIDSTREAM,
	    AC_ERROR_STREAM_SESSIONFAILED,
	    GV_ERR_PLUGINNOINSTALL,
	    GV_ERR_PLUGINOLDVERSION,
	    AC_ERROR_VIDEOCALL_CANCEL,
	    AC_ERROR_VIDEOCALL_OFFLINE,
	    AC_ERROR_VIDEOCALL_BUSY,
	    AC_ERROR_VIDEOCALL_REJECT,
	    AC_ERROR_VIDEOCALL_TIMEOUT,
	    AC_ERROR_VIDEOCALL_DISCONNECT,
	    AC_ERROR_VIDEOCALL_NOTINCALL,
	    AC_ERROR_OBJECT_EXISTAREA,
	    AC_ERROR_OBJECT_EXISTQUEUE,
	    AC_ERROR_APPID_DEFAULTNOTSUPPORT,
	    AC_ERROR_APPID_SIGNEED,
	    AC_ERROR_APPID_SIGFAILED,
	    AC_ERROR_APPID_NOTEXIST,
	    AC_ERROR_APPID_SYSLOCK,
	    AC_ERROR_APPID_NOTMATCH,
	    AC_ERROR_APPID_NOTCLOUDSERVER,
	    AC_ERROR_APPID_CHARGEMACHINELACK,
	    AC_ERROR_APPID_CHARGEMODECHANGE,
	    AC_ERROR_USERCFG_PASSWDLEN_SMALL,
	    AC_ERROR_USERCFG_USERNAME_SAME,
	    AC_ERROR_USERCFG_ACCESSLIMIT,
	    AC_ERROR_USERCFG_USERNAME_LIMIT,
	    AC_ERROR_LIVEUPDATE_BEGIN,
	    AC_ERROR_LIVEUPDATE_STOPING,
	    AC_ERROR_LIVEUPDATE_BACKUPING,
	    AC_ERROR_LIVEUPDATE_DELETEING,
	    AC_ERROR_LIVEUPDATE_COPYING,
	    AC_ERROR_LIVEUPDATE_STARTING,
	    AC_ERROR_LIVEUPDATE_RECOVERING,
	    AC_ERROR_LIVEUPDATE_ISTAGVER,
	    AC_ERROR_LIVEUPDATE_SERVICENEEDSTOP,
	    AC_ERROR_LIVEUPDATE_BACKUPFAIL,
	    AC_ERROR_LIVEUPDATE_DELETEFAIL,
	    AC_ERROR_LIVEUPDATE_COPYFAIL,
	    AC_ERROR_LIVEUPDATE_RECOVERYFAIL,
	    AC_ERROR_LIVEUPDATE_BRIDGENOTREGISTER,
	    AC_ERROR_LIVEUPDATE_WRITECONFIGFILEFAILED,
	    AC_ERROR_LIVEUPDATE_CANTGETBACKUPDIR,
	    AC_ERROR_LIVEUPDATE_FINISH,
	    AC_ERROR_LIVEUPDATE_UNABLETOGETMAINTAINIFO,
	    AC_ERROR_LIVEUPDATE_NOTRENAMEDIR,
	    AC_ERROR_STOPPROCESS_TIMEOUT,
	    AC_ERROR_STOPPROCESS_FAIL,
	    AC_ERROR_STOPPROCESS_FORCEFAIL,
	    AC_ERROR_STARTPROCESS_TIMEOUT,
	    AC_ERROR_SERVICE_CONTROLLED,
	    AC_ERROR_SERVICE_EXISTELSEVER,
	    AC_ERROR_SERVICE_NOTSUPPORT,
	    AC_ERROR_NONEXISTENCE_THE_VERSION,
	    AC_ERROR_NONEXISTENCE_THE_SERVICE,
	    AC_ERROR_ILLEGAL_EXTRA_CONFIG,
	    AC_ERROR_MOVETEMPFILE_FAIL,
	    AC_ERROR_INCOMPATIBLE_CURRENT_PLATFORM,
	    AC_ERROR_GETRT_CONNECT_FAIL,
	    AC_ERROR_BUSINESS_PARAM_INVALID,
	    AC_ERROR_BUSINESS_APPID_NOTEXIST,
	    AC_ERROR_BUSINESS_BODY_INVALID,
	    AC_ERROR_BUSINESS_SIGVERIFYFAIL,
	    AC_ERROR_BUSINESS_SIGTIMEINVALID,
	    AC_ERROR_BUSINESS_MEMORYFAIL,
	    AC_ERROR_BUSINESS_EXCEPTION,
	    AC_ERROR_BUSINESS_PROTOCOLFAIL,
	    AC_ERROR_BUSINESS_TIMEOUT,
	    AC_ERROR_BUSINESS_FILENOEXIST,
	    AC_ERROR_DB_EXECUTE_ERROR,
	    AC_ERROR_DB_SELECT_NODATA,
	    AC_ERROR_DB_FETCH_ERROR,
	    AC_ERROR_DB_EXCEPTION,
	    AC_ERROR_DB_CONNECT_ERROR,
	    AC_ERROR_PPTHELPER_INVALIAD_URL,
	    AC_ERROR_PPTHELPER_RETURNED_ERROR,
	    AC_ERROR_PPTHELPER_COULDNT_CONNECT,
	    AC_ERROR_AI_ABILITY_AIROBOTIDEXIST ,
	    AC_ERROR_AI_ABILITY_AITASKIDEXIST ,
	    AC_ERROR_AI_ABILITY_AIOBJNOTEXIST,
	    AC_ERROR_AI_ABILITY_PARAMINVALID,
	    AC_ERROR_AI_ABILITY_FUNCTIONNOTSUPPORT,
	    AC_ERROR_AI_ABILITY_UNKNOWAIFUNCTION,
	    AC_ERROR_AI_ABILITY_HTTPREQUESTFAIL,
	    AC_ERROR_AI_ABILITY_AIREQUESTINITFAIL,
	    AC_ERROR_AI_ABILITY_AIREQUESTFAIL,
	    AC_ERROR_AI_ABILITY_AIREQUESTTIMEOUT ,
	    AC_ERROR_AI_ABILITY_AITHREADDATAINVALID ,
	    AC_ERROR_AI_ABILITY_AITHREADOBJINVALID ,
	    AC_ERROR_AI_ABILITY_AIRELATEDATAINVALID ,
	    AC_ERROR_AI_ABILITY_HEARTBEATTIMEOUT ,
	    AC_ERROR_AI_ABILITY_ROBOTOFFLINE ,
	    AC_ERROR_AI_ABILITY_CONTENTOVERLENGTH ,
	    AC_ERROR_AI_ABILITY_COMMANDOVERLENGTH ,
	    AC_ERROR_AI_ABILITY_AIOVERCUNCURRENCY ,
	    AC_ERROR_AI_ABILITY_MEDIAPARAMINVALID ,
	    AC_ERROR_AI_ABILITY_REQUESTIDEXIST ,
	    AC_ERROR_AI_ABILITY_ABNORMALERROR,
	    AC_ERROR_RECORD_TAG_PARAMINVALID,
	    AC_ERROR_RECORD_TAG_NOTSTART,
	    AC_ERROR_RECORD_TAG_NOTEXIST,
	    AC_ERROR_RECORD_TAG_TASKIDEXIST
	];

	var errorObjMap;

	try {
	    errorObjMap = new Map();
	    for (var errorObj in errorObjList) {
	        errorObjMap.set(errorObjList[errorObj].errorCode, errorObjList[errorObj].errorMsg);
	    }
	} catch (e) {

	}

	function checkErrorMsg(errorCode) {
	    if (errorObjMap) {
	        return errorObjMap.get(errorCode);
	    } else {
	        for (var errorObj in errorObjList) {
	            if (errorObjList[errorObj].errorCode == errorCode) {
	                return errorObjList[errorObj].errorMsg;
	            }
	        }
	    }
	}

	exports.checkErrorMsg = checkErrorMsg;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------
	 * AnyChat队列处理器
	 * 函数说明:AnyChat队列相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	var AnyChatSDKConstant = __webpack_require__(1);
	var CONSTANT = AnyChatSDKConstant.instance;

	// 自定义指令构造函数
	function AnyChatSDKQueueHandler() {
	    this.isAutoMode = 1;
	    this.isGlobal = 0;
	    this.name; //对象名称
	    this.priority = 5;
	    this.attribute = -1;
	    this.currentQueueId = "";
	    this.waitingTimer;
	}

	AnyChatSDKQueueHandler.prototype = {
	    constructor: AnyChatSDKQueueHandler,
	    //进队列
	    inQueue: function(anychatSDKInstance, opt) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var timeout = 0;
	        if (opt.hasOwnProperty("timeout")) {
	            timeout = opt.timeout;
	        }
	        var errorCode = enterQueue({
	            queueId: opt.queueId,
	            timeout: timeout
	        });
	        if (errorCode == 0) {
	            this.currentQueueId = opt.queueId;
	        }
	        return errorCode;
	    },
	    //取消队列
	    outQueue: function(anychatSDKInstance) {
	        var _sdk = anychatSDKInstance;
	        if (_sdk.curConnectStatus == CONSTANT.ConnectStatus.OFFLINE) {
	            return;
	        }
	        var errorCode = leaveQueue({
	            queueId: this.currentQueueId
	        });
	        return errorCode;
	    },
	    //插队
	    jumpQueue: function(anychatSDKInstance) {

	    },
	    //查询排队时长
	    getQueueTime: function(params) {
	        return getQueueTime(params);
	    },
	    //查询队列长度
	    getQueueLength: function(params) {
	        return getQueueLength(params);
	    },
	    //查询排队的位置
	    getQueuePos: function(params) {
	        return getQueuePos(params);
	    },
	    //查询队列排队用户的详细信息
	    getQueueUserInfo:function(params){
	        return getQueueUserInfo(params);
	    }
	};

	// 进入服务队列
	function enterQueue(params) {
	    var errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_QUEUE_CTRL_USERENTER, params.timeout, 0, 0, 0, "");
	    return errorCode;
	}

	// 离开服务队列
	function leaveQueue(params) {
	    var errorCode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_QUEUE_CTRL_USERLEAVE, 0, 0, 0, 0, "");
	    return errorCode;
	}

	// 获取队列名
	function getQueueName(params) {
	    var queueName = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_OBJECT_INFO_NAME);
	    return queueName;
	}

	// 获取队列描述
	function getQueueInfo(params) {
	    var queueInfo = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_OBJECT_INFO_DESCRIPTION);
	    return queueInfo;
	}

	// 获取队列排队人数
	function getQueueLength(params) {
	    var queueLength = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_QUEUE_INFO_LENGTH);
	    return queueLength;
	}

	// 获取当前在队列中的位置
	function getQueuePos(params) {
	    var beforeUserNum = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_QUEUE_INFO_BEFOREUSERNUM);
	    beforeUserNum = beforeUserNum < 0 ? 0 : beforeUserNum;
	    return beforeUserNum++;
	}

	// 获取排队时间（单位：秒）
	function getQueueTime(params) {
	    var seconds = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_QUEUE_INFO_WAITTIMESECOND);
	    return seconds;
	}

	//获取队列排队用户的详细信息
	function getQueueUserInfo(params){
	    var userInfo = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_QUEUE, params.queueId, ANYCHAT_QUEUE_INFO_USERINFOLIST);
	    var userArr=[];
	    if(userInfo){
	        var userObj=JSON.parse(userInfo);
	        var queuelength=userObj.queuelength;
	        if(queuelength>0){
	            for(var i=0;i<queuelength;i++){
	                var obj={
	                    'entertime':userObj.entertimelist[i], //用户进入队列的时间
	                    'strid':userObj.stridlist[i],  //struserid
	                    'userid':userObj.useridlist[i], //userid
	                    'username':userObj.usernamelist[i], //用户名
	                }
	                userArr.push(obj);
	            }
	        }
	    }
	    return userArr;
	}
	AnyChatSDKQueueHandler.prototype.callbackFunctionRegister = function(AnyChatSDK, option) {

	    if (typeof option.queueOpt === "object") {
	        typeof(option.queueOpt.onAreaChanged) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onAreaChanged", option.queueOpt.onAreaChanged, false);
	        typeof(option.queueOpt.onQueueChanged) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onQueueChanged", option.queueOpt.onQueueChanged, false);
	        typeof(option.queueOpt.onServiceNotify) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onServiceNotify", option.queueOpt.onServiceNotify, false);
	        typeof(option.queueOpt.onElseAgentStatusChanged) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onElseAgentStatusChanged", option.queueOpt.onElseAgentStatusChanged, false);
	        typeof (option.queueOpt.onLeaveQueue) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onLeaveQueue", option.queueOpt.onLeaveQueue, false);
	        typeof (option.queueOpt.OnQueueUserInfoChanged) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("OnQueueUserInfoChanged", option.queueOpt.OnQueueUserInfoChanged, false);
	    }
	};


	var instance = new AnyChatSDKQueueHandler();

	exports.instance = instance;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------
	 * AnyChatSDKEventDispatcher
	 * 函数说明:AnyChat内部回调函数处理器
	 * 
	 * 
	 * ----------------------------------------------------------
	 */
	var AnyChatSDKConstant = __webpack_require__(1);
	var AnyChatSDKEventTarget = __webpack_require__(2);
	var AnyChatSDKUserHandler = __webpack_require__(3);
	var AnyChatSDKQueueHandler = __webpack_require__(6);
	var AnyChatSDKAreaHandler = __webpack_require__(4);
	var AnyChatSDKErrorCode = __webpack_require__(5);
	var AnyChatSDKVideoCallHandler = __webpack_require__(8);
	var CONSTANT = AnyChatSDKConstant.instance;

	var getStrUserId = AnyChatSDKUserHandler.getStrUserId;

	var receiveCallFlag = 0;


	//事件构造函数
	function AnyChatSDKEventDispatcher() {
	    // 事件处理程序数组集合
	    this.handlers = {};
	    this.eventTarget = AnyChatSDKEventTarget.instance;
	    this.constant = AnyChatSDKConstant.instance;
	    this.anychatSDKInstance = null;
	    this.roomId = null;
		
		window.OnAnyChatNotifyMessage     = OnAnyChatNotifyMessage;
		window.OnAnyChatTextMessage       = OnAnyChatTextMessage;
		window.OnAnyChatTransBuffer       = OnAnyChatTransBuffer;
		window.OnAnyChatTransBufferEx     = OnAnyChatTransBufferEx;
		window.OnAnyChatTransFile         = OnAnyChatTransFile;
		window.OnAnyChatVolumeChange      = OnAnyChatVolumeChange;
		window.OnAnyChatSDKFilterData     = OnAnyChatSDKFilterData;
		window.OnAnyChatVideoCallEvent   = OnAnyChatVideoCallEvent;
		window.OnAnyChatRecordSnapShot    = OnAnyChatRecordSnapShot;
		window.OnAnyChatRecordSnapShotEx  = OnAnyChatRecordSnapShotEx;
		window.OnAnyChatRecordSnapShotEx2 = OnAnyChatRecordSnapShotEx2;
		window.OnAnyChatCoreSDKEvent      = OnAnyChatCoreSDKEvent;
		window.OnAnyChatObjectEvent       = OnAnyChatObjectEvent;
	}

	// 自定义事件的原型对象
	AnyChatSDKEventDispatcher.prototype = {
	    // 设置原型构造函数链
	    constructor: AnyChatSDKEventDispatcher,

	    callbackinit: function(anychatSDKInstance, anychat) {
	        this.anychatSDKInstance = anychatSDKInstance;
	    }
	};

	function OnAnyChatNotifyMessage(dwNotifyMsg, wParam, lParam) {
	    switch (dwNotifyMsg) {
	        case WM_GV_CONNECT:
	            OnAnyChatConnect(wParam, lParam);
	            break;
	        case WM_GV_LOGINSYSTEM:
	            OnAnyChatLoginSystem(wParam, lParam);
	            break;
	        case WM_GV_ENTERROOM:
	            OnAnyChatEnterRoom(wParam, lParam);
	            break;
	        case WM_GV_ONLINEUSER:
	            OnAnyChatRoomOnlineUser(wParam, lParam);
	            break;
	        case WM_GV_USERATROOM:
	            OnAnyChatUserAtRoom(wParam, lParam);
	            break;
	        case WM_GV_LINKCLOSE:
	            OnAnyChatLinkClose(wParam, lParam);
	            break;
	        case WM_GV_MICSTATECHANGE:
	            OnAnyChatMicStateChange(wParam, lParam);
	            break;
	        case WM_GV_CAMERASTATE:
	            OnAnyChatCameraStateChange(wParam, lParam);
	            break;
	        case WM_GV_P2PCONNECTSTATE:
	            OnAnyChatP2PConnectState(wParam, lParam);
	            break;
	        case WM_GV_VIDEOSIZECHG:
	            OnAnyChatVideoSizeChange(wParam, lParam);
	            break;
	        default:
	            break;
	    }
	}

	function OnAnyChatObjectEvent(dwObjectType, dwObjectId, dwEventType, dwParam1, dwParam2, dwParam3, dwParam4, strParam) {
	    switch (dwEventType) {
	        case ANYCHAT_OBJECT_EVENT_UPDATE:
	            OnAnyChatObjectUpdate(dwObjectType, dwObjectId);
	            break;
	        case ANYCHAT_OBJECT_EVENT_SYNCDATAFINISH:
	            OnAnyChatObjectSyncDataFinish(dwObjectType, dwObjectId);
	            break;
	        case ANYCHAT_AREA_EVENT_ENTERRESULT:
	            OnAnyChatEnterAreaResult(dwObjectType, dwObjectId, dwParam1);
	            break;
	        case ANYCHAT_AREA_EVENT_LEAVERESULT:
	            OnAnyChatLeaveAreaResult(dwObjectType, dwObjectId, dwParam1);
	            break;
	        case ANYCHAT_AREA_EVENT_STATUSCHANGE:
	            OnAnyChatAreaStatusChange(dwObjectType, dwObjectId, dwParam1);
	            break;
	        case ANYCHAT_QUEUE_EVENT_STATUSCHANGE:
	            OnAnyChatQueueStatusChanged(dwObjectType, dwObjectId);
	            break;
	        case ANYCHAT_QUEUE_EVENT_ENTERRESULT:
	            OnAnyChatEnterQueueResult(dwObjectType, dwObjectId, dwParam1);
	            break;
	        case ANYCHAT_QUEUE_EVENT_LEAVERESULT:
	            OnAnyChatLeaveQueueResult(dwObjectType, dwObjectId, dwParam1);
	            break;
	        case ANYCHAT_QUEUE_EVENT_USERINFOLISTCHG:
	            OnAnyChatQueueUserInfoChanged(dwObjectType, dwObjectId, dwEventType, dwParam1, dwParam2, dwParam3, dwParam4, strParam);
	            break;
	        case ANYCHAT_AGENT_EVENT_STATUSCHANGE:
	            OnAnyChatAgentStatusChanged(dwObjectType, dwObjectId, dwParam1);
	            break;
	        case ANYCHAT_AGENT_EVENT_SERVICENOTIFY:
	            OnAnyChatServiceStart(dwParam1, dwParam2, dwParam3);
	            break;
	        case ANYCHAT_AGENT_EVENT_WAITINGUSER:
	            OnAnyChatAgentWaitingUser();
	            break;
	        case ANYCHAT_AGENT_EVENT_ISREADY:
	            OnAnyChatAgentprepared(dwParam1, dwParam2, dwParam3);
	            break;
	        default:
	            break;
	    }
	}

	function OnAnyChatConnect(wParam, lParam) {
	    if (lParam != 0) {
	        var result = {
	            code: lParam,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(lParam)
	        };
	        instance.eventTarget.fireEvent({
	            type: "onDisConnect",
	            result: result
	        });
	    }
	}

	function OnAnyChatLoginSystem(wParam, lParam) {
	    if (lParam == 0) {
	        instance.anychatSDKInstance.curConnectStatus = CONSTANT.ConnectStatus.OPEN;
	    }

	    AnyChatSDKUserHandler.instance.userId = wParam;
	    var strUserId = getStrUserId(wParam);
	    if (strUserId == "") {
	        strUserId = wParam;
	        AnyChatSDKUserHandler.instance.isSupportEx = false;
	    }
	    instance.anychatSDKInstance.strUserId = strUserId;

	    var dwAgentFlags = -1; //身份标识
	    if (lParam == 0) {
	        switch (AnyChatSDKUserHandler.instance.userType) {
	            case ANYCHAT_OBJECT_FLAGS_CLIENT:
	                dwAgentFlags = 0; //客户标识
	                //mCurrentStatus = CLIENT_STATUS_AREA;
	                break;
	            case ANYCHAT_OBJECT_FLAGS_AGENT:
	                AnyChatSDKAreaHandler.instance.currentAgentID = wParam;
	                dwAgentFlags = ANYCHAT_OBJECT_FLAGS_AGENT+ANYCHAT_OBJECT_FLAGS_QUEUEUSERLIST+ANYCHAT_OBJECT_FLAGS_ONLYSYNCNEED;  // 坐席标识

	                if (AnyChatSDKQueueHandler.instance.isAutoMode == 1) {
	                    dwAgentFlags = dwAgentFlags + ANYCHAT_OBJECT_FLAGS_AUTOMODE; //坐席标识
	                }
	                if (AnyChatSDKQueueHandler.instance.isGlobal == 1) {
	                    dwAgentFlags = dwAgentFlags + ANYCHAT_OBJECT_FLAGS_GLOBAL; //坐席标识
	                }
	            default:
	                break;
	        }

	        if (dwAgentFlags != -1) {
	            var dwPriority = AnyChatSDKQueueHandler.instance.priority;

	            //身份信息设置
	            BRAC_SetSDKOption(BRAC_SO_OBJECT_INITFLAGS, dwAgentFlags);

	            if (dwAgentFlags == 0) {
	                //客户端用户对象优先级
	                BRAC_ObjectSetValue(ANYCHAT_OBJECT_TYPE_CLIENTUSER, wParam, ANYCHAT_OBJECT_INFO_PRIORITY, dwPriority);
	                var dwAttributeClient = -1;
	                BRAC_ObjectSetValue(ANYCHAT_OBJECT_TYPE_CLIENTUSER, wParam, ANYCHAT_OBJECT_INFO_ATTRIBUTE, dwAttributeClient);
	            } else {
	                BRAC_ObjectSetValue(ANYCHAT_OBJECT_TYPE_CLIENTUSER, wParam, ANYCHAT_OBJECT_INFO_PRIORITY, dwPriority);
					if(AnyChatSDKQueueHandler.instance.isGlobalAgent == 1){
						BRAC_ObjectSetValue(ANYCHAT_OBJECT_TYPE_CLIENTUSER, wParam, ANYCHAT_OBJECT_INFO_ATTRIBUTE, -1);
					}
	                BRAC_ObjectSetValue(ANYCHAT_OBJECT_TYPE_CLIENTUSER, AnyChatSDKUserHandler.instance.userId, ANYCHAT_OBJECT_INFO_STRINGTAG, AnyChatSDKQueueHandler.instance.attribute);
	            }
	        }
	        var result = {
	            code: lParam,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(lParam)
	        };
	        var data = {
	            userId: strUserId
	        };
	        instance.eventTarget.fireEvent({
	            type: "onLogin",
	            data: data
	        });
	    } else {
	        var result = {
	            code: lParam,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(lParam)
	        };
	        instance.eventTarget.fireEvent({
	            type: "onDisConnect",
	            result: result
	        });
	    }
	}

	function OnAnyChatLinkClose(wParam, lParam) {
	    var result = {
	        code: lParam,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(lParam)
	    };
	    instance.eventTarget.fireEvent({
	        type: "onDisConnect",
	        result: result
	    });
	    instance.anychatSDKInstance.curConnectStatus = CONSTANT.ConnectStatus.OFFLINE;
	    if (instance.eventTarget.doneHandlers.length > 0) {
	        for (var i = 0; i < instance.eventTarget.doneHandlers.length; i++) {
	            instance.eventTarget.fireEvent({
	                type: instance.eventTarget.doneHandlers[i],
	                result: result
	            });
	        }
	    }
	}

	// 客户端进入房间，dwRoomId表示所进入房间的ID号，errorcode表示是否进入房间：0成功进入，否则为出错代码
	function OnAnyChatEnterRoom(wParam, lParam) {
	    AnyChatSDKEventDispatcher.roomId = wParam;
	    var arguement1 = {
	        code: lParam,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(lParam)
	    };

	    var arguement2 = {
	        roomId: wParam
	    };
	    instance.eventTarget.fireEvent({
	        type: "OnAnyChatEnterRoom",
	        result: arguement1,
	        data: arguement2
	    });
	}

	// 收到当前房间的在线用户信息，进入房间后触发一次，dwUserCount表示在线用户数（包含自己），dwRoomId表示房间ID
	function OnAnyChatRoomOnlineUser(dwUserCount, dwRoomId) {
	    //instance.anychatSDKInstance.getRoomUsers();
	}

	// 用户进入（离开）房间，dwUserId表示用户ID号，bEnterRoom表示该用户是进入（1）或离开（0）房间
	function OnAnyChatUserAtRoom(dwUserId, bEnterRoom) {
	    var strUserId = dwUserId+"";
	    if (bEnterRoom) {
	        strUserId = getStrUserId(dwUserId);
	        AnyChatSDKUserHandler.instance.atRoomUserList.push({ intUserId: dwUserId, strUserId: strUserId });
	    } else {
	        for (var i = 0; i < AnyChatSDKUserHandler.instance.atRoomUserList.length; i++) {
	            if (AnyChatSDKUserHandler.instance.atRoomUserList[i].intUserId == dwUserId) {
	                strUserId = AnyChatSDKUserHandler.instance.atRoomUserList[i].strUserId;
	                AnyChatSDKUserHandler.instance.atRoomUserList.splice(i, 1);
	                break;
	            }
	        }
	    }
	    var list = AnyChatSDKUserHandler.instance.atRoomUserList;
	    var userData = {
	        userId: strUserId,
	        roomId: AnyChatSDKEventDispatcher.roomId,
	        action: bEnterRoom
	    };
	    instance.eventTarget.fireEvent({
	        type: "onRoomUserInAndOut",
	        result: userData
	    });

	    var data = {
	        userList: list,
	        userNum: list.length,
	        roomId: AnyChatSDKEventDispatcher.roomId
	    };
	    instance.eventTarget.fireEvent({
	        type: "onRoomUserChanged",
	        data: data
	    });
	}

	// 收到文字消息
	function OnAnyChatTextMessage(dwFromUserId, dwToUserId, bSecret, lpMsgBuf, dwLen) {
	    var fromStrUserId = getStrUserId(dwFromUserId);
	    var toStrUserId = getStrUserId(dwToUserId);
	    var data = {
	        userId: fromStrUserId,
	        toUserId: toStrUserId,
	        msg: lpMsgBuf
	    };
	    instance.eventTarget.fireEvent({
	        type: "onRoomUserMsgReceived",
	        data: data
	    });
	}

	// 收到透明通道传输数据
	function OnAnyChatTransBuffer(dwUserId, lpBuf, dwLen) {
	    var strUserId = getStrUserId(dwUserId);

	    if (lpBuf != "") {
	        var msg = AnyChatSDKUserHandler.Base64.decode(lpBuf);
	        if (msg.indexOf("#") == -1) {
	            var msgId = msg;
	            for (var i = 0; i < AnyChatSDKUserHandler.instance.currentMsgTaskId.length; i++) {
	                if (AnyChatSDKUserHandler.instance.currentMsgTaskId[i].msgId == msgId) {
	                    var content = AnyChatSDKUserHandler.instance.currentMsgTaskId[i].msgContent;
	                    clearTimeout(AnyChatSDKUserHandler.instance.currentMsgTaskId[i].timer);
	                    AnyChatSDKUserHandler.instance.currentMsgTaskId.slice(i, 1);
	                    break;
	                }
	            }
	            var data = {
	                userId: strUserId,
	                msg: content
	            };
	            instance.eventTarget.fireEvent({
	                type: "onTransBufferDone"+strUserId,
	                result: {
	                    code: 0,
	                    msg: "发送成功"
	                },
	                data: data
	            });
	        } else {
	            var msgId = msg.substring(0, msg.indexOf("#"));
	            var msgData = msg.substring(msg.indexOf("#") + 1, msg.length);
	            try {
	                msgData = JSON.parse(msgData);
	            } catch (error) {

	            }
	            BRAC_TransBuffer(dwUserId, AnyChatSDKUserHandler.Base64.encode(msgId));

	            var data = {
	                userId: strUserId,
	                msg: msgData
	            };
	            instance.eventTarget.fireEvent({
	                type: "onReceiveBuffer",
	                data: data
	            });
	        }
	    }
	}

	// 收到透明通道（扩展）传输数据
	function OnAnyChatTransBufferEx(dwUserId, lpBuf, dwLen) {
	    var strUserId = getStrUserId(dwUserId);

	    if (lpBuf != "") {
	        var msg = AnyChatSDKUserHandler.Base64.decode(lpBuf);
	        if (msg.indexOf("#") == -1) {
	            var msgId = msg;
	            for (var i = 0; i < AnyChatSDKUserHandler.instance.currentMsgTaskId.length; i++) {
	                if (AnyChatSDKUserHandler.instance.currentMsgTaskId[i].msgId == msgId) {
	                    var content = AnyChatSDKUserHandler.instance.currentMsgTaskId[i].msgContent;
	                    clearTimeout(AnyChatSDKUserHandler.instance.currentMsgTaskId[i].timer);
	                    AnyChatSDKUserHandler.instance.currentMsgTaskId.slice(i, 1);
	                    break;
	                }
	            }
	            var data = {
	                userId: strUserId,
	                msg: content
	            };
	            instance.eventTarget.fireEvent({
	                type: "onTransBufferDone"+strUserId,
	                result: {
	                    code: 0,
	                    msg: "发送成功"
	                },
	                data: data
	            });
	        } else {
	            var msgId = msg.substring(0, msg.indexOf("#"));
	            var msgData = msg.substring(msg.indexOf("#") + 1, msg.length);
	            try {
	                msgData = JSON.parse(msgData);
	            } catch (error) {

	            }
	            BRAC_TransBufferEx(dwUserId, AnyChatSDKUserHandler.Base64.encode(msgId),0,0,0);

	            var data = {
	                userId: strUserId,
	                msg: msgData
	            };
	            instance.eventTarget.fireEvent({
	                type: "onReceiveBuffer",
	                data: data
	            });
	        }

	    }
	}

	// 用户信息更新通知，dwUserId表示用户ID号，dwType表示更新类别
	function OnAnyChatUserInfoUpdate(dwUserId, dwType) {

	}

	// 用户的音频设备状态变化消息，dwUserId表示用户ID号，State表示该用户是否已打开音频采集设备（0：关闭，1：打开）
	function OnAnyChatMicStateChange(dwUserId, State) {

	}

	// 用户摄像头状态发生变化，dwUserId表示用户ID号，State表示摄像头的当前状态（0：没有摄像头，1：有摄像头但没有打开，2：打开）
	function OnAnyChatCameraStateChange(dwUserId, State) {

	}

	// 本地用户与其它用户的P2P网络连接状态发生变化，dwUserId表示其它用户ID号，State表示本地用户与其它用户的当前P2P网络连接状态（0：没有连接，1：仅TCP连接，2：仅UDP连接，3：TCP与UDP连接）
	function OnAnyChatP2PConnectState(dwUserId, State) {

	}

	// 用户视频分辩率发生变化，dwUserId（INT）表示用户ID号，dwResolution（INT）表示用户的视频分辨率组合值（低16位表示宽度，高16位表示高度）
	function OnAnyChatVideoSizeChange(dwUserId, dwResolution) {

	}

	// 系统音量改变通知
	function OnAnyChatVolumeChange(device, dwCurrentVolume) {

	}

	// 收到服务器发送的SDK Filter数据
	function OnAnyChatSDKFilterData(lpBuf, dwLen) {

	}

	// 收到录像或拍照完成事件
	function OnAnyChatRecordSnapShot(dwUserId, lpFileName, dwParam, dwFlags) {

	}

	// 收到录像或拍照完成事件（扩展）
	function OnAnyChatRecordSnapShotEx(dwUserId, lpFileName, dwElapse, dwFlags, dwParam, lpUserStr) {

	}

	// 收到录像或拍照完成事件
	function OnAnyChatRecordSnapShotEx2(dwUserId, dwErrorCode, lpFileName, dwElapse, dwFlags, dwParam, lpUserStr) {

	}

	// 文件传输完成通知
	function OnAnyChatTransFile(dwUserId, lpFileName, lpTempFilePath, dwFileLength, wParam, lParam, dwTaskId) {

	}

	// AnyChatCoreSDK异步事件
	function OnAnyChatCoreSDKEvent(dwEventType, lpEventJsonStr) {
	    var ANYCHAT_CORESDKEVENT_RECORDSTATUS = 13 //录像状态事件
	    var ANYCHAT_SDKCTRL_SERVEROBJECT = 104; //连接用户自定义服务器能力
	    switch (parseInt(dwEventType)) {
	        case ANYCHAT_SDKCTRL_BUSINESSBUFFER://业务通道
				OnBusinessChannel(lpEventJsonStr);
	            break;
	        case ANYCHAT_CORESDKEVENT_BASEEVENT: //会话保持事件
	            var obj = JSON.parse(lpEventJsonStr);
	            if (obj.message == WM_GV_SESSIONKEEP){
	                AnyChatH5SDK.anychatSDKInstance.eventTarget.fireEvent({
	                    type: "onSessionKeep",
	                    data: lpEventJsonStr
	                });
	            }
	            break;
	        case  ANYCHAT_SDKCTRL_SERVEROBJECT:
	            handleDetachableServiceData(lpEventJsonStr);
	            break;
	    }
	}


	/********************************************
	 *		AnyChat SDK核心业务流程				*
	 *******************************************/
	//业务通道通知回调
	function OnBusinessChannel(lpEventJsonStr) {
	    var result = lpEventJsonStr;
	    AnyChatH5SDK.anychatSDKInstance.eventTarget.fireEvent({
	        type: "businessChannel" + JSON.parse(result).requestId,
	        result: result,
	    });
	}

	// 视频通话消息通知回调函数
	function OnAnyChatVideoCallEvent(dwEventType, dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr) {
	    switch (dwEventType) {
	        case BRAC_VIDEOCALL_EVENT_REQUEST:
	            //收到视频呼叫请求
	            onVideoCallControlRequest(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr);
	            break;
	        case BRAC_VIDEOCALL_EVENT_REPLY:
	            ////视频呼叫请求回复
	            onVideoCallControlReply(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr);
	            break;
	        case BRAC_VIDEOCALL_EVENT_START:
	            //通话开始
	            onVideoCallControlStart(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr);
	            break;
	        case BRAC_VIDEOCALL_EVENT_FINISH:
	            //视频通话结束
	            onVideoCallControlFinish(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr);
	            break;

	    }
	}

	//收到视频呼叫请求
	function onVideoCallControlRequest(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr) {
		receiveCallFlag = 1;
	    var strUserId = getStrUserId(dwUserId);
	    var data = {
	        userId: strUserId,
	        userStr: szUserStr
	    };
	    instance.eventTarget.fireEvent({
	        type: "onReceiveVideoCallRequest",
	        data: data
	    });
	}

	//视频呼叫请求回复
	function onVideoCallControlReply(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr) {
	    var strUserId = getStrUserId(dwUserId);
	    var result = {
	        code: dwErrorCode,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	    };
	    var data = {
	        userId: strUserId,
	        userStr: szUserStr
	    };
	    switch (dwErrorCode) {
	        case GV_ERR_SUCCESS: //成功的情况
	            instance.eventTarget.fireEvent({
	                type: "onRequestVideoCallDone",
	                result: result,
	                data: data
	            });
	            break;
	        case GV_ERR_SESSION_QUIT:
	            var errorcode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_FINISH, dwUserId, 0, 0, 0, ""); // 挂断
	            instance.eventTarget.fireEvent({
	                type: "onReceiveVideoCallError",
	                result: result
	            });
	            break;
	        case GV_ERR_SESSION_OFFLINE:
	            instance.eventTarget.fireEvent({
	                type: "onRequestVideoCallDone",
	                result: result,
	                data: data
	            });
	            break;
	        case GV_ERR_SESSION_BUSY:
	            var errorcode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_FINISH, dwUserId, 0, 0, 0, "");
	            instance.eventTarget.fireEvent({
	                type: "onRequestVideoCallDone",
	                result: result,
	                data: data
	            });
	            break;
	        case GV_ERR_SESSION_REFUSE:
	            var errorcode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_FINISH, dwUserId, 0, 0, 0, "");
	            instance.eventTarget.fireEvent({
	                type: "onReceiveVideoCallError",
	                result: result
	            });
	            break;
	        case GV_ERR_SESSION_TIMEOUT:
	            instance.eventTarget.fireEvent({
	                type: "onReceiveVideoCallError",
	                result: result
	            });
	            break;
	        case GV_ERR_SESSION_DISCONNECT:
	            instance.eventTarget.fireEvent({
	                type: "onReceiveVideoCallError",
	                result: result,
	                data: data
	            });
	            break;
	        default:
	            break;
	    }

	}

	//通话开始
	function onVideoCallControlStart(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr) {
	    var strUserId = getStrUserId(dwUserId);
	    AnyChatSDKVideoCallHandler.instance.isVideoCall = true;
	    var data = {
	        userId: strUserId,
	        roomId: dwParam,
	        userStr: szUserStr
	    };
	    instance.eventTarget.fireEvent({
	        type: "onReceiveVideoCallStart",
	        data: data
	    });
	}

	//视频通话结束
	function onVideoCallControlFinish(dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr) {
	    AnyChatSDKVideoCallHandler.instance.isVideoCall = false;

	    if (AnyChatSDKUserHandler.instance.userType == ANYCHAT_OBJECT_FLAGS_AGENT) {
	        if(dwErrorCode != 100101){ //防止客户取消和坐席接起同时发生, 坐席之后点不了状态的bug
	            //客服结束服务
	            BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, AnyChatSDKUserHandler.instance.userId, ANYCHAT_AGENT_CTRL_FINISHSERVICE, 0, 0, 0, 0, "");
	        }
	    }
	    var strUserId = getStrUserId(dwUserId);
	    var data = {
	        userId: strUserId,
	        userStr: szUserStr
	    };
	    var result = {
	        code: dwErrorCode,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	    };
	    instance.eventTarget.fireEvent({
	        type: "onReceiveVideoCallFinish",
	        result: result,
	        data: data
	    });
	}



	//业务对象数据更新事件
	function OnAnyChatObjectUpdate(dwObjectType, dwObjectId) {
	    if (dwObjectType == ANYCHAT_OBJECT_TYPE_AREA) {
	        var areaInfo = {};
	        areaInfo.areaId = dwObjectId;
	        areaInfo.areaName = AnyChatSDKAreaHandler.getAreaName({
	            areaId: dwObjectId
	        });
	        areaInfo.areaDesc = AnyChatSDKAreaHandler.getAreaDescription({
	            areaId: dwObjectId
	        });
	        AnyChatSDKAreaHandler.instance.areaIdArray[AnyChatSDKAreaHandler.instance.areaIdIndex] = areaInfo;
	        AnyChatSDKAreaHandler.instance.areaIdIndex++;
	    } else if (dwObjectType == ANYCHAT_OBJECT_TYPE_QUEUE) {

	    } else if (dwObjectType == ANYCHAT_OBJECT_TYPE_AGENT) {

	    }
	}

	//业务对象同步完成事件
	function OnAnyChatObjectSyncDataFinish(dwObjectType, dwObjectId) {
	    if (dwObjectType == ANYCHAT_OBJECT_TYPE_AREA) {
	        var result = {
	            code: 0,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(0)
	        };
	        var data = {
	            areas: AnyChatSDKAreaHandler.instance.areaIdArray
	        };
	        instance.eventTarget.fireEvent({
	            type: "onSyncAreasDone",
	            result: result,
	            data: data
	        });
	    }
	}

	// 进入服务区域通知事件
	function OnAnyChatEnterAreaResult(dwObjectType, dwObjectId, dwErrorCode) {
	    var result = {
	        code: dwErrorCode,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	    };

	    var data = {};
	    data.areaId = dwObjectId;
	    data.areaName = AnyChatSDKAreaHandler.getAreaName({
	        areaId: dwObjectId
	    });
	    data.areaDesc = AnyChatSDKAreaHandler.getAreaDescription({
	        areaId: dwObjectId
	    });

	    if (dwErrorCode == 0) {
	        data.guestCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, dwObjectId, ANYCHAT_AREA_INFO_GUESTCOUNT);
	        var queueList = BRAC_ObjectGetIdList(ANYCHAT_OBJECT_TYPE_QUEUE);

	        data.agentCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, dwObjectId, ANYCHAT_AREA_INFO_AGENTCOUNT);
	        data.idleAgentCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, dwObjectId, ANYCHAT_AREA_INFO_IDLEAGENTCOUNT);

	        var queningUserCount = 0;
	        var queues = [];

	        for (var i=0;i< queueList.length;i++) {
	            var queueObj = {};
	            var queueListId = parseInt(queueList[i]);
	            /**获取队列名称*/
	            var queueName = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_QUEUE, queueListId, ANYCHAT_OBJECT_INFO_NAME);
	            /**获取队列排队人数*/
	            var queueLength = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, queueListId, ANYCHAT_QUEUE_INFO_LENGTH);
	            queueLength = queueLength < 0 ? 0 : queueLength;
	            queningUserCount = queningUserCount + queueLength;
	            /**获取队列信息*/
	            var queueInfo = BRAC_ObjectGetStringValue(ANYCHAT_OBJECT_TYPE_QUEUE, queueListId, ANYCHAT_OBJECT_INFO_DESCRIPTION);
	            //var attributeValue = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, queueListId, ANYCHAT_OBJECT_INFO_ATTRIBUTE);

	            queueObj.id = queueListId;
	            queueObj.name = queueName;
	            queueObj.desc = queueInfo;

	            queues.push(queueObj);
	        }
	        data.queueCount = queueList.length;
	        data.queningUserCount = queningUserCount;
	        data.queues = queues;

	        //坐席
	        if (AnyChatSDKUserHandler.instance.userType == ANYCHAT_OBJECT_FLAGS_AGENT) {
	            refreshAgentServiceInfo();
	            //坐席进入营业厅的初始状态为"关闭"
	            var errorcode = BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, AnyChatSDKUserHandler.instance.userId, ANYCHAT_AGENT_CTRL_SERVICESTATUS, ANYCHAT_AGENT_STATUS_CLOSEED, 0, 0, 0, "");
	        }
	    }

	    instance.eventTarget.fireEvent({
	        type: "onEnterAreaDone",
	        result: result,
	        data: data
	    });
	}

	// 离开服务区域通知事件
	function OnAnyChatLeaveAreaResult(dwObjectType, dwObjectId, dwErrorCode) {
	    var result = {
	        code: dwErrorCode,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	    };
	    instance.eventTarget.fireEvent({
	        type: "onLeaveAreaDone",
	        result: result
	    });
	}

	//营业厅状态变化
	function OnAnyChatAreaStatusChange(dwObjectType, dwObjectId, dwErrorCode) {
	    if (AnyChatSDKUserHandler.instance.userType == ANYCHAT_OBJECT_FLAGS_AGENT) {
	        refreshAgentServiceInfo();
	    }
	    var data = {};
	    data.areaId = dwObjectId;
	    //获取当前营业厅用户数
	    data.userCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AREA, dwObjectId, ANYCHAT_AREA_INFO_GUESTCOUNT);

	    instance.eventTarget.fireEvent({
	        type: "onAreaChanged",
	        data: data
	    });
	}

	// 队列状态变化
	function OnAnyChatQueueStatusChanged(dwObjectType, dwObjectId) {
	    if (AnyChatSDKUserHandler.instance.userType == ANYCHAT_OBJECT_FLAGS_AGENT) {
	        refreshAgentServiceInfo();
	    }
	    var data = {};
	    data.queueId = dwObjectId;
	    //获取当前队列人数
	    data.userCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_LENGTH);

	    instance.eventTarget.fireEvent({
	        type: "onQueueChanged",
	        data: data
	    });
	}

	// 本地用户进入队列结果
	function OnAnyChatEnterQueueResult(dwObjectType, dwObjectId, dwErrorCode) {
	    var result = {
	        code: dwErrorCode,
	        msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	    };
	    var data = {};
	    if (dwErrorCode == 0) {
	        data.userNumInQueue = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_LENGTH);
	        var beforeMeNum = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_MYSEQUENCENO);
	        beforeMeNum = beforeMeNum < 0 ? 0 : beforeMeNum;
	        beforeMeNum++;
	        data.currentPos = beforeMeNum;
	        data.enqueueTime = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_MYENTERQUEUETIME);
	    }

	    instance.eventTarget.fireEvent({
	        type: "onEnqueueDone",
	        result: result,
	        data: data
	    });

	    if (dwErrorCode == 0) {     // AnyChatSDKQueueHandler.instance.currentQueueId == dwObjectId 
	        if (AnyChatSDKQueueHandler.instance.waitingTimer) {
	            AnyChatSDKQueueHandler.instance.waitingTimer = 10011;
	        }
	        AnyChatSDKQueueHandler.instance.waitingTimer = setInterval(function() {
	            var myQueueData = {};
	            myQueueData.userNumInQueue = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_LENGTH);
	            var beforeUserNum = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_BEFOREUSERNUM);
	            beforeUserNum = beforeUserNum < 0 ? 0 : beforeUserNum;
	            beforeUserNum++;
	            myQueueData.currentPos = beforeUserNum;
	            myQueueData.waitingTime = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_QUEUE, dwObjectId, ANYCHAT_QUEUE_INFO_WAITTIMESECOND);

	            var result = {
	                code: 0,
	                msg: AnyChatSDKErrorCode.checkErrorMsg(0)
	            };
	            instance.eventTarget.fireEvent({
	                type: "onProcessChanged",
	                result: result,
	                data: myQueueData
	            });
	        }, 1000);
	    }
	}

	// 本地用户离开队列结果
	function OnAnyChatLeaveQueueResult(dwObjectType, dwObjectId, dwErrorCode) {
	    if (dwErrorCode == 0) {
	        var result = {
	            code: dwErrorCode,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	        };
	        instance.eventTarget.fireEvent({
	            type: "onCancelQueuingDone",
	            result: result
	        });
	    } else {
	        var result = {
	            code: dwErrorCode,
	            msg: AnyChatSDKErrorCode.checkErrorMsg(dwErrorCode)
	        };
	        instance.eventTarget.fireEvent({
	            type: "onLeaveQueue",
	            result: result
	        });
	    }
	    if (AnyChatSDKQueueHandler.instance.waitingTimer) {
	        clearInterval(AnyChatSDKQueueHandler.instance.waitingTimer);
	        AnyChatSDKQueueHandler.instance.waitingTimer = null;
	    }
	    AnyChatSDKQueueHandler.instance.currentQueueId = "";
	}
	//队列用户信息更新
	function OnAnyChatQueueUserInfoChanged(dwObjectType, dwObjectId, dwEventType, dwParam1, dwParam2, dwParam3, dwParam4, strParam){
	    var result = {
	        queueId: dwObjectId  //变化队列id
	    };
	    var params = {
	        queueId: dwObjectId
	    };
	    result.userList=AnyChatSDKQueueHandler.instance.getQueueUserInfo(params);
	    instance.eventTarget.fireEvent({
	        type: "OnQueueUserInfoChanged",
	        result: result
	    });
	}

	// 坐席状态变化
	function OnAnyChatAgentStatusChanged(dwObjectType, dwObjectId, dwParam1) {

	    if (dwObjectType == ANYCHAT_OBJECT_TYPE_AGENT && AnyChatSDKUserHandler.instance.userId == dwObjectId) {
	        if (dwParam1 == ANYCHAT_AGENT_STATUS_WAITTING) {
	            refreshAgentServiceInfo();
	        } else if (dwParam1 == ANYCHAT_AGENT_STATUS_WORKING) {

	        } else if (dwParam1 == ANYCHAT_AGENT_STATUS_PAUSED) {

	        } else if (dwParam1 == ANYCHAT_AGENT_STATUS_CLOSEED) {

	        }

	        var result = {
	            status: dwParam1
	        };
	        instance.eventTarget.fireEvent({
	            type: "onAgentStatusChanged",
	            result: result
	        });
	    } else if (dwObjectType == ANYCHAT_OBJECT_TYPE_AGENT && AnyChatSDKUserHandler.instance.userId != dwObjectId) {
	        var result = {
	            status: dwParam1,
	            userId: getStrUserId(dwObjectId)
	        };
	        instance.eventTarget.fireEvent({
	            type: "onElseAgentStatusChanged",
	            result: result
	        });
	    }
	}

	//刷新坐席进入服务区域后的显示信息
	function refreshAgentServiceInfo() {
	    if (AnyChatSDKUserHandler.instance.userType == ANYCHAT_OBJECT_FLAGS_AGENT) {

	        //当前服务的开始时间
	        var serviceStartTime = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, AnyChatSDKAreaHandler.instance.currentAgentID, ANYCHAT_AGENT_INFO_SERVICEBEGINTIME);

	        //累计服务时长
	        var serviceTotalTime = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, AnyChatSDKAreaHandler.instance.currentAgentID, ANYCHAT_AGENT_INFO_SERVICETOTALTIME);

	        //累计服务的用户数
	        var serviceUserCount = BRAC_ObjectGetIntValue(ANYCHAT_OBJECT_TYPE_AGENT, AnyChatSDKAreaHandler.instance.currentAgentID, ANYCHAT_AGENT_INFO_SERVICETOTALNUM);

	        var result = {
	            serviceBeginTime: serviceStartTime,
	            serviceTotalTime: serviceTotalTime,
	            serviceUserCount: serviceUserCount
	        };
	        instance.eventTarget.fireEvent({
	            type: "onAgentServiceInfoNotify",
	            result: result
	        });
	    }
	}

	// 坐席服务开始
	function OnAnyChatServiceStart(dwAgentId, clientId, dwQueueId) {
		receiveCallFlag = 0;
	    if (AnyChatSDKUserHandler.instance.userId == clientId) {
	        if (AnyChatSDKQueueHandler.instance.waitingTimer) {
	            clearInterval(AnyChatSDKQueueHandler.instance.waitingTimer);
	            AnyChatSDKQueueHandler.instance.waitingTimer = null;
	        }
	        AnyChatSDKQueueHandler.instance.currentQueueId = "";
	    }

	    var agentStrUserId = getStrUserId(dwAgentId);
	    var clientStrUserId = getStrUserId(clientId);
	    var data = {
	        queueId: dwQueueId,
	        agentId: agentStrUserId,
	        customerId: clientStrUserId,
	        eventType: "serviceStart"
	    };

	    instance.eventTarget.fireEvent({
	        type: "onServiceNotify",
	        data: data
	    });
	    setTimeout(function() {
	        if(receiveCallFlag == 0){
	            BRAC_ObjectControl(ANYCHAT_OBJECT_TYPE_AGENT, agentStrUserId, ANYCHAT_AGENT_CTRL_FINISHSERVICE, 0, 0, 0, 0, "");
	            var result = {
	                "code": "9999",
	                "msg": "未接收到呼叫请求"
	            }
	            instance.eventTarget.fireEvent({
	                type: "onReceiveVideoCallError",
	                result: result
	            });
	        }
	    }, 15000);
	}

	//队列里没有客户，坐席端处理方式
	function OnAnyChatAgentWaitingUser() {
	    console.log("队列里没有客户");
	}

	//客户收到坐席准备好
	function OnAnyChatAgentprepared(dwAgentId, clientId, dwQueueId) {
		console.log('test');
	    var agentStrUserId = getStrUserId(dwAgentId);
	    var clientStrUserId = getStrUserId(clientId);
	    var data = {
	        queueId: dwQueueId,
	        agentId: agentStrUserId,
	        customerId: clientStrUserId,
	        eventType:"agentPrepared"
	    };
	    instance.eventTarget.fireEvent({
	        type: "onServiceNotify",
	        result: data
	    });
	}

	//接收插拔式服务数据回调
	function handleDetachableServiceData(lpEventJsonStr){
		var result=lpEventJsonStr
		instance.eventTarget.fireEvent({
			type: "handleDetachableServiceData",
			result:result
		});
	}


	var instance = new AnyChatSDKEventDispatcher();
	exports.instance = instance;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/*-----------------------------------------------------------
	 * AnyChat视频呼叫处理器
	 * 函数说明:视频呼叫相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	function AnyChatSDKVideoCallHandler() {
	    this.isVideoCall = false;
	    this.cameraObjList = [];
	}

	AnyChatSDKVideoCallHandler.prototype = {
	    constructor: AnyChatSDKVideoCallHandler,
	    request: function(opt) {
	        return requestVideoCall(opt);
	    },
	    accept: function(opt) {
	        return acceptVideoCall(opt);
	    },
	    reject: function(opt) {
	        return rejectVideoCall(opt);
	    },
	    hangup: function(opt) {
	        return hangupVideoCall(opt);
	    },
	    cancel: function(opt) {
	        return cancelVideoCall(opt);
	    },
	    openRemoteControl: openRemoteControl,
	    finishRemoteControl: finishRemoteControl
	};


	// 向指定用户发送呼叫请求
	function requestVideoCall(params) {
	    var szUserStr = "";
	    if(params.hasOwnProperty("szUserStr")){
	        szUserStr = params.szUserStr;
	    }
	    var errorCode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_REQUEST, params.userId, 0, 0, 0, szUserStr);
	    return errorCode;
	}

	// 同意接收到的呼叫请求
	function acceptVideoCall(params) {
	    var szUserStr = "";
	    if(params.hasOwnProperty("szUserStr")){
	        szUserStr = params.szUserStr;
	    }
	    var errorCode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_REPLY, params.userId, 0, 0, 0, szUserStr);
	    return errorCode;
	}

	// 拒绝接收到的呼叫请求
	function rejectVideoCall(params) {
	    var szUserStr = "";
	    if(params.hasOwnProperty("szUserStr")){
	        szUserStr = params.szUserStr;
	    }
	    var errorCode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_REPLY, params.userId, GV_ERR_SESSION_REFUSE, 0, 0, szUserStr);
	    return errorCode;
	}

	// 放弃呼叫请求
	function cancelVideoCall(params) {
	    var szUserStr = "";
	    if(params.hasOwnProperty("szUserStr")){
	        szUserStr = params.szUserStr;
	    }
	    var errorCode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_REPLY, params.userId, GV_ERR_SESSION_QUIT, 0, 0, szUserStr);
	    return errorCode;
	}

	// 挂断视频通话
	function hangupVideoCall(params) {
	    var szUserStr = "";
	    if(params.hasOwnProperty("szUserStr")){
	        szUserStr = params.szUserStr;
	    }
	    var errorCode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_FINISH, params.userId, 0, 0, 0, szUserStr);
	    return errorCode;
	}

	// 远程协助
	function openRemoteControl(params) {
	    var videoobj = GetID(params.objId);
	    GetID(params.renderId).removeChild(videoobj);
	    BRAC_SetVideoPosEx(params.userId, GetID(params.renderId), params.objId, params.streamIndex);
	    var errorCode = GetID(params.objId).SetSDKOptionInt(ANYCHATWEB_VIDEO_SO_VIDEODISPMODE, 1);
	    errorCode = GetID(params.objId).SetSDKOptionInt(ANYCHATWEB_VIDEO_SO_REMOTEASSIST, 1);
	    return errorCode;

	}

	// 关闭远程协助
	function finishRemoteControl(params) {
	    GetID(params.objId).SetSDKOptionInt(ANYCHATWEB_VIDEO_SO_VIDEODISPMODE, 0);
	    GetID(params.objId).SetSDKOptionInt(ANYCHATWEB_VIDEO_SO_REMOTEASSIST, 0);
	}

	// 远程协助请求
	function requestRemoteControl(params) {
	    var errorCode = BRAC_VideoCallControl(BRAC_VIDEOCALL_EVENT_REQUEST, params.userId, 0, 0, 0, "remoteControl");
	    return errorCode;
	}

	AnyChatSDKVideoCallHandler.prototype.callbackFunctionRegister = function(AnyChatSDK, option) {
	    if (typeof option.videoCallOpt === "object") {
	        typeof(option.videoCallOpt.onReceiveVideoCallRequest) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onReceiveVideoCallRequest", option.videoCallOpt.onReceiveVideoCallRequest, false);
	        typeof(option.videoCallOpt.onReceiveVideoCallStart) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onReceiveVideoCallStart", option.videoCallOpt.onReceiveVideoCallStart, false);
	        typeof(option.videoCallOpt.onReceiveVideoCallFinish) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onReceiveVideoCallFinish", option.videoCallOpt.onReceiveVideoCallFinish, false);
	        typeof(option.videoCallOpt.onReceiveVideoCallError) === "function" && AnyChatH5SDK.anychatSDKInstance.setCallBack("onReceiveVideoCallError", option.videoCallOpt.onReceiveVideoCallError, false);
	    }
	};

	//获取DOM对象
	function GetID(id) {
	    if (document.getElementById) {
	        return document.getElementById(id);
	    } else if (window[id]) {
	        return window[id];
	    }
	    return null;
	}

	var instance = new AnyChatSDKVideoCallHandler();

	exports.instance = instance;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------
	 * AnyChat音频设备处理器
	 * 函数说明:音频相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	var AnyChatSDKUserHandler = __webpack_require__(3);

	// 自定义指令构造函数
	function AnyChatSDKAudioHandler(deviceName) {
	    this.deviceName = deviceName;
	    this.name = deviceName.substring(deviceName.indexOf('-') + 1, deviceName.length);
	    this.idx = deviceName.substring(0, deviceName.indexOf('-'));
	    this.vadctrl = 1; // 音频静音检测控制
	    this.nsctrl = 1; // 音频噪音抑制控制
	    this.echoctrl = 1; // 音频回音消除控制
	    this.agcctrl = 1; // 音频自动增益控制
	    this.capturemode = 0; // 音频采集模式设置（参数为：int型：0 发言模式，1 放歌模式，2 卡拉OK模式，3 线路输入模式）
	}

	AnyChatSDKAudioHandler.prototype = {
	    constructor: AnyChatSDKAudioHandler,
	    config: function(opt) {
	        if (opt.hasOwnProperty("vadctrl")) {
	            this.vadctrl = opt.vadctrl;
	            BRAC_SetSDKOption(BRAC_SO_AUDIO_VADCTRL, opt.vadctrl);
	        }
	        if (opt.hasOwnProperty("nsctrl")) {
	            this.nsctrl = opt.nsctrl;
	            BRAC_SetSDKOption(BRAC_SO_AUDIO_NSCTRL, opt.nsctrl);
	        }
	        if (opt.hasOwnProperty("echoctrl")) {
	            this.echoctrl = opt.echoctrl;
	            BRAC_SetSDKOption(BRAC_SO_AUDIO_ECHOCTRL, opt.echoctrl);
	        }
	        if (opt.hasOwnProperty("agcctrl")) {
	            this.agcctrl = opt.agcctrl;
	            BRAC_SetSDKOption(BRAC_SO_AUDIO_AGCCTRL, opt.agcctrl);
	        }
	        if (opt.hasOwnProperty("capturemode")) {
	            this.capturemode = opt.capturemode;
	            BRAC_SetSDKOption(BRAC_SO_AUDIO_CAPTUREMODE, opt.capturemode);
	        }
	    },
	    open: function() {
	        BRAC_SelectVideoCapture(BRAC_DEVICE_AUDIOCAPTURE, this.deviceName);
	        var errorCode = openAudio(AnyChatSDKUserHandler.instance.userId);
	        return errorCode;
	    },
	    close: function() {
	        var errorCode = closeAudio(AnyChatSDKUserHandler.instance.userId);
	        return errorCode;
	    }
	};

	//打开麦克风
	function openAudio(userId) {
	    var errorCode = BRAC_UserSpeakControlEx(userId, 1, 0, 0, "");
	    return errorCode;
	}

	//关闭麦克风
	function closeAudio(userId) {
	    var errorCode = BRAC_UserSpeakControlEx(userId, 0, 0, 0, "");
	    return errorCode;
	}


	exports.instance = AnyChatSDKAudioHandler;
	exports.openAudio = openAudio;
	exports.closeAudio = closeAudio;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------
	 * AnyChat视频设备处理器
	 * 函数说明:视频相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	var AnyChatSDKUserHandler = __webpack_require__(3);

	//构造函数
	function AnyChatSDKVideoHandler(deviceName) {
	    this.deviceName = deviceName;
	    this.hasStreamIndex = false;
	    this.name = deviceName.substring(deviceName.indexOf('-') + 1, deviceName.length);
	    this.idx = deviceName.substring(0, deviceName.indexOf('-'));
	    this.streamIndex = deviceName.substring(0, deviceName.indexOf('-')) -1;
	    this.demoId;
	    this.isInventCamera = false;
	    if (this.name == "Native Screen Camera") {
	        this.isInventCamera = true;
	    }
	    this.isOpen = false;
	    this.bitRate = 90000; // 视频编码码率设置（参数为int型，单位bps，同服务器配置：VideoBitrate）
	    this.quality = 3; // 视频编码质量因子控制（参数为int型，同服务器配置：VideoQuality）
	    this.gop = 30; // 视频编码关键帧间隔控制（参数为int型，同服务器配置：VideoGOPSize）
	    this.width = 320; // 设置本地视频采集分辨率(宽度)
	    this.height = 240; // 设置本地视频采集分辨率(高度)
	    this.fps = 15; // 设置本地视频编码的帧率
	    this.preset = 3; // 设置视频编码预设参数（值越大，编码质量越高，占用CPU资源也会越高）
	}

	AnyChatSDKVideoHandler.prototype = {
	    constructor: AnyChatSDKVideoHandler,
	    config: function(opt) {
	        opt.bitRate && (this.bitRate = opt.bitRate);
	        opt.quality && (this.quality = opt.quality);
	        opt.width && (this.width = opt.width);
	        opt.height && (this.height = opt.height);
	        opt.gop && (this.gop = opt.gop);
	        opt.fps && (this.fps = opt.fps);
	        opt.preset && (this.preset = opt.preset);

	        videoConfig(this.streamIndex, opt)
	    },
	    open: function(opt) {
	        var params = {};
	        this.demoId = opt.id;
	        if (typeof(opt.streamIndex) === "number") {
	            this.streamIndex = opt.streamIndex;
	            this.hasStreamIndex = true;
	            params = {
	                userId: AnyChatSDKUserHandler.instance.userId,
	                streamIndex: this.streamIndex,
	                deviceName: this.deviceName,
	                demoId: opt.id ? opt.id : "",
	                isShareDesktop: this.isInventCamera
	            };
	            var errorCode = openVideo(params);
	        } else {
	            params = {
	                userId: AnyChatSDKUserHandler.instance.userId,
	                deviceName: this.deviceName,
	                demoId: opt.id ? opt.id : "",
	                isShareDesktop: this.isInventCamera
	            };
	            var errorCode = openVideo(params);
	        }

	        if (errorCode == 0) {
	            this.isOpen = true;
	        }
	        return errorCode;
	    },
	    close: function() {
	        var params = {};
	        if (this.hasStreamIndex) {
	            params = {
	                userId: AnyChatSDKUserHandler.instance.userId,
	                streamIndex: this.streamIndex
	            };
	            var errorCode = closeVideo(params);
	        } else {
	            params = {
	                userId: AnyChatSDKUserHandler.instance.userId
	            };
	            var errorCode = closeVideo(params);
	        }
	        if (errorCode == 0) {
	            this.isOpen = false;
	        }
	        if(this.demoId){
				GetID(this.demoId).innerHTML = "";
			}
	        return errorCode;
	    }
	};



	//打开摄像头
	function openVideo(params) {
	    var errorCode;
	    if (typeof(params.streamIndex) === "number") {
	        if (params.userId == AnyChatSDKUserHandler.instance.userId) {
	            //自己
	            if (!params.isShareDesktop) {
	                BRAC_SetUserStreamInfo(params.userId, params.streamIndex, BRAC_SO_LOCALVIDEO_DEVICENAME, params.deviceName);
	                errorCode = BRAC_UserCameraControlEx(params.userId, 1, params.streamIndex, 0, "");
	                BRAC_SetVideoPosEx(params.userId, GetID(params.demoId), "ANYCHAT_VIDEO_LOCAL_" + params.demoId, params.streamIndex);
	            } else {
	                BRAC_SetUserStreamInfo(params.userId, params.streamIndex, BRAC_SO_LOCALVIDEO_DEVICENAME, params.deviceName);
	                errorCode = BRAC_UserCameraControlEx(params.userId, 1, params.streamIndex, 0, "");
	                if (params.demoId != "") {
	                    BRAC_SetVideoPosEx(params.userId, GetID(params.demoId), "ANYCHAT_VIDEO_LOCAL_" + params.demoId, params.streamIndex);
	                } 
	            }
	        } else {
	            //对方
	            errorCode = BRAC_UserCameraControlEx(params.userId, 1, params.streamIndex, 0, "");
	            BRAC_SetVideoPosEx(params.userId, GetID(params.demoId), "ANYCHAT_VIDEO_REMOTE_" + params.demoId, params.streamIndex);
	        }
	    } else {
	        if (params.userId == AnyChatSDKUserHandler.instance.userId) {
	            //自己
	            BRAC_SetUserStreamInfo(params.userId, 0, BRAC_SO_LOCALVIDEO_DEVICENAME, params.deviceName);
	            errorCode = BRAC_UserCameraControl(params.userId, 1);
	            BRAC_SetVideoPos(params.userId, GetID(params.demoId), "ANYCHAT_VIDEO_LOCAL_" + params.demoId);
	        } else {
	            //对方
	            errorCode = BRAC_UserCameraControl(params.userId, 1);
	            BRAC_SetVideoPos(params.userId, GetID(params.demoId), "ANYCHAT_VIDEO_REMOTE_" + params.demoId);
	        }
	    }
	    return errorCode;
	}

	//关闭摄像头
	function closeVideo(params) {
	    var errorCode;
	    if (params.hasOwnProperty("streamIndex")) {
	        errorCode = BRAC_UserCameraControlEx(params.userId, 0, params.streamIndex, 0, "");
	    } else {
	        errorCode = BRAC_UserCameraControl(params.userId, 0);
	    }
	    return errorCode;
	}

	function videoConfig(dwStreamIndex, params) {

	    // 设置本地视频编码的码率（如果码率为0，则表示使用质量优先模式）
	    params.hasOwnProperty("bitRate") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_BITRATECTRL, params.bitRate);

	    // 设置录像实时视频码率（参数为：int型，单位：bps）
	    params.hasOwnProperty("recordBitRate") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_RECORD_VIDEOBR, params.recordBitRate);

	    // 设置录像视频码率（参数为：int型，单位：bps）
	    params.hasOwnProperty("recordBitRate") && BRAC_SetSDKOption(BRAC_SO_RECORD_VIDEOBR, params.recordBitRate);

	    // 设置本地视频编码的质量
	    params.hasOwnProperty("quality") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_QUALITYCTRL, params.quality);

	    // 设置本地视频采集分辨率
	    params.hasOwnProperty("width") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_WIDTHCTRL, params.width);
	    params.hasOwnProperty("height") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_HEIGHTCTRL, params.height);

	    // 设置本地视频编码的帧率
	    params.hasOwnProperty("fps") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_FPSCTRL, params.fps);
	    // 设置本地视频编码的关键帧间隔
	    params.hasOwnProperty("gop") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_GOPCTRL, params.gop);
	    // 设置视频编码预设参数（值越大，编码质量越高，占用CPU资源也会越高）
	    params.hasOwnProperty("preset") && BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_PRESETCTRL, params.preset);

	    // 本地视频采集分辩率控制策略（参数为int型，0 自动向下逐级匹配[默认]；1 使用采集设备默认分辩率），当配置的分辩率不被采集设备支持时有效
	    params.hasOwnProperty("videoSizePolitic") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_VIDEOSIZEPOLITIC, params.videoSizePolitic);

	    // 本地视频反交织参数控制（参数为int型： 0 不进行反交织处理[默认]；1 反交织处理），当输入视频源是隔行扫描源（如电视信号）时通过反交织处理可以提高画面质量
	    params.hasOwnProperty("deinterlace") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_DEINTERLACE, params.deinterlace);

	    // 本地视频摄像头对焦控制（参数为int型，1表示自动对焦， 0表示手动对焦）
	    params.hasOwnProperty("focusCtrl") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_FOCUSCTRL, params.focusCtrl);

	    // 本地视频采集优先格式控制（参数为int型，-1表示智能匹配，否则优先采用指定格式，参考：BRAC_PixelFormat）
	    params.hasOwnProperty("pixfmtCtrl") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_PIXFMTCTRL, params.pixfmtCtrl);

	    // 本地视频采用Overlay模式（参数为int型，1表示采用Overlay模式， 0表示普通模式[默认]）
	    params.hasOwnProperty("overlay") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_OVERLAY, params.overlay);

	    // 本地视频编码器ID设置（参数为int型，-1表示默认，如果设置的编码器ID不存在，则内核会采用默认的编码器）
	    params.hasOwnProperty("codeId") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_CODECID, params.codeId);

	    // 本地视频旋转控制（参数为int型，0表示不进行旋转，1表示垂直翻转）
	    params.hasOwnProperty("rotateCtrl") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_ROTATECTRL, params.rotateCtrl);

	    // 本地视频采集驱动设置（参数为int型，0表示自动选择[默认]， 1 Video4Linux, 2 DirectShow, 3 Java采集[Android平台使用]）
	    params.hasOwnProperty("capDriver") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_CAPDRIVER, params.capDriver);

	    // 修正视频采集颜色偏色（参数为int型，0表示关闭[默认]，1 开启）
	    params.hasOwnProperty("fixColordevia") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_FIXCOLORDEVIA, params.fixColordevia);

	    // 迭加时间戳到本地视频（参数为：int型， 0 不迭加[默认]， 1 迭加）
	    params.hasOwnProperty("overlayTimestamp") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_OVERLAYTIMESTAMP, params.overlayTimestamp);

	    // 本地视频迭加虚拟背景（字符串类型，JSON格式，包括虚拟背景路径、是否开启以及其它参数项）
	    params.hasOwnProperty("virtualbk") && BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_VIRTUALBK, params.virtualbk);

	    // 让视频参数生效
	    BRAC_SetUserStreamInfo(-1, dwStreamIndex, BRAC_SO_LOCALVIDEO_APPLYPARAM, 1);
	}

	// 查询用户多媒体流参数
	function getUserStreamInfo(params) {
	    return BRAC_GetUserStreamInfoInt(params.userId, params.streamIndex, params.infoName);
	}

	//获取DOM对象
	function GetID(id) {
	    if (document.getElementById) {
	        return document.getElementById(id);
	    } else if (window[id]) {
	        return window[id];
	    }
	    return null;
	}

	exports.instance = AnyChatSDKVideoHandler;
	exports.openVideo = openVideo;
	exports.closeVideo = closeVideo;
	exports.getUserStreamInfo = getUserStreamInfo;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	/*-----------------------------------------------------------
	 * AnyChat设置SDK参数处理器
	 * 函数说明:AnyChat设置SDK参数相关操作与回调事件处理
	 *
	 *
	 * ----------------------------------------------------------
	 */
	// 自定义指令构造函数
	function AnyChatSDKSettingHandler() {

	}

	AnyChatSDKSettingHandler.prototype = {
	    constructor: AnyChatSDKSettingHandler,
	    //设置参数
	    setSDKOption: function(opt) {
	        if (opt.hasOwnProperty("enableWebService")) {
	            //启动本地Web服务
	            var errorCode = enableWebService(parseInt(opt.enableWebService));
	        }
	        if (opt.hasOwnProperty("localPath2Url")) {
	            //将本地路径转换为URL地址
	            var errorCode = localPath2Url(parseInt(opt.localPath2Url));
	        }
	        if (opt.hasOwnProperty("videoBgImage")) {
	            //设置视频背景图片
	            var errorCode = setVideoBgImage(opt.videoBgImage);
	        }
	        if (opt.hasOwnProperty("P2PPolitic")) {
	            //本地网络P2P策略控制
	            var errorCode = setP2PPolitic(parseInt(opt.P2PPolitic));
	        }
	        if (opt.hasOwnProperty("remoteVideoMode")) {
	            //远程视频显示模式
	            var errorCode = setRemoteVideoMode(parseInt(opt.remoteVideoMode));
	        }
	        if (opt.hasOwnProperty("uploadLogInfo")) {
	            var errorCode = setUploadLogInfo(parseInt(opt.uploadLogInfo));
	        }
	        if (opt.hasOwnProperty("applyParam")) {
	            BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_APPLYPARAM, opt.applyParam);
	        }
	        if (opt.hasOwnProperty("overlayTimestamp")) {
	            var errorCode = setOverlayTimestamp(parseInt(opt.overlayTimestamp));
	        }
	    },
	    getVersionInfo: function() {
	        var version = "V" + BRAC_GetVersion(1) + " Build time: " + BRAC_GetSDKOptionString(BRAC_SO_CORESDK_BUILDTIME);
	        return version;
	    },
	    getState: function(opt) {
	        if (parseInt(opt.infoName) == 6 || parseInt(opt.infoName) == 7 || parseInt(opt.infoName) == 8) {
	            return BRAC_QueryUserStateString(opt.userId, opt.infoName);
	        } else {
	            return BRAC_QueryUserStateInt(opt.userId, opt.infoName);
	        }
	    },
	    getSDKOptionInt: function(infoName) {
	        return BRAC_GetSDKOptionInt(infoName);
	    },
	    getSDKOptionString: function(infoName) {
	        return BRAC_GetSDKOptionString(infoName);
	    },
	    // 设置虚拟背景
	    setVirtualBkImg: function(opt) {
	        return BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_VIRTUALBK, JSON.stringify(opt));
	    },
	    // 设置虚拟演播室
	    setVirtualStudio: function (opt) {
	        return  BRAC_SDKControl(ANYCHAT_SDKCTRL_VIRTUALSTUDIO,JSON.stringify(opt));
	    },
	    //旋转屏幕
	    setRotation:function(opt){
	        if(opt.userId){
	            var rotation;
	            if(opt.rotation==0){
	                rotation=0
	            }else if(opt.rotation==90){
	                rotation=BRAC_ROTATION_FLAGS_ROTATION90;   
	            }else if(opt.rotation==180){
	                rotation=BRAC_ROTATION_FLAGS_ROTATION180;
	            }else if(opt.rotation==270){
	                rotation=BRAC_ROTATION_FLAGS_ROTATION270;
	            }
	            return BRAC_UserInfoControl(opt.userId, BRAC_USERINFO_CTRLCODE_ROTATION, rotation, 0, "");
	        }
	    }

	};

	// 启动本地Web服务
	function enableWebService(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_ENABLEWEBSERVICE, value);
	    return errorCode;
	}

	// 将本地路径转换为URL地址
	function localPath2Url(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_LOCALPATH2URL, value);
	    return errorCode;
	}

	// 设置视频背景图片
	function setVideoBgImage(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_VIDEOBKIMAGE, value);
	    return errorCode;
	}

	// 本地网络P2P策略控制
	function setP2PPolitic(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_NETWORK_P2PPOLITIC, value);
	    return errorCode;
	}

	// 远程视频显示模式
	function setRemoteVideoMode(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_VIDEOSHOW_CLIPMODE, value);
	    return errorCode;
	}

	// 设置日志上传到服务器
	function setUploadLogInfo(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_CORESDK_UPLOADLOGINFO, value);
	    return errorCode;
	}

	// 设置本地视频时间戳水印
	function setOverlayTimestamp(value) {
	    var errorCode = BRAC_SetSDKOption(BRAC_SO_LOCALVIDEO_OVERLAYTIMESTAMP, value);
	    return errorCode;
	}



	var instance = new AnyChatSDKSettingHandler();

	exports.instance = instance;

/***/ })
/******/ ]);