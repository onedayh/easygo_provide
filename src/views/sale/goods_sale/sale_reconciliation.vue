<template>
    <div id="saleReconciliation">
        <eg-filter
            :noStatus="Boolean(true)"
            placeholder="商品名称或条形码"
            @search="filters.search"
            @exportData="filters.exportData"
            @timeValue="filters.timeValue"
        />
        <eg-table
            :tableData="tables.tableData"
            :options="tables.options"
            :feedback="tables.feedback"
            :page="tables.page"
            @handle="tables.handle"
            @handleSort="tables.handleSort"
            @handlePage="tables.handlePage"
        />
        <transition name="slide-fade">
            <eg-detail
                v-show="detail.show"
                :show="detail.show"
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
                start_time: '',
                end_time: '',
                keyword: '',
                order: '',              // 1 总销量 2 总订单额 3总支付额 4在售
                condition: '',
                filters: {
                    search: val => {
                        const that = this;
                        [that.tables.page.cur, that.keyword] = [1, val];
                        that.getList()
                    },
                    exportData: (keyword, start_time, end_time) => {
                        const that = this, ss_id = that.$store.state.userInfo.session_id;
                        window.open(`${that.$ajax.defaults.baseURL}sale/sale_bill_export?lc=${ss_id}&start_time=${start_time}&end_time=${end_time}&keyword=${keyword}&order=${that.order}&condition=${that.condition}`)
                    },
                    timeValue: (start_time, end_time) => {
                        const that = this;
                        [that.tables.page.cur, that.start_time, that.end_time] = [1, start_time, end_time];
                        that.getList()
                    }
                },
                tables: {
                    tableData: [],
                    options: [
                        {prop: 'barcode', label: '条形码', width: 150},
                        {prop: 'g_sku_name', label: '商品名称', width: 200, overflow: true},
                        {prop: 'total_sale', label: '总销量', sort: 'custom'},
                        {prop: 'total_sell_price', label: '总订单额', sort: 'custom'},
                        {prop: 'total_paid_price', label: '总支付额', sort: 'custom'},
                        {prop: 'on_sale_count', label: '在售', sort: 'custom'},
                        {label: '操作', slot: [{name: '销售记录', type: 'sale_record'}], center: true}
                    ],
                    feedback: '',
                    page: {
                        cur: 1,
                        size: 20,
                        total: 0
                    },
                    // 列表操作
                    handle: (row, type) => {
                        if(type === 'sale_record') this.getDetail(row.g_sku_id)
                    },

                    // 页码切换
                    handlePage: val => {
                        const that = this;
                        that.tables.page.cur = val;
                        that.$router.replace({path: `?page=${val}`});
                        that.getList()
                    },

                    // 列表排序
                    handleSort: (prop, order) => {
                        this.handleSort(prop, order)
                    }
                },
                detail: {
                    show: false,
                    detailData: {
                        title: '销售记录',
                        table: {
                            tab: ['销售记录'],
                            options: [
                                {prop: 'create_time', label: '销售时间', center: true},
                                {prop: 'sell_price', label: '订单金额', center: true}
                            ],
                            tableData: [],
                            feedback: ''
                        }
                    },
                    // 关闭详情
                    close: () => {
                        this.detail.show = false
                    }
                }
            }
        },
        components: {
            'eg-table': tables,
            'eg-detail': detail,
            'eg-filter': filters
        },
        created(){
            // 依据路由参数，加载数据
            const that = this, query = that.$route.query, queryArr = Object.keys(query);
            if(queryArr.length > 0){
                that.tables.page.cur = query.page ? Number(query.page) : 1
            }
            this.getList()
        },
        watch: {
            '$route.query'(val){
                const queryArr = Object.keys(val), that = this;
                if(queryArr.length === 0){  // 点击二级菜单
                    that.$router.replace({path: `?page=${that.tables.page.cur}`})
                }
            }
        },
        methods: {
            // 获取列表数据
            getList(){
                const that = this, tables = that.tables;
                [tables.tableData, tables.feedback] = [[], 'loading'];
                that.$ajax.get('sale/sale_bill', {
                    params: {
                        start_time: that.start_time,
                        end_time: that.end_time,
                        page: that.tables.page.cur,
                        page_limit: that.tables.page.size,
                        keyword: that.keyword,
                        order: that.order,              // 1 总销量 2 总订单额 3总支付额 4在售
                        condition: that.condition       // 1升序 2降序
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.count > 0 && datas.list.length > 0){
                        datas.list.forEach(item => {
                            item.total_sell_price = `￥${item.total_sell_price ? item.total_sell_price : '0.00'}`;
                            item.total_paid_price = `￥${item.total_paid_price ? item.total_paid_price : '0.00'}`;
                            item.on_sale_count = item.on_sale_count ? item.on_sale_count : '0'
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.list, datas.count]
                }).catch(err => {
                    tables.feedback = 'error';
                    that.$util.showMessage(err, 'error')
                })
            },

            // 列表排序
            handleSort(prop, order){
                const that = this;
                let [_order, condition] = ['', ''];
                switch (prop){
                    case 'total_sale':
                        [_order, condition] = order === 'ascending' ? ['1', '1'] : order === 'descending' ? ['1', '2'] : ['', ''];
                        break;
                    case 'total_sell_price':
                        [_order, condition] = order === 'ascending' ? ['2', '1'] : order === 'descending' ? ['2', '2'] : ['', ''];
                        break;
                    case 'total_paid_price':
                        [_order, condition] = order === 'ascending' ? ['3', '1'] : order === 'descending' ? ['3', '2'] : ['', ''];
                        break;
                    case 'on_sale_count':
                        [_order, condition] = order === 'ascending' ? ['4', '1'] : order === 'descending' ? ['4', '2'] : ['', ''];
                        break;
                }
                [that.order, that.condition, that.tables.page.cur] = [_order, condition, 1];
                that.getList()
            },

            // 获取销售记录
            getDetail(id){
                const that = this, tables = that.detail.detailData.table;
                [that.detail.show, tables.tableData, tables.feedback] = [true, [], 'loading'];
                that.$ajax.get('sale/sale_history', {
                    params: {
                        g_sku_id: id
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.length > 0){
                        datas.forEach(item => {
                            item.create_time = that.$util.getLocalTime({data: item.create_time});
                            item.sell_price = `￥${item.sell_price}`
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    tables.tableData = datas
                }).catch(err => {
                    tables.feedback = 'error';
                    that.$util.showMessage(err, 'error')
                })
            }
        }
    }
</script>
