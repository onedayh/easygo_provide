<template>
    <div id="login">
        <div class="login-wrap">
            <div class="logo tc"><img src="../assets/images/login_logo.png" alt=""></div>
            <div class="font tc"><img src="../assets/images/login_font.png" alt=""></div>
            <div class="login-input">
                <input v-model="admin" v-focus placeholder="邮箱或手机号" class="admin" type="text">
                <input v-model="pass" placeholder="密码" class="pass" type="password">
                <el-checkbox class="check" v-model="auto">下次自动登录</el-checkbox>
                <el-button
                    type="button"
                    class="btn login-btn"
                    :loading="logining"
                    @click="login"
                    :disabled="!(admin && pass)"
                >
                    {{logining ? '正在登录...' : '登 录'}}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapMutations} from 'vuex';
    import {AUTO_LOGIN, LOGIN_IN} from '@/store/mutation_types';
    import md5 from 'md5';

    export default {
        name: "login",

        data(){
            return{
                admin: '',
                pass: '',
                logining: false,
                auto: false
            }
        },

        mounted(){
            const that = this, autoStorage = localStorage.getItem('autoLogin'), admin = localStorage.getItem('admin');
            // 显示账号、自动登录数据
            if(admin) that.admin = admin;
            if(autoStorage === 'true') that.auto = true;
            // 监听键盘事件
            document.onkeyup = e => {
                if((e.key === 'Enter' || e.keyCode === 13) && that.admin && that.pass) that.login()
            }
        },

        // 销毁监听键盘
        destroyed(){
            document.onkeyup = null
        },

        methods: {
            ...mapMutations([AUTO_LOGIN, LOGIN_IN]),

            login(){
                const that = this;
                that.logining = true;
                that.$ajax.post('user/login', {
                    email: that.admin,
                    pwd: md5(that.pass)
                }).then(res => {
                    /*
                    *   登录成功
                    *   缓存用户名，保存自动登录状态、用户信息到store
                    *   跳转路由
                    */
                    localStorage.setItem('admin', that.admin);
                    that[AUTO_LOGIN](that.auto ? 'true' : 'false');
                    that[LOGIN_IN](Object.assign({}, res.result));
                    that.$router.replace({path: '/shipping/shipping_detail/shipping_recond'})
                }).catch(err => {
                    that.$util.showMessage(err, 'error');
                    that.logining = false
                })
            }
        }
    }
</script>