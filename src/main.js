// vue
import Vue from 'vue';

// elememnt-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// css
import './assets/css/main.scss';

// app
import App from './App';

// 路由
import router from './router';

// vuex
import store from './store';

// axios  util
import axios from './http';
import util from './util/util';

// 全局变量
Vue.prototype.$ajax = axios;
Vue.prototype.$util = util;


// 阻止vue在启动时生成生产提示
Vue.config.productionTip = false;

Vue.directive('focus', {
    inserted: el => {
        el.focus()
    }
})

// 创建vue实例
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
