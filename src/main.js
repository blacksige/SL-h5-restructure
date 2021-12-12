import Vue from 'vue';
import App from './App.vue';
import store from './store';
import { messageEventsRegister } from './messageEvents';
import {
  Pagination,
  Dialog,
  Autocomplete,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  TableColumn,
  DatePicker,
  TimeSelect,
  TimePicker,
  Popover,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Tree,
  Alert,
  Slider,
  Icon,
  Row,
  Col,
  Upload,
  Progress,
  Spinner,
  Badge,
  Card,
  Rate,
  Steps,
  Step,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem,
  Cascader,
  ColorPicker,
  Transfer,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Timeline,
  TimelineItem,
  Link,
  Divider,
  Image,
  Calendar,
  Backtop,
  PageHeader,
  CascaderPanel,
  Loading,
  MessageBox,
  Message,
  Notification
} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Autocomplete);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(RadioButton);
Vue.use(Checkbox);
Vue.use(CheckboxButton);
Vue.use(CheckboxGroup);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(OptionGroup);
Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
Vue.use(TimeSelect);
Vue.use(TimePicker);
Vue.use(Popover);
Vue.use(Tooltip);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Tag);
Vue.use(Tree);
Vue.use(Alert);
Vue.use(Slider);
Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Upload);
Vue.use(Progress);
Vue.use(Spinner);
Vue.use(Badge);
Vue.use(Card);
Vue.use(Rate);
Vue.use(Steps);
Vue.use(Step);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Cascader);
Vue.use(ColorPicker);
Vue.use(Transfer);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Timeline);
Vue.use(TimelineItem);
Vue.use(Link);
Vue.use(Divider);
Vue.use(Image);
Vue.use(Calendar);
Vue.use(Backtop);
Vue.use(PageHeader);
Vue.use(CascaderPanel);

Vue.use(Loading.directive);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

Vue.config.productionTip = false;

class AnyChatAgent {
  #el = '#app';
  #opt;
  #events;
  #logger;
  #sdkInstance = null;
  #vueApp = null;

  constructor (opt, events) {
    const checkResult = this.#checkParams(opt);
    if (checkResult !== 0) {
      throw new Error(checkResult);
    }
    this.#opt = opt;
    this.#events = events;
    console.log(this.#opt);
  }

  // 初始化
  init = () => {
    return new Promise((resolve, reject) => {
      // 初始化SDK
      const initOpt = {
        appId: this.#opt.config?.appId,
        serverIp: this.#opt.config?.serverIp,
        serverPort: this.#opt.config?.serverPort,
        nickName: this.#opt.businessInfo.isInvite === '0' ? '见证人' : this.#opt.userInfo.name, // 兼容密码登录方式，BRAC_Login使用的是nickName
        onLogin: (data) => {
          // 保存坐席必要信息，去掉私隐内容
          store.commit('setUserId', data);
          console.log(data);
          setTimeout(() => {
            resolve();
          }, 1000);
        },
        onDisConnect: (result) => {
          reject(result);
        }
      };

      this.#sdkInstance = window.AnyChatH5SDK.sdkInit(initOpt);
      console.log(this.#opt);
    })
      .then(this.#createVueApp)
      .then(vueApp => {
        this.#vueApp = vueApp;
        return this;
      })
      .catch(err => {
        const errMsg = err.code && err.msg ? err.msg : '初始化失败';
        console.error(err, errMsg);
      });
  }

  #createVueApp = () => {
    // 创建Vue实例
    Vue.prototype.$anychatWebSDK = this.#sdkInstance;
    document.getElementById('loading').remove();
    this.#vueApp = new Vue({
      store,
      render: h =>
        h(App, {
          // 传入参数
          props: { importData: this.#opt },
          on: this.#events
        })
    }).$mount(this.#el);

    return this;
  }

  #checkParams = opt => {
    if (!opt.config) return '配置信息不能为空';
    if (!opt.config.serverIp) return '服务器地址不能为空';
    if (!opt.config.serverPort) return '服务器端口不能为空';
    if (!opt.config.appId) return '应用ID不能为空';
    if (!opt.userInfo?.name) return '用户信息不能为空';
    return 0;
  }
};

window.AnyChatAgent = AnyChatAgent;

// 注册message事件
messageEventsRegister();
