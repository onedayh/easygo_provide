import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import router from '@/router/index';
import * as types from './mutation_types';

export default new Vuex.Store({
    state: {
        autoLogin: 'false',
        userInfo: '',
        titles: ''
    },

    mutations: {
        // 自动登录
        [types.AUTO_LOGIN](state, val){
            state.autoLogin = val;
            localStorage.setItem('autoLogin', val)
        },

        // 获取用户信息
        [types.LOGIN_IN](state, val){
            state.userInfo = val;
            if(state.autoLogin === 'true'){
                localStorage.setItem('userInfo', JSON.stringify(val));
                sessionStorage.removeItem('userInfo')
            }else{
                sessionStorage.setItem('userInfo', JSON.stringify(val));
                localStorage.removeItem('userInfo');
            }
        },

        // 清除用户信息
        [types.LOGIN_OUT](state){
            state.userInfo = '';
            if(state.autoLogin === 'true'){
                localStorage.removeItem('userInfo')
            }else{
                sessionStorage.removeItem('userInfo')
            }
        },

        // 获取页面标题
        [types.GET_TITLES](state, val){
            state.titles = val
        }
    },

    actions: {
        [types.LOGIN_OUT]({commit}){
            commit(types.LOGIN_OUT)
        }
    }
})