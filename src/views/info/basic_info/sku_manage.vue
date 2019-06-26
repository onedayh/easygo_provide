<template>
    <div id="skuManage">
        <div v-show="!showType">
            <eg-filter
                class="sku-fliter"
                :noStatus="Boolean(true)"
                :noDate="Boolean(true)"
                placeholder="条形码或商品名称"
                @search="filters.search"
                @exportData="filters.exportData"
            >
                <div class="filter-slot">
                    <el-button @click="changeType('add')">添加商品</el-button>
                    <el-button @click="imports" class="export import">批量导入商品</el-button>
                    <el-button @click="downs" class="export down">下载模板</el-button>
                </div>
            </eg-filter>
            <eg-table
                :options="tables.options"
                :tableData="tables.tableData"
                :feedback="tables.feedback"
                :page="tables.page"
                @handle="tables.handle"
                @handleSort="tables.handleSort"
                @handlePage="tables.handlePage"
            />
            <eg-detail
                v-show="detail.show"
                :show="detail.show"
                :loading="detail.loading"
                :detailData="detail.detailData"
                @close="detail.close"
            />
        </div>
        <div v-show="showType">
            <p class="tips">
                <i @click="showType = ''">sku管理</i>
                <span>/ {{showType === 'add' ? '添加商品' : showType === 'edit' ? '编辑商品' : ''}}</span>
            </p>
            <el-form :model="formData" ref="formData" :rules="rules" label-width="140px">
                <div class="form-mode">
                    <h5>基础信息</h5>
                    <el-form-item label="条形码" prop="barcode">
                        <el-input v-model="formData.barcode" placeholder="请输入条形码"></el-input>
                    </el-form-item>
                    <el-form-item label="商品名称" prop="name">
                        <el-input v-model="formData.name" placeholder="请输入商品名称"></el-input>
                    </el-form-item>
                    <el-form-item label="所属分类" required>
                        <el-form-item prop="first" class="seed">
                            <el-select v-model="formData.firstClassify" placeholder="一级分类">
                                <el-option v-for="item in firstClassifyList" :key="item.s_c_id" :label="item.s_c_name" :value="item.s_c_id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item prop="second" class="seed">
                            <el-select v-model="formData.secondClassify" placeholder="二级分类">
                                <el-option v-for="item in secondClassifyList" :key="item.s_c_id" :label="item.s_c_name" :value="item.s_c_id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form-item>
                    <el-form-item label="单位" class="short-input">
                        <el-select v-model="formData.unit" placeholder="请选择单位">
                            <el-option v-for="(item, index) in unitList" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="箱规" class="short-input">
                        <el-input v-model="formData.boxsize" placeholder="请输入箱规"></el-input>
                    </el-form-item>
                    <el-form-item label="品牌">
                        <el-autocomplete v-model="formData.brand" :fetch-suggestions="querySearch" placeholder="请输入品牌名称进行搜索" @select="handleSelect"></el-autocomplete>
                    </el-form-item>
                </div>
                <div class="form-mode">
                    <h5>价格信息</h5>
                    <el-form-item label="供货价" prop="price" class="short-input">
                        <el-input v-model="formData.price" placeholder="请输入进货单价"></el-input>
                    </el-form-item>
                    <el-form-item label="建议零售价" prop="s_price" class="short-input">
                        <el-input v-model="formData.s_price" placeholder="请输入零售价"></el-input>
                    </el-form-item>
                </div>
                <div class="form-mode">
                    <h5>备注</h5>
                    <el-form-item label="备注" prop="remark">
                        <el-input type="textarea" maxlength="400" v-model="formData.remark" placeholder="输入备注说明（400字以内）"></el-input>
                    </el-form-item>
                </div>
                <el-button class="submit" @click="submitData('formData')">保存</el-button>
            </el-form>
        </div>
    </div>
</template>

