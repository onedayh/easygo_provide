<template>
    <div id="headers">
        <div class="logo">
            <img src="../assets/images/logo.png" alt="">
            <p class="h">供应商平台</p>
        </div>
        <ul class="nav-list">
            <router-link
                :class="['nav tc', {'active': item.name === menu}]"
                tag="li"
                v-for="(item, index) in navData"
                :key="index"
                :to="item.path"
            >
                {{item.name}}
            </router-link>
        </ul>
        <div class="info" @mouseout="infoShow = false" @mouseover="infoShow = true">
            <span>{{userInfo.name}}</span>
            <transition name="slide-fade">
                <ul class="info-item tc" v-if="infoShow">
                    <li @click="changeShow = true">修改密码</li>
                    <li @click="loginOut">退出账号</li>
                </ul>
            </transition>
        </div>
        <p class="name">{{userInfo.supplier}}</p>
        <el-dialog title="修改密码" :visible.sync="changeShow">
            <div class="change-pass">
                <input class="dialog-input" v-model="oldPass" v-if="changeShow" v-focus placeholder="输入旧密码" type="password">
                <input class="dialog-input" v-model="newPass" placeholder="输入新密码" type="password">
                <input class="dialog-input" v-model="newPassAgain" placeholder="确认新密码" type="password">
            </div>
            <div class="el-message-box__btns">
                <el-button @click="changeShow = false">取 消</el-button>
                <el-button type="primary" @click="changePass" :disabled="!(oldPass && newPass && newPassAgain)" :loading="changing">{{changing ? '修改中' : '确定'}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {LOGIN_OUT} from "@/store/mutation_types";
    import {mapState} from "vuex";
    import md5 from 'md5';

    export default {
        name: "headers",
        props: {
            menu: {
                type: String,
                default: ''
            }
        },
        data(){
            return{
                navData: [],
                infoShow: false,

                changeShow: false,
                oldPass: '',
                newPass: '',
                newPassAgain: '',
                changing: false
            }
        },

        created(){
            this.getNavData()
        },

        watch: {
            changeShow(val){
                const that = this;
                if(!val) [that.oldPass, that.newPass, that.newPassAgain] = ['', '', '']
            }
        },

        computed: {
            ...mapState(['userInfo'])
        },

        methods: {
            getNavData(){
                const that = this, routerData = that.$router.options.routes;
                let navData = [];
                routerData.forEach((item, index) => {
                    if(index > 1) navData.push(item)
                })
                that.navData = navData;
            },

            loginOut(){
                const that = this;
                that.$util.showModal('确认退出吗？', () => {
                    that.$ajax.get('user/logout').then(() => {
                        that.$store.commit(LOGIN_OUT);
                        that.$router.replace({path: '/'})
                    }).catch(err => {
                        that.$util.showMessage(err)
                    })
                })
            },

            changePass(){
                const that = this;
                if(that.newPass.length < 6){
                    that.$util.showMessage('密码长度不得少于6位', 'error')
                }else if(that.newPass !== that.newPassAgain){
                    that.$util.showMessage('2次密码不一致', 'error')
                }else{
                    that.changing = true;
                    that.$ajax.get('user/change_pass', {
                        params: {
                            new_password: md5(that.newPass),
                            old_password: md5(that.oldPass)
                        }
                    }).then(() => {
                        that.$util.showMessage('修改成功，请重新登录');
                        that.$store.commit(LOGIN_OUT);
                        that.$router.replace({path: '/'})
                    }).catch(err => {
                        that.changing = false;
                        that.$util.showMessage(err, 'error');
                        that.changing = false
                    })
                }
            }
        }
    }
</script>
