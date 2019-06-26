<template>
    <div id="shippingRecond">
        <div v-show="!showType">
            <eg-filter
                :statusList="filters.statusList"
                placeholder="单据编号"
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
                <p><span>收货时间：</span>{{detailData.create_time}}</p>
                <p><span>采购时间：</span>{{detailData.purchase_time}}</p>
                <p><span>经办人：</span>{{detailData.creator}}</p>
                <p><span>审批人：</span>{{detailData.auditor}}</p>
                <p><span>结算方式：</span>
                    {{
                        detailData.pay_type === '1' ? '记账' :
                        detailData.pay_type === '2' ? '现结' :
                        detailData.pay_type === '3' ? '月结' : ''
                    }}
                </p>
                <div :class="[
                        detailData.order_status === '0' ? 'pending' :
                        detailData.order_status === '1' ? 'passed' :
                        detailData.order_status === '2' ? 'not-pass' : ''
                ]">
                    {{
                        detailData.order_status === '0' ? '审核中' :
                        detailData.order_status === '1' ? '已完成' :
                        detailData.order_status === '2' ? '已驳回' : ''
                    }}
                </div>
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
                        {prop: 'order_num', label: '出货单号', width: 120},
                        {prop: 'purchase_time', label: '收货日期', sort: 'custom', center: true, width: 200},
                        {prop: 'warehouse_name', label: '出货仓库'},
                        {prop: 'creator', label: '经办人'},
                        {prop: 'purchase_value', label: '出货货值', sort: 'custom'},
                        {prop: 'order_status', label: '状态', render: [
                            {myTarget: '被驳回', myClass: 'reject'}
                        ]},
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
                        if(type === 'detail') this.getDetail(row.s_o_id)
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
                        {id: '0', name: '审核中'},
                        {id: '1', name: '已完成'},
                        {id: '2', name: '已驳回'}
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
                        window.open(`${that.$ajax.defaults.baseURL}warehouse/out_list_export?lc=${ss_id}&order=${that.order}&condition=${that.condition}&order_status=${status}&start_date=${start_time}&end_date=${end_time}&keyword=${keyword}`)
                    }
                },

                order: '',
                condition: '',
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
                        {prop: 'purchase_price', label: '供货价'},
                        {prop: 'count', label: '出货数量'},
                        {prop: 'value', label: '总计'}
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
                if(!val){   // 显示列表
                    [that.detailData, that.detailTable.data] = [{}, []];
                    that.$router.replace({path: `?page=${that.tables.page.cur}`})
                }
            },
            '$route.query'(val){
                const queryArr = Object.keys(val), that = this;
                if(queryArr.length === 0){  // 点击二级菜单
                    if(that.showType === ''){
                        that.$router.replace({path: `?page=${that.tables.page.cur}`})
                    }else{
                        that.showType = ''
                    }
                }
            }
        },
        methods: {
            // 获取列表数据
            getList(){
                const that = this, tables = that.tables;
                [tables.tableData, tables.feedback] = [[], 'loading'];
                that.$ajax.get('warehouse/out_list', {
                    params: {
                        page: tables.page.cur,              // 当前页
                        page_limit: tables.page.size,       // 每页数量
                        order: that.order,                  // 排序数据, desc  asc
                        condition: that.condition,          // 排序字段, purchase_time purchase_value
                        order_status: that.status,          // 入库记录的状态 0-审核中，1-已完成，2-已驳回
                        start_date: that.start_time,        // 开始日期
                        end_date: that.end_time,            // 结束日期
                        keyword: that.keyword               // 搜索关键字
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.count > 0 && datas.data.length > 0){
                        datas.data.forEach(item => {
                            let status = item.order_status === '0' ? '审核中' :
                                         item.order_status === '1' ? '已完成' :
                                         item.order_status === '2' ? '已驳回' : '';
                            item.order_status = status;
                            item.purchase_time = that.$util.getLocalTime({data: item.purchase_time});
                            item.purchase_value = `￥${item.purchase_value}`;
                        })
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.data, datas.count]
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
                    case 'purchase_time':
                        that.condition = 'purchase_time';
                        that.order = order === 'ascending' ? '0' : order === 'descending' ? '1' : '';
                        break;
                    case 'purchase_value':
                        that.condition = 'purchase_value';
                        that.order = order === 'ascending' ? '0' : order === 'descending' ? '1' : '';
                        break
                }
                that.getList()
            },

            // 获取详情数据
            getDetail(id){
                const that = this, detailTable = that.detailTable;
                [that.id, that.showType, detailTable.feedback] = [id, 'detail', 'loading'];
                that.$router.replace({path: `?page=${that.tables.page.cur}&detail=${that.id}`});
                that.$ajax.get('warehouse/out_detail', {
                    params: {
                        s_o_id: id
                    }
                }).then(res => {
                    let datas = res.result, list = datas.purchaseData, detail = datas.orderData;
                    detail.create_time = that.$util.getLocalTime({data: detail.create_time});
                    detail.purchase_time = that.$util.getLocalTime({data: detail.purchase_time});
                    that.detailData = Object.assign({}, detail);
                    if(Array.isArray(list) && list.length > 0){
                        let totalCount = 0, totalValue = 0, totalPrice = 0;
                        list.forEach((item, index) => {
                            totalCount += Number(item.count);
                            totalValue += Number(item.value);
                            totalPrice += Number(item.purchase_price);
                            item.purchase_price = `￥${Number(item.purchase_price).toFixed(2)}`;
                            item.value = `￥${Number(item.value).toFixed(2)}`;
                            if(item.box_size.indexOf('*') === -1 && item.box_size.indexOf('.') > -1) item.box_size = Math.round(Number(item.box_size));
                            item['index'] = index + 1
                        });
                        list.push({
                            index: '总计',
                            purchase_price: `￥${totalPrice.toFixed(2)}`,
                            count: totalCount,
                            value: `￥${totalValue.toFixed(2)}`
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
                window.open(`${that.$ajax.defaults.baseURL}warehouse/out_detail_export?lc=${ss_id}&s_o_id=${that.id}`)
            }
        }
    }
</script>
