let agentApp = null;

const events = {
  // 初始化
  CMDAnyChatH5Init (data) {
    agentApp = new window.AnyChatH5(
      data.presetData,
      {
        // 视频开始
        onVideoStart (params) {
          sendMessage('CMDAnyChatH5VideoStart', params);
        },
        // 视频结束
        onVideoEnd (params) {
          sendMessage('CMDAnyChatH5VideoEnd', params);
        },
        // 输出提交
        onSubmit (output) {
          sendMessage('CMDAnyChatH5Submit', output);
        },
        // 异常中断提交
        onError (err) {
          sendMessage('CMDAnyChatH5Error', err);
        }
      }
    );

    agentApp.init().then(() => {
      sendMessage('CMDAnyChatH5InitDone');
    });
  }

};
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

  sendMessage('CMDAnyChatAgentReady');
};
