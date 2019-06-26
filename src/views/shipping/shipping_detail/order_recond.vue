<template>
    <div id="shippingRecond">
        <div v-show="!showType">
            <eg-filter
                :statusList="filters.statusList"
                placeholder="订单号"
                @search="filters.search"
                @timeValue="filters.timeValue"
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
        </div>

        <div v-show="showType === 'detail'">
            <p class="tips">
                <i @click="showType = ''">出货明细</i>
                <span>/ 详情</span>
            </p>
            <div class="clear-float">
                <p><span>订单号：</span>{{detailData.order_num}}</p>
                <p><span>下单时间：</span>{{detailData.create_time}}</p>
                <p></p>
                <p><span>经办人：</span>{{detailData.creator}}</p>
                <p><span>结算方式：</span>{{detailData.pay_type === '1' ? '记账' : detailData.pay_type === '2' ? '现结' : detailData.pay_type === '3' ? '月结' : ''}}</p>
                <p></p>
            </div>
            <el-button size="mini" class="export no-filter" @click="exports()">导出</el-button>
            <eg-table
                :tableData="detailTable.data"
                :options="detailTable.options"
                :feedback="detailTable.feedback"
            />
        </div>
    </div>
</template>

<script>
    import tables from '@/components/tables';
    import filters from '@/components/filters';

    export default {
        data(){
            return{
                showType: '',
                tables: {
                    options: [
                        {prop: 'order_num', label: '订单号', width: 160},
                        {prop: 'create_time', label: '下单日期', sort: 'custom', center: true, width: 200},
                        {prop: 'creator', label: '经办人'},
                        {prop: 'purchase_value', label: '下单金额', sort: 'custom'},
                        {prop: 'count', label: '商品数', sort: 'custom'},
                        {prop: 'status', label: '状态'},
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
                        if(type === 'detail') this.getDetail(row.s_s_id)
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
                filters: {
                    statusList: [
                        {id: '', name: '全部状态'},
                        {id: '1', name: '发货中'},
                        {id: '2', name: '已发货'}
                    ],

                    // 关键字筛选
                    search: val => {
                        const that = this;
                        [that.keyword, that.tables.page.cur] = [val, 1];
                        that.$router.replace({path: `?page=1`});
                        that.getList()
                    },

                    // 时间筛选
                    timeValue: (start_time, end_time) => {
                        const that = this;
                        [that.start_time, that.end_time, that.tables.page.cur] = [start_time, end_time, 1];
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
                    exportData: (keyword, start_time, end_time, status) => {
                        const that = this, ss_id = that.$store.state.userInfo.session_id;
                        window.open(`${that.$ajax.defaults.baseURL}warehouse/order_list_export?lc=${ss_id}&status=${status}&pv_order=${that.pv_order}&time_order=${that.time_order}&count_order=${that.count_order}&start_time=${start_time}&end_time=${end_time}&keyword=${keyword}`)
                    }
                },

                pv_order: '',
                time_order: '',
                count_order: '',
                start_time: '',
                end_time: '',
                status: '',
                keyword: '',
                id: '',

                // 详情
                detailData: {},
                detailTable: {
                    data: [],
                    options: [
                        {prop: 'index', label: '序号', width: 80},
                        {prop: 'barcode', label: '条形码', width: 150},
                        {prop: 'su_sku_name', label: '商品名称', width: 200, overflow: true},
                        {prop: 'g_u_name', label: '单位'},
                        {prop: 'box_size', label: '箱规'},
                        {prop: 'purchase_price', label: '进货价'},
                        {prop: 'count', label: '采购数量'},
                        {prop: 'sub_total_value', label: '总计'}
                    ],
                    page:{
                        cur: 1,
                        size: 20,
                        total: 0
                    },
                    feedback: ''
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
                that.tables.page.cur = query.page ? Number(query.page) : 1;
                that.id = query.detail ? query.detail : ''
            }
            that.getList();
            if(that.id) that.getDetail(that.id)
        },
        watch: {
            showType(val){
                const that = this;
                if(!val){ // 显示列表
                    [that.detailData, that.detailTable.data] = [{}, []];
                    that.$router.replace({path: `?page=${that.tables.page.cur}`})
                }
            },
            '$route.query'(val){
                const queryArr = Object.keys(val), that = this;
                if(queryArr.length === 0){ // 点击二级菜单
                    if(that.showType === ''){
                        that.$router.replace({path: `?page=${that.tables.page.cur}`})
                    }else{
                        that.showType = '';
                    }
                }
            }
        },
        methods: {
            // 获取列表数据
            getList(){
                const that = this, tables = that.tables;
                tables.tableData = [];
                tables.feedback = 'loading';
                that.$ajax.get('warehouse/order_list', {
                    params: {
                        page: tables.page.cur,              // 当前页
                        page_limit: tables.page.size,       // 每页数量
                        pv_order: that.pv_order,            // 进货价排序 1-asc 2-desc
                        time_order: that.time_order,        // 时间排序 1-asc 2-desc
                        count_order: that.count_order,      // 商品数排序 1-asc 2-desc
                        status: that.status,                // 状态，1发货中 2已收货
                        start_time: that.start_time,        // 开始日期
                        end_time: that.end_time,            // 结束日期
                        keyword: that.keyword               // 搜索关键字
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.total_count > 0 && datas.list.length > 0){
                        datas.list.forEach(item => {
                            let status = item.status === '1' ? '发货中' :
                                         item.status === '2' ? '已发货' : '';
                            item.status = status;
                            item.create_time = that.$util.getLocalTime({data: item.create_time});
                            item.purchase_value = `￥${item.purchase_value}`;
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.list, datas.total_count]
                }).catch(err =>{
                    that.$util.showMessage(err, 'error');
                    tables.feedback = 'error'
                })
            },

            // 列表排序
            handleSort(prop, order){
                const that = this;
                [that.pv_order, that.time_order, that.count_order, that.tables.page.cur] = ['', '', '', 1];
                that.$router.replace({path: `?page=1`});
                switch (prop){
                    case 'create_time':
                        that.time_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                    case 'purchase_value':
                        that.pv_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                    case 'count':
                        that.count_order = order === 'ascending' ? '1' : order === 'descending' ? '2' : '';
                        break;
                }
                that.getList()
            },

            // 获取详情数据
            getDetail(id){
                const that = this, detailTable = that.detailTable;
                [that.id, that.showType, detailTable.feedback] = [id, 'detail', 'loading'];
                that.$router.replace({path: `?page=${that.tables.page.cur}&detail=${that.id}`});
                that.$ajax.get('warehouse/order_detail', {
                    params: {
                        s_s_id: id
                    }
                }).then(res => {
                    let datas = res.result, list = datas.list, detail = datas.detail;
                    detail.create_time = that.$util.getLocalTime({data: detail.create_time});
                    that.detailData = Object.assign({}, detail);
                    if(Array.isArray(list) && list.length > 0){
                        let totalCount = 0, totalValue = 0, totalPrice = 0;
                        list.forEach((item, index) => {
                            totalCount += Number(item.count);
                            totalValue += Number(item.sub_total_value);
                            totalPrice += Number(item.purchase_price);
                            item.purchase_price = `￥${Number(item.purchase_price).toFixed(2)}`;
                            item.sub_total_value = `￥${Number(item.sub_total_value).toFixed(2)}`;
                            if(item.box_size.indexOf('*') === -1 && item.box_size.indexOf('.') > -1) item.box_size = Math.round(Number(item.box_size));
                            item['index'] = index + 1
                        });
                        list.push({
                            index: '总计',
                            purchase_price: `￥${totalPrice.toFixed(2)}`,
                            count: totalCount,
                            sub_total_value: `￥${totalValue.toFixed(2)}`
                        })
                        detailTable.feedback = ''
                    }else{
                        detailTable.feedback = 'empty'
                    }
                    detailTable.data = list
                }).catch(err => {
                    that.$util.showMessage(err, 'error');
                    detailTable.feedback = 'error'
                })
            },

            // 导出详情数据
            exports(){
                const that = this, ss_id = that.$store.state.userInfo.session_id;
                window.open(`${that.$ajax.defaults.baseURL}warehouse/order_detail_export?lc=${ss_id}&s_s_id=${that.id}`)
            }
        }
    }
</script>
