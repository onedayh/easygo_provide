<template>
    <div id="salingGoods">
        <eg-filter
            :statusList="filters.statusList"
            placeholder="商品名称或条形码"
            :noDate="Boolean(true)"
            @search="filters.search"
            @status="filters.status"
            @exportData="filters.exportData"
        />
        <eg-table
            :tableData="tables.tableData"
            :options="tables.options"
            :page="tables.page"
            :feedback="tables.feedback"
            @handle="tables.handle"
            @handlePage="tables.handlePage"
            @handleSort="tables.handleSort"
        />
        <transition name="slide-fade">
            <eg-detail
                v-show="detail.show"
                :show="detail.show"
                :loading="detail.loading"
                :detailData="detail.detailData"
                @close="detail.close"
            />
        </transition>
    </div>
</template>

<script>
    import tables from '@/components/tables';
    import detail from '@/components/detail';
    import filters from '@/components/filters';

    export default {
        data(){
            return{
                tables: {
                    options: [
                        {prop: 'barcode', label: '条形码', width: 160},
                        {prop: 'g_sku_name', label: '商品名称', overflow: true, width: 200},
                        {prop: 'retail', label: '零售价', sort: 'custom', width: 150},
                        {prop: 'on_sale_count', label: '在售', sort: 'custom'},
                        {prop: 'total_sale', label: '总销量', sort: 'custom'},
                        {prop: 'shop_num', label: '销售门店', sort: 'custom'},
                        {prop: 'status', label: '状态', width: 60},
                        {label: '操作', slot: [{type: 'detail', name: '详情'}], width: 60}
                    ],
                    tableData: [],
                    page:{
                        cur: 1,
                        size: 20,
                        total: 0
                    },
                    feedback: '',
                    // 列表操作
                    handle: (row, type) => {
                        if(type === 'detail') this.getDetail(row.g_sku_id)
                    },
                    // 页码切换
                    handlePage: val => {
                        const that = this;
                        that.tables.page.cur = val;
                        that.$router.replace({path: `?page=${val}`});
                        that.getList();
                    },
                    // 列表排序
                    handleSort: (prop, order) => {
                        this.handleSort(prop, order)
                    }
                },
                detail: {
                    show: false,
                    loading: false,
                    detailData: {
                        title: '详情',
                        top: {
                            img: '',
                            name: ''
                        },
                        infos: [
                            {title: '基础信息', info: [
                                {name: '条形码', val: ''},
                                {name: '所属分类', val: ''},
                                {name: '单位', val: ''},
                                {name: '品牌', val: ''}
                            ]},
                            {title: '价格信息', info: [
                                {name: '进货单价', val: ''},
                                {name: '零售价', val: ''},
                                {name: '会员价', val: ''},
                                {name: '利润率', val: ''}
                            ]}
                        ]
                    },
                    // 关闭详情
                    close: () => {
                        this.detail.show = false
                    }
                },
                filters: {
                    statusList: [
                        {id: '', name: '全部状态'},
                        {id: '1', name: '停售'},
                        {id: '2', name: '在售'}
                    ],
                    // 关键字筛选
                    search: val => {
                        const that = this;
                        [that.keyword, that.tables.page.cur] = [val, 1];
                        that.$router.replace({path: `?page=1`});
                        that.getList()
                    },
                    // 状态筛选
                    status: val => {
                        const that = this;
                        [that.status, that.tables.page.cur] = [val, 1];
                        that.$router.replace({path: `?page=1`});
                        that.getList()
                    },
                    // 导出列表数据
                    exportData: (keyword, status) => {
                        const that = this, ss_id = that.$store.state.userInfo.session_id;
                        window.open(`${that.$ajax.defaults.baseURL}sale/sku_on_sale_export?lc=${ss_id}&order=${that.order}&condition=${that.condition}&status=${status}&keyword=${keyword}`)
                        // order: that.order,                  // 排序 1零售价2在售3总销量4销售门店
                        //     condition: that.condition,
                    }
                },

                order: '',              // 排序 1零售价2在售3总销量4销售门店
                condition: '',          // 排序 1升序2降序
                status: '',
                keyword: ''
            }
        },
        components: {
            'eg-table': tables,
            'eg-detail': detail,
            'eg-filter': filters
        },
        created(){
            this.getList()
        },
        watch: {
            'detail.show'(val){
                if(!val) this.emptyDetail()
            },
            '$route.query'(val){
                const queryArr = Object.keys(val), that = this;
                if(queryArr.length === 0){  // 点击二级菜单
                    that.$router.replace({path: `?page=${that.tables.page.cur}`})
                }
            }
        },
        methods: {
            // 清空详情数据
            emptyDetail(){
                let that = this, datas = that.detail.detailData;
                datas.top = {
                    img: '',
                    name: ''
                }
                datas.infos.forEach(item => {
                    item.info.forEach(it => {
                        it.val = ''
                    })
                })
                that.detail.detailData = datas
            },

            // 获取列表数据
            getList(){
                const that = this, tables = that.tables;
                [tables.tableData, tables.feedback] = [[], 'loading'];
                that.$ajax.get('sale/sku_on_sale', {
                    params: {
                        page: tables.page.cur,              // 当前页
                        page_limit: tables.page.size,       // 每页数量
                        order: that.order,                  // 排序 1零售价2在售3总销量4销售门店
                        condition: that.condition,          // 排序 1升序2降序
                        status: that.status,                // 状态，1停售2在售
                        keyword: that.keyword               // 搜索关键字
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.count > 0 && datas.list.length > 0){
                        datas.list.forEach(item => {
                            item.retail = item.min_price === item.max_price ? `￥${item.max_price}` : `￥${item.min_price} ~ ${item.max_price}`;
                            item.status = item.status === 1 ? '停售' : item.status === 2 ? '在售' : ''
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.list, datas.count]
                }).catch(err =>{
                    that.$util.showMessage(err, 'error');
                    tables.feedback = 'error'
                })
            },

            // 列表排序
            handleSort(prop, order){
                const that = this;
                [that.order, that.condition, that.tables.page.cur] = ['', '', 1];
                that.$router.replace({path: `?page=1`});
                switch (prop){
                    case 'retail':
                        that.order = '1';
                        that.condition = order === 'ascending' ? '1' : order === 'descending' ? '0' : '';
                        break;
                    case 'on_sale_count':
                        that.order = '2';
                        that.condition = order === 'ascending' ? '1' : order === 'descending' ? '0' : '';
                        break;
                    case 'total_sale':
                        that.order = '3';
                        that.condition = order === 'ascending' ? '1' : order === 'descending' ? '0' : '';
                        break;
                    case 'shop_num':
                        that.order = '4';
                        that.condition = order === 'ascending' ? '1' : order === 'descending' ? '0' : '';
                        break;
                }
                that.getList()
            },

            // 获取详情数据
            getDetail(id){
                const that = this, detail = that.detail;
                [detail.show, detail.loading] = [true, true];
                that.$ajax.get('sale/sku_detail', {
                    params: {
                        g_sku_id: id
                    }
                }).then(res => {
                    const datas = res.result;
                    detail.detailData.top = {
                        img: datas.pic_small,
                        name: datas.g_sku_name
                    }
                    detail.detailData.infos = [
                        {title: '基础信息', info: [
                            {name: '条形码', val: datas.barcode},
                            {name: '所属分类', val: datas.g_c_name},
                            {name: '单位', val: datas.g_u_name},
                            {name: '品牌', val: datas.g_b_name}
                        ]},
                        {title: '价格信息', info: [
                            {name: '进货单价', val: datas.min_purchase_price === datas.max_purchase_price ? datas.max_purchase_price : `￥${datas.min_purchase_price} ~ ${datas.max_purchase_price}`},
                            {name: '零售价', val: datas.min_price === datas.max_price ? datas.max_price : `￥${datas.min_price} ~ ${datas.max_price}`},
                            {name: '会员价', val: datas.min_member_price === datas.max_member_price ? datas.max_member_price : `￥${datas.min_member_price} ~ ${datas.max_member_price}`},
                            {name: '利润率', val: datas.min_profit === datas.max_profit ? `￥${datas.max_profit.toFixed(2)}%` : `￥${datas.min_profit.toFixed(2)}% ~ ${datas.max_profit.toFixed(2)}%`}
                        ]}
                    ]
                    detail.loading = false
                }).catch(err => {
                    that.$util.showMessage(err, 'error');
                    detail.loading = false
                })
            }
        }
    }
</script>
