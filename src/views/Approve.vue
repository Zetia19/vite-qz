<template>
    <div class="approve-manage">
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm">
                <el-form-item label="审批状态" prop="applyState">
                    <el-select v-model="queryForm.applyState" clearable style="width: 120px;" placeholder="全部">
                        <el-option value="" label="全部"></el-option>
                        <el-option :value="1" label="待审批"></el-option>
                        <el-option :value="2" label="审批中"></el-option>
                        <el-option :value="3" label="审批拒绝"></el-option>
                        <el-option :value="4" label="审批通过"></el-option>
                        <el-option :value="5" label="作废"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                    <el-button @click="handleReset('form')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
            </div>
            <el-table :data="applyList">
                <el-table-column 
                 v-for="item in colums" 
                 :key="item.prop"
                 :prop="item.prop" 
                 :label="item.label" 
                 :width="item.width"
                 :formatter="item.formatter"
                  />
                <el-table-column fixed="right" label="操作" min-width="80">
                    <template #default="scope">
                        <el-button 
                        v-if=" [1,2].includes(scope.row.applyState) &&
                        scope.row.curAuditUserName == userInfo.userName"
                        @click="handleDetail(scope.row)" 
                        
                        size="small" type="primary">
                        审核
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页控件 -->
            <el-pagination
            class="pagination" 
            background 
            layout="prev, pager, next" 
            :total="pager.total"
            :page-size="pager.pageSize"
            @current-change="handleCurrentChange" />
        </div>

        <el-dialog 
        @close="handleClose"
        title="审核" width="35%" 
        v-model="showDetailModal">
            <el-form 
            class="dialog-form"
            :rules="rules"
            ref="dialogForm"
            :model="auditForm"
            label-width="120px" 
            label-suffix=":">
                <el-form-item label="申请人">
                    <div>{{ detail.applyUser.userName}}</div>
                </el-form-item>
                <el-form-item label="休假类型">
                    <div>{{ detail.applyTypeName }}</div>
                </el-form-item>
                <el-form-item label="休假时间">
                    <div>{{ detail.time }}</div>
                </el-form-item>
                <el-form-item label="休假时长">
                    <div>{{ detail.leaveTime }}</div>
                </el-form-item>
                <el-form-item label="休假原因">
                    <div>{{ detail.reasons }}</div>
                </el-form-item>
                <el-form-item label="审批状态">
                    <div>{{ detail.applyStateName }}</div>
                </el-form-item>
                <el-form-item label="审批人">
                    <div>{{ detail.curAuditUserName }}</div>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input 
                    type='textarea' :row="3" 
                    aria-placeholder="请输入审核备注"
                    v-model="auditForm.remark"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleApprove('pass')">审核通过</el-button>
                    <el-button type="primary" @click="handleApprove('refuse')">驳回</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { getCurrentInstance, onMounted , reactive , ref, toRaw} from 'vue'
import utils from '../uitls/utils';

export default {
    name: 'approve',
    setup(){
        const { proxy } = getCurrentInstance()
        const pager = reactive({
            pageNum:1,
            pageSize:10,
            total:0
        })
        const showDetailModal = ref(false)
        const userInfo = proxy.$store.state.userInfo;
        // 详情对象
        const detail = ref({})
        const applyList = ref([])
        const auditForm = reactive({
            remark:'',
        })
        const queryForm = reactive({
            applyState:1,
        })


        // 表单校验规则
        const rules = reactive({
            remark:[
             {
                type:'string',
                message:'请输入审核备注',
                trigger:'change'
             }
            ]
        })
        // 定义动态表格格式
        const colums = reactive([
           {
            label:'单号',
            prop:'orderNo',
            width:'150px',
           }, 
           {
            label:'申请人',
            prop:'',
            width:'80px',
            formatter(row,column,value){
                return row.applyUser.userName
            }
           }, 
           {
            label:'休假时间',
            prop:'',
            width:'200px',
            formatter(row){
                return utils.formateDate(new Date(row.startTime),"yyyy-MM-dd") 
                + '至' 
                + utils.formateDate(new Date(row.endTime),"yyyy-MM-dd")
            }
           }, 
           {
            label:'休假时长',
            prop:'leaveTime',
           }, 
           {
            label:'休假类型',
            prop:'applyType',
            formatter(row,column,value){
                return {
                    1:'事假',
                    2:'调休',
                    3:'年假',
                }[value]
            }
           }, 
           {
            label:'休假原因',
            prop:'reasons',
           }, 
           {
            label:'申请时间',
            prop:'createTime',
            width:'200px',
            formatter(row,column,value){
                return utils.formateDate(new Date(value))
            },
           }, 
           {
            label:'审批人',
            prop:'auditUsers',
            width:'200px',
           },
           {
            label:'当前审批人',
            prop:'curAuditUserName'
           },
           {
            label:'审批状态',
            prop:'applyState',
            formatter(row,column,value){
                return {
                    1:'待审批',
                    2:'审批中',
                    3:'审批拒绝',
                    4:'审批通过',
                    5:'作废',
                }[value]
            }
           },
        ])

        // 初始化接口调用
        onMounted(()=>{
            getApplyList()
        })

        // 获取审批列表
        const getApplyList = async ()=>{
            // type:审核列表
            let params = {...queryForm,...pager,type:"approve"}
            let { list,page } = await proxy.$api.getApplyList(params)
            applyList.value = list;
            pager.total = page.total;
        }

        // 查询，获取审批列表
        const handleQuery = ()=>{
            getApplyList()
        }
        // 重置查询表单
        const handleReset = (form)=>{
            proxy.$refs[form].resetFields()
        }
        // 分页事件处理
        const handleCurrentChange = (val)=>{ 
            pager.pageNum = val;
            getApplyList()
        }
        // 关闭弹窗
        const handleClose = ()=>{
            showDetailModal.value = false;
            handleReset('dialogForm'); // 重置表单
        }

        // 查看
        const handleDetail = (row)=>{
            showDetailModal.value = true; 
            let data = {...row}
            data.applyTypeName = {
                1:'事假',
                2:'调休',
                3:'年假',
            }[data.applyType]
            data.time = (
                utils.formateDate(new Date(data.startTime),"yyyy-MM-dd")
                + '至'
                + utils.formateDate(new Date(data.endTime),"yyyy-MM-dd")
            )
            data.applyStateName = {
                1:'待审批',
                2:'审批中',
                3:'审批拒绝',
                4:'审批通过',
                5:'作废',
            }[data.applyState]
            detail.value = data
        }

        // 审批通过/驳回
        const handleApprove = async (action)=>{
            proxy.$refs.dialogForm.validate(async (valid)=>{
               if(valid){
                let params = { 
                    action,
                    remark:auditForm.remark,
                    _id:detail.value._id} 
                try{
                    await proxy.$api.leaveApprove(params)
                    handleClose(); // 关闭弹窗
                    proxy.$message.success('处理成功')
                    getApplyList()  
                    proxy.$store.commit(
                        'saveNoticeCount',
                        proxy.$store.state.noticeCount - 1
                    )            
                } catch(err){}
             } 
          })
        }
       
        return {
            queryForm,
            auditForm,
            applyList,
            userInfo,
            detail,
            colums,
            pager,
            getApplyList,
            handleQuery,
            handleReset,
            handleCurrentChange,
            showDetailModal,
            rules,
            handleClose,
            handleDetail,
            handleApprove,
        }
    }
}
</script>

<style lang="scss">
.action{
    text-align: left;
}
.dialog-form{
    margin-right: 40px;
}
</style>