<template>
    <div id="brandManage">
        <el-button style="margin: 10px 0 20px 0" @click="showDialog('add')">添加品牌</el-button>
        <eg-table
            :tableData="tables.tableData"
            :options="tables.options"
            :page="tables.page"
            :feedback="tables.feedback"
            @handlePage="tables.handlePage"
            @handle="tables.handle"
        />
        <el-dialog :title="type === 'add' ? '新增品牌' : type === 'edit' ? '编辑品牌' : ''" :visible.sync="dialogVisible">
            <p class="tit">品牌名称</p>
            <input class="dialog-input" v-model="brandName" v-if="dialogVisible" v-focus placeholder="输入品牌名" type="text">
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="!brandName" @click="submitBrand">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import tables from '@/components/tables';

    export default {
        data(){
            return{
                tables: {
                    tableData: [],
                    options: [
                        {prop: 's_b_name', label: '品牌名称'},
                        {label: '操作', center: true, slot: [
                            {type: 'edit', name: '编辑'},
                            {type: 'delete', name: '删除'}
                        ]}
                    ],
                    page: {
                        cur: 1,
                        size: 20,
                        total: 0
                    },
                    feedback: '',
                    handlePage: val => {
                        const that = this;
                        that.tables.page.cur = val;
                        that.getList()
                    },
                    handle: (row, type) => {
                        const that = this;
                        if(type === 'edit'){
                            that.id = row.s_b_id;
                            that.showDialog('edit')
                        }else if(type === 'delete'){
                            that.deleteBrand(row.s_b_id)
                        }
                    }
                },
                type: '',
                id: '',
                brandName: '',
                dialogVisible: false
            }
        },

        components: {
            'eg-table': tables
        },

        watch: {
            dialogVisible(val){
                if(!val){
                    const that = this;
                    [that.id, that.brandName] = ['', '']
                }
            }
        },

        created(){
            this.getList()
        },

        methods: {
            // 获取列表
            getList(){
                const that = this, tables = that.tables;
                [tables.tableData, tables.feedback] = [[], 'loading'];
                that.$ajax.get('data/get_brand', {
                    params: {
                        type: 2
                    }
                }).then(res => {
                    const datas = res.result;
                    if(datas.list.length > 0 && datas.count > 0){
                        tables.feedback = ''
                    }else{
                        tables.feedback = 'empty'
                    }
                    [tables.tableData, tables.page.total] = [datas.list, datas.total]
                }).catch(err => {
                    that.$util.showMessage(err, 'error');
                    tables.feedback = 'error'
                })
            },

            // 显示弹窗
            showDialog(type){
                const that = this;
                [that.type, that.dialogVisible] = [type, true]
            },

            // 提交品牌
            submitBrand(){
                const that = this, url = that.type === 'add' ? 'add_brand' : that.type === 'edit' ? 'mod_brand' : '';
                that.$ajax.get(`data/${url}`, {
                    params: {
                        s_b_id: that.id,
                        s_b_name: that.brandName
                    }
                }).then(() => {
                    that.$util.showMessage('保存成功');
                    [that.dialogVisible, that.tables.page.cur] = [false, 1];
                    that.getList()
                }).catch(err => {
                    that.$util.showMessage(err, 'error')
                })
            },

            // 删除品牌
            deleteBrand(id){
                const that = this;
                that.$ajax.get('data/delete_brand', {
                    params: {
                        s_b_id: id
                    }
                }).then(() => {
                    that.$util.showMessage('删除成功');
                    that.getList()
                }).catch(err => {
                    that.$util.showMessage(err, 'error')
                })
            }
        }
    }
</script>