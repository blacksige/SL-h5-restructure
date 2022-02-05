import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: '投顾预约',
    component: Home
  },
  {
    path: '/history',
    name: '历史记录',
    component: () => import('../views/MyPages/History.vue')
  },
  {
    path: '/appointment',
    name: '我的预约',
    component: () => import('../views/MyPages/MyAppointment.vue')
  },
  {
    path: '/collection',
    name: '我的收藏',
    component: () => import('../views/MyPages/MyCollection.vue')
  },
  {
    path: '/investmentDetail',
    name: '投顾详情',
    component: () => import('../views/InvestmentDetail/InvestmentDetail.vue')
  },
  {
    path: '/appointmentDetail',
    name: '预约详情',
    component: () => import('../views/AppointmentDetail/AppointmentDetail.vue')
  },
  {
    path: '/paysuccessful',
    name: '支付成功',
    component: () => import('../views/PaySuccessful/PaySuccessful.vue')
  },
  {
    path: '/evaluation',
    name: '评价',
    component: () => import('../views/ServiceEvaluation/Evaluation.vue')
  },
  {
    path: '/callPage',
    name: '通话页面',
    component: () => import('../views/CallPage/CallPage.vue')
  },
  {
    path: '/modifyPhone',
    name: '修改手机号',
    component: () => import('../views/ModifyPhone/ModifyPhone.vue')
  },
  { path: '/plates/:id', name: '板块', component: () => import('../views/PlatePages/Plates.vue') }
];

const router = new VueRouter({
  routes
});
export default router;
