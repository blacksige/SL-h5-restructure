let instance; //sdk实例
function AnyChatH5SDK(option) {
    this.init(option);
    // 单例模式 只能实例化一个
    return instance || (instance = this);
};

/*
 * 方法名：用于新建AnyChatH5SDK单例实例，只能实例化一次
 * 参数  option
 * 返回值 
 */
AnyChatH5SDK.prototype = {
    constructor: AnyChatH5SDK,
    option: {},
    init(option) {
        this.option = option;
    },
    start() {

        // 检查必填项
        let checkNullArray = [{
            key: "anychatServerAddr",
            value: "服务器地址不能为空"
        }, {
            key: "anychatServerPort",
            value: "服务器端口不能为空 "
        }, {
            key: "appId",
            value: "appId不能为空"
        }, {
            key: "userName",
            value: "用户名不能为空"
        }, {
            key: "productCode",
            value: "产品编码不能为空"
        }, {
            key: "integratorCode",
            value: "渠道编码不能为空"
        }, {
            key: "businessCode",
            value: "业务编码不能为空"
        }]

        if (this.checkIsNull(checkNullArray)) return;



        // 循环写入缓存
        for (let key in this.option) {
            this.localRemoveItem(key);
            if (typeof (this.option[key]) == 'string' || typeof (this.option[key]) == 'number') this.localSetItem(key, this.option[key]);
        }

        // 跳转到呼叫页面
        window.location.href = "./component/html/login.html";
    },
    localRemoveItem(key) {
        localStorage.removeItem(key);
    },
    localSetItem(key, value) {
        if (typeof (value) == 'number') value = value.toString()
        if (value) localStorage.setItem(key, value);
    },
    checkIsNull(keyArray) {
        let isNull = false;
        keyArray.forEach((v, i) => {
            if (!this.option.hasOwnProperty(v.key) || !this.option[v.key]) {
                let result = {
                    code: -1,
                    content: v.value
                }
                this.callbackLog(result);
                isNull = true;
            }
        })
        return isNull;
    },
    callbackLog(data) {
        // code=1:完成回调  code=0:成功回调  code=其他:错误回调
        if (data.code == 1) {
            if (this.option.hasOwnProperty("events")) {
                if (this.option.events.hasOwnProperty("onRecordCompleted")) this.option.events.onRecordCompleted(data)
            }
        } else if (data.code == 0) {
            if (this.option.hasOwnProperty("events")) {
                if (this.option.events.hasOwnProperty("onLoginSuccess")) this.option.events.onLoginSuccess(data)
            }
        } else {
            if (this.option.hasOwnProperty("events")) {
                if (this.option.events.hasOwnProperty("onError")) this.option.events.onError(data)
            }
        }
    }
};

window.AnyChatH5SDK = AnyChatH5SDK;