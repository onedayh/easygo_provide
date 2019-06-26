import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import store from '@/store/index';
import * as types from '@/store/mutation_types';
import util from '@/util/util';

const router = new Router({
    routes: [
        {
            path: '/login',
            redirect: '/'
        }, {
            path: '/',
            name: 'login',
            component: resolve => require(['@/views/login'], resolve)
        }, {
            path: '/shipping/shipping_detail/shipping_recond',
            name: '出货',
            component: resolve => require(['@/views/shipping/shipping'], resolve),
            children: [
                {
                    path: '/shipping/shipping_detail/shipping_recond',
                    name: '出货明细',
                    component: resolve => require(['@/views/shipping/shipping_detail/shipping_detail'], resolve),
                    children: [
                        {
                            path: '/shipping/shipping_detail/shipping_recond',
                            name: '出货记录',
                            component: resolve => require(['@/views/shipping/shipping_detail/shipping_recond'], resolve)
                        }, {
                            path: '/shipping/shipping_detail/stock_detail',
                            name: '库存明细',
                            component: resolve => require(['@/views/shipping/shipping_detail/stock_detail'], resolve)
                        }, {
                            path: '/shipping/shipping_detail/order_recond',
                            name: '订单记录',
                            component: resolve => require(['@/views/shipping/shipping_detail/order_recond'], resolve)
                        }
                    ]
                }
            ]
        }, {
            path: '/sale/goods_sale/saling_goods',
            name: '销售',
            component: resolve => require(['@/views/sale/sale'], resolve),
            children: [
                {
                    path: '/sale/goods_sale/saling_goods',
                    name: '商品销售',
                    component: resolve => require(['@/views/sale/goods_sale/goods_sale'], resolve),
                    children: [
                        {
                            path: '/sale/goods_sale/saling_goods',
                            name: '在售商品',
                            component: resolve => require(['@/views/sale/goods_sale/saling_goods'], resolve)
                        }, {
                            path: '/sale/goods_sale/sale_reconciliation',
                            name: '销售对账',
                            component: resolve => require(['@/views/sale/goods_sale/sale_reconciliation'], resolve)
                        }, {
                            path: '/sale/goods_sale/goods_water',
                            name: '商品流水',
                            component: resolve => require(['@/views/sale/goods_sale/goods_water'], resolve)
                        }
                    ]
                }
            ]
        }, {
            path: '/info/basic_info/sku_manage',
            name: '资料',
            component: resolve => require(['@/views/info/info'], resolve),
            children: [
                {
                    path: '/info/basic_info/sku_manage',
                    name: '基础资料',
                    component: resolve => require(['@/views/info/basic_info/basic_info'], resolve),
                    children: [
                        {
                            path: '/info/basic_info/sku_manage',
                            name: 'sku管理',
                            component: resolve => require(['@/views/info/basic_info/sku_manage'], resolve)
                        }, {
                            path: '/info/basic_info/goods_classify',
                            name: '商品分类',
                            component: resolve => require(['@/views/info/basic_info/goods_classify'], resolve)
                        }, {
                            path: '/info/basic_info/brand_manage',
                            name: '品牌管理',
                            component: resolve => require(['@/views/info/basic_info/brand_manage'], resolve)
                        }
                    ]
                }
            ]
        }
    ]
});

// 路由跳转之前
router.beforeEach((to, from, next) => {
    const userStorage = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if(userStorage){
        if(to.name !== 'login'){
            if(from.name === null){
                // 刷新页面，从缓存拿数据保存在store
                const autoLogin = localStorage.getItem('autoLogin');
                if(autoLogin) store.commit(types.AUTO_LOGIN, autoLogin);
                store.commit(types.LOGIN_IN, JSON.parse(userStorage))
            }
            // 设置过期时间15天
            const userInfo = store.state.userInfo;
            if(userInfo && userInfo.time + 1296000 > Math.round(new Date().getTime() / 1000)){
                store.commit(types.GET_TITLES, to.name);
            }else if(from.name !== 'login'){
                store.commit(types.LOGIN_OUT);
                util.showMessage('登录过期，请重新登录', 'error');
                return next({path: '/'})
            }
        }else{
            return next({path: '/shipping/shipping_detail/shipping_recond'})
        }
    }else if(to.name !== 'login'){
        store.commit(types.LOGIN_OUT);
        util.showMessage('登录过期，请重新登录', 'error');
        return next({path: '/'})
    }
    next()
})

export default router

