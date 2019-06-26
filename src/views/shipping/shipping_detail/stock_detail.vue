<template>
    <div id="shippingRecond">
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
                        {prop: 'g_c_name', label: '所属品类', overflow: true, width: 200},
                        {prop: 'inventory', label: '库存', sort: 'custom'},
                        {prop: 'purchase_price', label: '供货单价', sort: 'custom', width: 100},
                        {prop: 'warehouse_name', label: '仓库名称', width: 80},
                        {label: '操作', slot: [{type: 'detail', name: '详情'}], width: 100}
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
                        if(type === 'detail') this.getDetail(row)
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
                        infos: [
                            {title: '基础信息', info: [
                                {name: 'SKU编号', val: ''},
                                {name: '条形码', val: ''},
                                {name: '商品名称', val: ''},
                                {name: '所属分类', val: ''},
                                {name: '单位', val: ''},
                                {name: '品牌', val: ''},
                                {name: '所在仓库', val: ''},
                                {name: '库存', val: ''}
                            ]},
                            {title: '价格信息', info: [
                                {name: '最低供货价', val: ''},
                                {name: '最高供货价', val: ''},
                                {name: '建议零售价', val: ''}
                            ]},
                            {title: '备注', info: [
                                {name: '备注说明', val: ''}
                            ]}
                        ]
                    },

                    // 关闭详情
                    close: () => {
                        this.detail.show = false
                    },
                },
                filters: {
                    statusList: [],

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
                        window.open(`${that.$ajax.defaults.baseURL}warehouse/sku_list_export?lc=${ss_id}&ity_order=${that.ity_order}&purchase_order=${that.purchase_order}&g_w_id=${status}&keyword=${keyword}`)
                    }
                },

                ity_order: '',          // 库存排序 1-2
                purchase_order: '',     // 进货价排序 1-2
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
            const that = this, query = that.$route.query, queryArr = Object.keys(query);
            if(queryArr.length > 0 && query.page) that.tables.page.cur =  Number(query.page);
            that.getList();
            that.getWarehoser()
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
            // 获取仓库列表
            getWarehoser(){
                const that = this;
                that.$ajax.get('warehouse/get_warehouse').then(res => {
                    let datas = res.result, list = [{id: '', name: '全部仓库'}];
                    if(datas.length > 0){
                        datas.forEach(item => {
                            list.push({id: item.g_w_id, name: item.warehouse_name})
                        })
                        that.filters.statusList = list
                    }
                }).catch(err => {
                    that.$util.showMessage(err, 'error')
                })
            },

            // 清空详情数据
            emptyDetail(){
                let that = this, datas = that.detail.detailData.infos;
                datas.forEach(item => {
                    item.info.forEach(it => {
                        it.val = ''
                    })
                })
                that.detail.detailData.infos = datas
            },

            // 获取列表数据
            getList(){
                let that = this, tables = that.tables;
                [tables.tableData, tables.feedback] = [[], 'loading'];
                that.$ajax.get('warehouse/get_sku_list', {
                    params: {
                        page: tables.page.cur,              // 当前页
                        page_limit: tables.page.size,       // 每页数量
                        ity_order: that.ity_order,          // 库存排序 1-asc 2-desc
                        purchase_order: that.purchase_order,// 进货价排序 1-asc 2-desc
                        g_w_id: that.status,                // 入库记录的状态 0-审核中，1-已完成，2-已驳回
                        keyword: that.keyword               // 搜索关键字
                    }
                }).then(res => {
                    let datas = res.result;
                    if(datas.count > 0 && datas.sku_data.length > 0){
                        datas.sku_data.forEach(item => {
                            const purchase_price = item.purchase_price;
                            item.purchase_price = purchase_price === '-1.00' ? '' : `￥${purchase_price}`
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.sku_data, datas.count]
                }).catch(err =>{
                    that.$util.showMessage(err, 'error');
                    tables.feedback = 'error'
                })
            },

            // 列表排序
            handleSort(prop, order){
                const that = this;
                [that.ity_order, that.purchase_order, that.tables.page.cur] = ['', '', 1];
                that.$router.replace({path: `?page=1`});
                switch (prop){
                    case 'inventory':
                        that.purchase_order = '';
                        that.ity_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                    case 'purchase_price':
                        that.ity_order = '';
                        that.purchase_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                }
                that.getList()
            },

            // 获取详情数据
            getDetail(row){
                const detail = this.detail;
                [detail.show, detail.loading] = [true, true];
                detail.detailData.infos = [
                    {title: '基础信息', info: [
                        {name: 'SKU编号', val: row.g_sku_id},
                        {name: '条形码', val: row.barcode},
                        {name: '商品名称', val: row.g_sku_name},
                        {name: '所属分类', val: row.g_c_name},
                        {name: '单位', val: row.g_u_name},
                        {name: '品牌', val: row.g_b_name},
                        {name: '所在仓库', val: row.warehouse_name},
                        {name: '库存', val: row.inventory}
                    ]},
                    {title: '价格信息', info: [
                        {name: '最低供货价', val: `￥${row.min_purchase_price}`},
                        {name: '最高供货价', val: `￥${row.max_purchase_price}`},
                        {name: '建议零售价', val: `￥${row.retail_price}`}
                    ]},
                    {title: '备注', info: [
                        {name: '备注说明', val: row.remark}
                    ]}
                ]
                detail.loading = false
            }
        }
    }
</script>
