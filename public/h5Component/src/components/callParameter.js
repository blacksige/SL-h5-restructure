const presetInfo = localStorage.getItem('H5PresetData');
const userInfo = JSON.parse(presetInfo).userInfo || '';
const businessInfo = JSON.parse(presetInfo).businessInfo || '';
// 呼叫随入参数配置
const szUserStr = {
  from: 'h5',
  type: '2',
  thirdTradeNo: '',
  expansion: '',
  content: [
    {
      groupData: [
        {
          key: 'userName',
          name: '客户名称',
          value: userInfo.name || ''
        },
        {
          key: 'userPhone',
          name: '手机号码',
          value: userInfo.phone || ''
        },
        {
          key: 'idcardNum',
          name: '证件号码',
          value: userInfo.userId || ''
        },
        {
          key: 'userSex',
          name: '性别',
          value: userInfo.sex || ''
        }
      ],
      groupName: '客户信息',
      groupOrder: 1
    },
    {
      groupData: [
        {
          key: 'businessName',
          name: '业务名称',
          value: businessInfo.business || ''
        },
        {
          key: 'productNumber',
          name: '产品编号',
          value: 'Product01'
        },
        {
          key: 'integratorCode',
          name: '渠道编号',
          value: 'Channel01'
        },
        {
          key: 'businessCode',
          name: '业务编号',
          value: 'Business01'
        },
        {
          key: 'productName',
          name: '产品名称',
          value: '理财产品'
        }
      ],
      groupName: '业务信息',
      groupOrder: 2
    }
  ]
};
export { szUserStr };
