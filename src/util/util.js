import router from '@/router/index';
import {Message, MessageBox} from 'element-ui'

export default{
    // 获取侧边栏导航数据
    getSideData(headMenu){
        let barMenu = [], routeData = router.options.routes;
        routeData.forEach(item => {
            if(item.name === headMenu){
                item.children.forEach(it => {
                    barMenu.push(it)
                })
            }
        })
        return barMenu
    },

    // 获取内容最小高度
    getViewHeight(){
        let viewHeight = document.documentElement.clientHeight || document.body.clientHeight;
        return viewHeight - 244
    },

    // 提示
    showMessage(message, type = 'success', time = 1500){
        Message({
            type: type,
            duration: time,
            message: message,
            center: true
        })
    },

    // 弹窗
    showModal(text, sucBack){
        MessageBox.confirm(text, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            return sucBack()
        })
    },

    // 时间戳转换
    getLocalTime(config){
        let { dateJoin = '-' } = config;            // 默认日期连接符：-
        let { timeJoin = ':' } = config;            // 默认时间连接符：:
        let { timeType = 'minutes' } = config;      // 默认精确到分钟（minutes：精确到分钟；seconds：精确到秒）
        let { dataType = 'all' } = config;          // 默认类型为日期+时间（all：日期+时间；date：日期；time：时间）
        if (config.data) {
            let d = new Date(parseInt(config.data) * 1000);
            let date = d.getFullYear() + dateJoin + ((d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + dateJoin + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
            let time;
            // 获取时间（精确到秒）
            if (timeType == 'seconds') {
                time = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + timeJoin + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + timeJoin + (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());
            } else {
                time = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + timeJoin + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
            }
            // 返回日期+时间
            if (dataType === 'all') {
                return date + ' ' + time;
                // 返回日期
            } else if (dataType === 'date') {
                return date;
                // 返回时间
            } else if (dataType === 'time') {
                return time;
            }
        } else {
            return '';
        }
    },

    // 函数防抖
    debounce(func, delay) {
        let timer = null;
        // 闭包函数可以访问timer
        return function (...args) {
            // 如果事件被触发，清除timer并重新开始计时
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args)
            }, delay)
        }
    }
}