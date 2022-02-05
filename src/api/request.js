import axios from 'axios';
import { baseURL, timeout } from '../config/api';
import { Dialog } from 'vant';
// 请求数据体的head
// let dataHead = {
//   agentId: '',
//   agentName: '',
//   tradeNo: ''
// };

// 实例
const Axios = axios.create({
  baseURL,
  timeout, // 请求超时时间
  withCredentials: true
});


// 配置请求拦截器
Axios.interceptors.request.use(config => {
  // TODO 请求添加参数、修改请求头等操作

  // 例如：封装请求数据结构
  // if (_.lowerCase(config.method) === 'post' && !_.isEmpty(config.data)) {
  //     config.data.head = dataHead;
  // }

  return config;
}, error => {
  if (error.message && error.message.indexOf('timeout') >= 0) {
    console.error('请求超时');
  } else {
    console.error(error);
  }

  return Promise.reject(error);
});


// 配置响应拦截器
Axios.interceptors.response.use(res => {
  if (res.data && res.data.errorCode !== undefined) {
    if (res.data.errorCode.toString() === '0') {
      // TODO 此处可对响应内容进行一些通用处理...

      return res.data;
    } else {
      // 业务处理失败，此处可以进行一些通用错误处理，或者直接抛出api调用处的catch处理
      Dialog.alert({
        title: '错误',
        message: res.data.msg,
        theme: 'round-button',
        confirmButtonColor: '#EC662B'
      }).then(() => {
        // on close
      });
      console.error(res.data);
      return Promise.reject(res.data);
    }
  } else {
    const errorMsg = `无响应内容，或响应内容格式有误，请检查接口。data: ${JSON.stringify(res.data)}`;
    console.error(errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
}, error => {
  // TODO 此处可以对响应异常进行一些通用处理，一般是http响应码403、404、500
  console.error(error);

  return Promise.reject(error);
});

export default Axios;