<script>
    import filters from '@/components/filters';
    import tables from '@/components/tables';
    import detail from '@/components/detail';
    export default {
        data(){
            // 数字正则验证
            const validateNum = (rules, value, callback) => {
                if(value && !/^\d+(\.\d+)?$/.test(value)){
                    callback(new Error('请输入正确的数字'))
                }else{
                    callback()
                }
            }
            return{
                showType: '',
                keyword: '',
                order: '',
                filters: {
                    search: val => {
                        console.log(val)
                    },
                    exportData: (keyword, start_time, end_time, status) => {
                        console.log(keyword, start_time, end_time, status)
                    }
                },
                tables: {
                    options: [
                        {prop: 'barcode', label: '条形码'},
                        {prop: 'sup_sku_name', label: '商品名称', width: 180, overflow: true},
                        {prop: 'g_u_name', label: '单位', center: true},
                        {prop: 'box_size', label: '箱规'},
                        {prop: 's_c_name', label: '所属品类'},
                        {prop: 'purchase_price', label: '供货价', sort: 'custom'},
                        {label: '操作', center: true, width: 120, slot: [
                            {type: 'edit', name: '编辑'},
                            {type: 'detail', name: '详情'},
                            {type: 'delete', name: '删除'}
                        ]}
                    ],
                    tableData: [],
                    feedback: '',
                    page: {
                        cur: 1,
                        size: 20,
                        total: 0
                    },
                    handle: (row, type) => {
                        if(type === 'edit'){

                        }else if(type === 'detail'){

                        }else if(type === 'delete'){

                        }
                    },
                    handleSort: (prop, order) => {

                    },
                    handlePage: val => {

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
                                {name: 'SKU编号', value: ''},
                                {name: '条形码', value: ''},
                                {name: '所属分类', value: ''},
                                {name: '单位', value: ''},
                                {name: '箱规', value: ''},
                                {name: '品牌', value: ''}
                            ]},
                            {title: '价格信息', info: [
                                {name: '供货价', value: ''},
                                {name: '建议零售价', value: ''}
                            ]},
                        ]
                    },
                    close: () => {
                        this.detail.show = false
                    }
                },
                formData: {
                    barcode: '',
                    name: '',
                    first: '',
                    second: '',
                    unit: '',
                    boxsize: '',
                    brand: '',
                    price: '',
                    s_price: '',
                    remark: '',
                    firstClassify: '',
                    secondClassify: ''
                },
                rules: {
                    barcode: [
                        {required: true, message: '请输入条形码'}
                    ],
                    name: [
                        {required: true, message: '请输入商品名称'}
                    ],
                    first: [
                        {required: true, message: '请选择一级分类'}
                    ],
                    second: [
                        {required: true, message: '请选择二级分类'}
                    ],
                    price: [
                        {required: true, message: '请输入进货单价'},
                        { validator: validateNum}
                    ],
                    s_price: [
                        { validator: validateNum}
                    ]
                },
                // 一级分类列表
                firstClassifyList: [],
                // 二级分类列表
                secondClassifyList: [],
                // 单位列表
                unitList: [
                    {id: 1, name: 'dd'},
                    {id: 2, name: 'aa'},
                    {id: 3, name: 'ss'},
                    {id: 4, name: 'qq'},
                    {id: 5, name: 'ee'}
                ],
                // 品牌列表
                brandList: [
                    {id: 1, value: 'dd'},
                    {id: 2, value: 'aa'},
                    {id: 3, value: 'ss'},
                    {id: 4, value: 'qq'},
                    {id: 5, value: 'ee'}
                ]
            }
        },

        components: {
            'eg-filter': filters,
            'eg-table': tables,
            'eg-detail': detail
        },

        created(){
            this.getList()
        },

        methods: {
            // 获取列表数据
            getList(){
                const that = this, tables = that.tables;
                [tables.tableData, tables.feedback] = [[], 'loading'];
                that.$ajax.get('data/sku_list', {
                    params: {
                        keyword: that.keyword,
                        page: tables.page.cur,
                        page_limit: tables.page.size,
                        order: that.order,          // 1 进货价升序 2进货价降序
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.list.length > 0 && datas.count > 0){
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.list, datas.count]
                }).catch(err => {
                    that.$util.showMessage(err, 'error')
                })
            },

            // 改变页面显示类型
            changeType(type){
                const that = this;
                that.showType = type;
                if(type){
                    if(that.firstClassifyList.length === 0) that.getClassifyList();
                    if(type === 'add'){
                        that.$router.replace({path: `?page=${that.tables.page.cur}&type=add`})
                    }else if(type === 'edit'){
                        that.$router.replace({path: `?page=${that.tables.page.cur}&type=edit`})
                    }
                }
            },

            // 获取详情
            getDetail(){

            },

            // 导入
            imports(){

            },

            // 下载模板
            downs(){

            },

            // 模糊搜索
            querySearch(queryString, cb){
                const that = this;
                const result = queryString ? that.brandList.filter(that.createFilter(queryString)) : that.brandList;
                cb(result)
            },

            // 选择品牌
            handleSelect(val){
                console.log(val)
            },

            createFilter(queryString) {
                return (brand) => {
                    return (brand.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                }
            },

            // 提交数据
            submitData(formName){
                const that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        alert('submit!');
                    } else {
                        return false;
                    }
                });
            },

            // 获取分类
            getClassifyList(id = ''){
                const that = this;
                that.$ajax.get('data/get_cate', {
                    params: {
                        parent_id: id
                    }
                }).then(res => {
                    const datas = res.result.list;
                    if(id){
                        that.secondClassifyList = datas
                    }else{
                        that.firstClassifyList = datas;
                        that.secondClassifyList = []
                    }
                })
            }
        }
    }
</script>