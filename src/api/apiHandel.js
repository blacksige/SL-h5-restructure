import Axios from './request';
import store from '@/store';
let APPID = store.state.appId;
var apiHandel = {
  // 字典
  async getDictInfoListByTypeCode(params) {
    let data = [];
    await Axios.post('/dictType/getDictInfoListByTypeCode', {
      appId: APPID,
      typeCode: params.typeCode
    })
      .then(function(res) {
        let arr = res.content;
        arr.forEach(element => {
          data.push({
            dictKey: element.dictKey,
            dictValue: element.dictValue
          });
        });
      })
      .catch(function(err) {
        console.log(err);
      });

    return data;
  },
  // 添加对顾问的评价
  async setEvaluation(params) {
    let data;
    await Axios.post('evaluation/evaluate', {
      appId: APPID,
      consultantId: params.consultantId,
      evaluationTemplateParams: params.evaluationTemplateParams,
      message: params.message,
      orderId: params.orderId,
      star: params.star
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });

    return data;
  },
  // 获取评价基本信息
  async getEvaluationPageInfo(params) {
    let data;
    await Axios.post('evaluation/getEvaluationPage', {
      consultantId: params.consultantId,
      orderId: params.orderId
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });

    return data;
  },
  // 通过顾问id和订单id查看评价内容
  async selectEvaluation(params) {
    let data;
    await Axios.post('/evaluation/selectEvaluation', {
      appId: APPID
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 获取咨询标签列表
  async  getConsulttagList(params) {
    let data;
    await Axios.post('/consulttag/list', {
      appId: APPID
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 分页查询顾问列表
  async getConsultantList(params) {
    let data;
    await Axios.post('/consultant/list', {
      appId: APPID,
      offset: params.offset,
      pageSize: params.pageSize,
      realName: params.realName || '',
      sortField: params.sortField || '',
      sortType: params.sortType || '',
      tagCode: params.tagCode || ''
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 通过顾问id和页数查看预约时间
  async getReservation(params) {
    let data;
    await Axios.post('/consultant/getReservationTime', {
      page: params.page || 0,
      size: params.size || 15,
      consultantId: params.consultantId
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 用户收藏顾问
  async collection(params) {
    let data;
    await Axios.post('/collection/collect', {
      userId: params.userId,
      consultantId: params.consultantId,
      action: params.action
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 用户收藏列表
  async getCollectionList(params) {
    let data;
    await Axios.post('/collection/list', {
      appId: APPID,
      offset: params.offset,
      pageSize: params.pageSize,
      realName: params.realName || '',
      sortField: params.sortField || '',
      sortType: params.sortType || '',
      tagCode: params.tagCode || '',
      userId: params.userId
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 通过顾问id查询顾问详情
  async getConsultantInfo(params) {
    let data;
    await Axios.post('/consultant/getConsultantInfo', {
      appId: APPID,
      consultantId: params.consultantId,
      userId: params.userId || ''
    })
      .then(function(res) {
        res.content.score = Number(res.content.score);
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 历史相关接口
  async getHistoryList(params) {
    let data;
    await Axios.post('/userOrder/getUserOrderPageList', {
      appId: APPID,
      offset: params.offset,
      pageSize: params.pageSize,
      userId: params.userId || '',
      sortField: params.sortField || '',
      sortType: params.sortType || ''
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 历史详情、预约详情
  async getHistoryInfo(params) {
    let data;
    await Axios.post('/userOrder/getUserOrderInfo', {
      appId: APPID,
      orderId: params.orderId || '',
      consultantId: params.consultantId,
      userId: params.userId || ''
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 预约订单接口
  async addOrder(params) {
    let data;
    await Axios.post('/userOrder/addOrder', {
      appId: APPID,
      consultRemark: params.consultRemark,
      consultantTagIds: params.consultantTagIds,
      userId: params.userId || '',
      serviceId: params.serviceId || ''
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 取消订单
  async cancelOrder(params) {
    let data;
    await Axios.post('/userOrder/cancelOrder', {
      appId: APPID,
      orderNo: params.orderNo
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 订单详情
  async getOrderIfon(params) {
    let data;
    await Axios.post('/userOrder/getOrderByOrderNo', {
      appId: APPID,
      orderNo: params.orderNo
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 根据订单号查询订单
  async getOrderByOrderNo(params) {
    let data;
    await Axios.post('/userOrder/getOrderByOrderNo', {
      appId: APPID,
      orderNo: params.orderNo
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 我的预约列表
  async getMyReservation(params) {
    let data;
    await Axios.post('/userOrder/getMyReservation', {
      appId: APPID,
      userId: params.userId || '',
      offset: params.offset || 0,
      pageSize: params.pageSize || 50
    })
      .then(function(res) {
        if (params.type === 'Paid') {
          data = res.content.resultList.filter(item => {
            return item.status === 1;
          });
        } else if (params.type === 'PaidOfWaittingPay') {
          data = res.content.resultList.filter(item => {
            return item.status <= 1;
          });
        } else {
          data = res;
        }
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 用户呼叫开始
  async startcall(params) {
    let data;
    await Axios.post('/videoCall/insert', {
      appId: APPID,
      orderId: params.orderId
    })
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  },
  // 获取系统配置
  async getConfig() {
    let data;
    await Axios.post('/systemConfig/getSystemConfigList?appId=' + APPID)
      .then(function(res) {
        data = res;
      })
      .catch(function(err) {
        console.log(err);
      });
    return data;
  }
};

export default apiHandel;
