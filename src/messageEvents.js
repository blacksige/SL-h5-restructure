let agentApp = null;

const events = {
  // 初始化
  CMDAnyChatAgentInit (data) {
    agentApp = new window.AnyChatAgent(
      data.presetData,
      {
        // 视频开始
        onVideoStart (params) {
          sendMessage('CMDAnyChatAgentVideoStart', params);
        },
        // 视频结束
        onVideoEnd (params) {
          sendMessage('CMDAnyChatAgentVideoEnd', params);
        },
        // 录像结束
        onRecordDone (params) {
          sendMessage('CMDAnyChatAgentRecordDone', params);
        },
        // 截图拍照
        onSnapShot (image) {
          sendMessage('CMDAnyChatAgentSnapshot', image);
        },
        // 输出提交
        onSubmit (output) {
          sendMessage('CMDAnyChatAgentSubmit', output);
        }
      }
    );

    agentApp.init().then(() => {
      sendMessage('CMDAnyChatAgentInitDone');
    });
  },

  // 订阅服务端录制回放文件地址
  CMDAnyChatAgentRecordAddress (path) {
    agentApp.updateRecordFilePath(path);
  },

  // 订阅输出
  CMDAnyChatAgentRequestSubmit () {
    agentApp.getSubmitData();
  }

  // 更新坐席状态
  // CMDAnyChatAgentUpdateStatus (data) {
  //   agentApp.setAgentState(data.status);
  // }
};
console.log('123');
// 收到message消息，根据消息指令进行对应处理
const receiveMessage = event => {
  const cmd = event?.data?.cmd;
  const msg = event?.data?.msg;

  try {
    events[cmd] && events[cmd](msg);
  } catch (error) {
    console.error(error);
  }
};

// 发送消息
export const sendMessage = (cmd, data) => {
  window.parent.postMessage({ cmd, msg: data }, '*');
};

export const messageEventsRegister = () => {
  window.addEventListener('message', receiveMessage, false);
};
