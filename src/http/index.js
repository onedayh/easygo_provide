import axios from 'axios';
import store from '@/store/index';
import {LOGIN_IN, LOGIN_OUT} from '@/store/mutation_types';
import router from '@/router/index';

let apiHost = window.location.origin;
if(apiHost.indexOf('dev.ieasygo.cn') !== -1 || apiHost.indexOf('localhost:8089') !== -1){
    // dev
    apiHost = 'http://api.dev.ieasygo.cn'
} else if(apiHost.indexOf('test.ieasygo.cn')){
    // test
    apiHost = 'https://api.test.ieasygo.cn'
} else if(apiHost.indexOf('store.ieasygo.cn') !== -1){
    // store
    apiHost = 'https://api.store.ieasygo.cn'
}
axios.defaults.timeout = 10000; // 响应时间
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'; // 配置请求头
axios.defaults.baseURL = `${apiHost}/api/supterminal/`; // 配置默认请求域名
axios.defaults.headers.common['LC-Appkey'] = '723949279';
axios.defaults.withCredentials = true;  // 跨源请求不提供凭据(cookie、HTTP认证及客户端SSL证明等)

// POST传参序列化(添加请求拦截器)
axios.interceptors.request.use(config => {
    //在发送请求之前做某事
    if(config.url.indexOf('user/login') === -1 && config.url.indexOf('user/sign') === -1){
        /*
        *  除登录、签名请求外，
        *  若登录时间超12小时，更新sign
        *  设置请求头
        * */
        let userInfo = store.state.userInfo, now = Math.floor(new Date().getTime() / 1000);
        if(now > userInfo.time + 43200){
            const getSign = new Promise(reslove => {
                axios.get('user/sign').then(res => {
                    console.log('get new sign');
                    reslove(res.result)
                })
            })
            getSign.then(res => {
                store.commit(LOGIN_IN, Object.assign({}, userInfo, res));
                userInfo = Object.assign({}, store.state.userInfo)
            })
        }
        config.headers.common['LC-Session'] = userInfo.session_id;
        config.headers.common['LC-Sign'] = userInfo.sign;
        config.headers.common['LC-Timestamp'] = userInfo.time;
    }
    return config
}, error => {
    //请求错误时做某事
    return Promise.reject(error)
});

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use(res => {
    //对响应数据做某事
    const code = res.data.err_code;
    if(code != 200){
        if(code === 10001){
            // 登录过期，重新登录
            store.commit(LOGIN_OUT);
            router.replace({path: '/'})
        }
        return Promise.reject(res.data.err_msg)
    }
    return res.data
}, error => {
    //请求错误时做某事
    return Promise.reject(error.data)
});

export default axios;
