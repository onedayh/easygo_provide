<template>
    <div id="detail" @click.self="close">  <!--模态层-->
        <div class="detail" v-loading="loading">    <!--详情dom-->
            <div class="detail-header">
                <p>{{detailData.title}}</p>
                <i @click="close"></i>
            </div>
            <div v-if="detailData.top" class="detail-top tc">
                <img :src="detailData.top.img ? detailData.top.img : default_img" alt="">
                <p v-if="detailData.top.text">{{detailData.top.text}}</p>
            </div>
            <dl v-if="detailData.infos" v-for="(item, index) in detailData.infos" :key="index">
                <dt class="h">{{item.title}}</dt>
                <dd v-for="(it, idx) in item.info" :key="idx">
                    <p class="p1">{{it.name}}：</p>
                    <p class="p2">{{it.val}}</p>
                </dd>
            </dl>
            <div v-if="detailData.table">
                <ul class="tab">
                    <li class="one-tab h" v-if="detailData.table.tab.length === 1">{{detailData.table.tab[0]}}</li>
                    <li v-else :class="['tc', {'ac': tabIdx === index}]"
                        v-for="(item, index) in detailData.table.tab"
                        :key="index"
                        @click="changeTab(index)"
                    >
                        {{item}}
                    </li>
                </ul>
                <eg-table
                    :tableData="detailData.table.tableData"
                    :options="detailData.table.options"
                    :page="detailData.table.page"
                    :feedback="detailData.table.feedback"
                    @handle="detailData.table.detailHandle ? detailData.table.detailHandle : ''"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import tables from '@/components/tables';

    export default {
        name: "detail",
        props: {
            // 是否显示
            show: {
                type: Boolean,
                default: false
            },

            // 是否loading
            loading: {
                type: Boolean,
                default: false
            },

            /*
            * 详情数据 detailData:
            * 接收一个对象:
            *     title: String => 详情标题，必填
            *     top: Object => {  头部信息， 选填
            *           img: String =>  图片src  必填
            *           text: String => 图片文字  选填
            *     }
            *     infos: Array => [  详情数据， 选填
            *           {
            *               title: String => 小标题, 必填
            *               info: Array => [
            *                   {
            *                       name: String => 描述， 必填
            *                       value: String/Number => 值， 必填
            *                   }
            *                   ...
            *               ]
            *           },
            *           ...
            *     ]
            *     table: Object => {  // 详情数据-表格 选填
            *         tab: Array => ['tab1', 'tab2', ...],
            *         以下说明见tables组件 => './tables.vue'
            *         tableData:
            *         page
            *         feedback
            *     }
            * */
            detailData: {
                type: Object,
                default: () => {
                    return {}
                }
            },

            // 是否隐藏滚动条
            isOverflow: {
                type: Boolean,
                default: true
            }
        },

        data(){
            return{
                tabIdx: 0,       // tab序号
                default_img: require('@/assets/images/default_img.png')
            }
        },

        watch: {
            show(val){
                if(this.isOverflow) document.body.style.overflow = val ? 'hidden' : 'auto'
            },

            loading(val){
                document.querySelector('.detail').style.overflow = val ? 'hidden' : 'auto'
            }
        },

        components: {
            'eg-table': tables
        },

        methods: {
            // 关闭详情
            close(){
                this.$emit('close')
            },

            // tab切换
            changeTab(idx){
                const that = this;
                if(idx === that.tabIdx) return;
                that.tabIdx = idx;
                that.$emit('tabChange', idx)
            }
        }
    }
</script>