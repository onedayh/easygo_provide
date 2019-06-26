<template>
    <div id="filters">
        <!--导出按钮-->
        <el-button
            v-if="!noExport"
            size="mini"
            class="export l"
            @click="exportData(keyword, start_time, end_time, status, month)"
        >
            导出
        </el-button>

        <!--搜索框-->
        <el-input
            v-if="!noSearch"
            class="e-input r"
            size="mini"
            v-model="keyword"
            prefix-icon="el-icon-search"
            :placeholder="'搜索' + placeholder"
            clearable
        >
        </el-input>

        <!--日期选择框-->
        <el-date-picker
            v-if="!noDate"
            v-model="timeValue"
            type="daterange"
            class="data-picker r"
            size="mini"
            start-placeholder="开始日期"
            range-separator="至"
            end-placeholder="结束日期"
        >
        </el-date-picker>

        <!--月份选择框-->
        <el-date-picker
            v-if="haveMonth"
            class="my-month r"
            v-model="monthValue"
            type="month"
            format="yyyy 年 MM 月"
            value-format="yyyy-MM"
            placeholder="选择月份"
        >
        </el-date-picker>

        <!--状态筛选框-->
        <el-select
            v-if="!noStatus"
            class="select-width r"
            v-model="status"
            size="mini"
        >
            <el-option
                v-for="item in statusList"
                :key="item.id" :value="item.id"
                :label="item.name"
            >
            </el-option>
        </el-select>

        <!--若额外需要其他的功能按钮，通过插槽分发-->
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "filters",
        props: {
            // 筛选列表
            statusList: {
                type: Array,
                default: () => {
                    return []
                }
            },

            // 搜索框提示
            placeholder: {
                type: String,
                default: ''
            },

            // 导出隐藏
            noExport: {
                type: Boolean,
                default: false
            },

            // 搜索隐藏
            noSearch: {
                type: Boolean,
                default: false
            },

            // 日期选择框隐藏
            noDate: {
                type: Boolean,
                default: false
            },

            // 状态筛选隐藏
            noStatus: {
                type: Boolean,
                default: false
            },

            // 清空搜索框
            emptyKeyword: {
                type: Boolean,
                default: false
            },

            // 是否显示月份选择框
            haveMonth: {
                type: Boolean,
                default: false
            },

            // 清空月份选择框
            emptyMonth: {
                type: Boolean,
                default: false
            }
        },

        data(){
            return{
                keyword: '',            // 搜索关键字
                timeValue: null,        // 选择框日期值
                start_time: '',         // 开始日期值
                end_time: '',           // 结束日期值
                monthValue: null,       // 选择框月份值
                month: '',              // 月份值
                status: ''              // 状态筛选值
            }
        },

        mounted(){
            // 搜索时触发事件
            const that = this;
            that.$watch('keyword', that.$util.debounce(val => {
               that.$emit('search', val)
            }, 500))
        },

        watch: {
            // 时间选择
            timeValue(val){
                const that = this;
                if(val){
                    that.start_time = val[0].getTime() / 1000;
                    that.end_time = val[1].getTime() / 1000 + 86399
                }else{
                    that.start_time = '';
                    that.end_time = ''
                }
                that.$emit('timeValue', that.start_time, that.end_time)
            },

            // 状态筛选
            status(val){
                this.$emit('status', val)
            },

            // 清空搜索框
            emptyKeyword(val){
                if(val) this.keyword = ''
            },

            // 月份选择
            monthValue(val){
                let that = this, month = '';
                if(val){
                    month = new Date(`${val}-01`);
                    month = month.getTime() / 1000
                }
                that.month = month;
                that.$emit('getMonth', month)
            },

            // 清空月份
            emptyMonth(val){
                if(val) this.monthValue = null
            }
        },

        methods: {
            // 导出数据
            exportData(keyword, start_time, end_time, status, month){
                this.$emit('exportData', keyword, start_time, end_time, status, month)
            },

            // 点击其他按钮
            handleBtn(){
                this.$emit('handleBtn')
            }
        }
    }
</script>