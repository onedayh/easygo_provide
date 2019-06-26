<template>
    <div id="goodsWater">
        <eg-filter
            :noStatus="Boolean(true)"
            placeholder="商品名称或条形码"
            @search="filters.search"
            @timeValue="filters.timeValue"
            @exportData="filters.exportData"
        />
        <eg-table
            :tableData="tables.tableData"
            :options="tables.options"
            :feedback="tables.feedback"
            :page="tables.page"
            @handleSort="tables.handleSort"
            @handlePage="tables.handlePage"
        />
    </div>
</template>

<script>
    import tables from '@/components/tables';
    import filters from '@/components/filters';

    export default {
        data(){
            return{
                start_time: '',
                end_time: '',
                keyword: '',
                t_order: '',            // 日期排序 1升序2降序
                price_order: '',        // 价格排序 1升序2降序
                filters: {
                    search: val => {
                        const that = this;
                        [that.tables.page.cur, that.keyword] = [1, val];
                        that.getList()
                    },
                    exportData: (keyword, start_time, end_time) => {
                        const that = this, ss_id = that.$store.state.userInfo.session_id;
                        window.open(`${that.$ajax.defaults.baseURL}sale/sale_flow_export?lc=${ss_id}&s_time=${start_time}&e_time=${end_time}&keyword=${keyword}&t_order=${that.t_order}&price_order=${that.price_order}`)
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
                        {prop: 'barcode', label: '条形码'},
                        {prop: 'g_sku_name', label: '商品名称'},
                        {prop: 'create_time', label: '售出日期', sort: 'custom', center: true},
                        {prop: 'sell_price', label: '零售价', sort: 'custom'},
                        {prop: 'shop_name', label: '销售门店'}
                    ],
                    feedback: '',
                    page: {
                        cur: 1,
                        size: 20,
                        total: 0
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
                }
            }
        },
        components: {
            'eg-table': tables,
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
                tables.tableData = [];
                tables.feedback = 'loading';
                that.$ajax.get('sale/sale_flow', {
                    params: {
                        s_time: that.start_time,
                        e_time: that.end_time,
                        page: that.tables.page.cur,
                        page_limit: that.tables.page.size,
                        keyword: that.keyword,
                        t_order: that.t_order,                  // 日期排序 1升序2降序
                        price_order: that.price_order,          // 价格排序 1升序2降序
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.list.length > 0 && datas.total_count > 0){
                        datas.list.forEach(item => {
                            item.create_time = that.$util.getLocalTime({data: item.create_time});
                            item.sell_price = `￥${item.sell_price}`
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.list, datas.total_count]
                }).catch(err => {
                    tables.feedback = 'error';
                    that.$util.showMessage(err, 'error')
                })
            },

            // 列表排序
            handleSort(prop, order){
                const that = this;
                let [t_order, price_order] = ['', ''];
                switch (prop){
                    case 'create_time':
                        t_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                    case 'sell_price':
                        price_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                }
                [that.t_order, that.price_order, that.tables.page.cur] = [t_order, price_order, 1];
                that.getList()
            }
        }
    }
</script>
