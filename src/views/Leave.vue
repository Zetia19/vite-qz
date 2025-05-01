<template>
    <div class="leave-manage">
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
                <el-button 
                type="primary" 
                @click="handleApply"
                v-has="'leave-create'">申请休假</el-button>
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
                        @click="handleDetail(scope.row)" 
                        v-has="'leave-query'"
                        size="small" type="primary">
                        查看
                        </el-button>
                        <el-button 
                        type="danger" size="small" 
                        v-has="'leave-delete'"
                        v-if="[1,2].includes(scope.row.applyState)"
                        @click="handleDel(scope.row._id)">
                            作废
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
    <el-dialog v-model="showModal" title="申请休假" width="30%"  @close="handleClose">
            <el-form ref="dialogForm" :model="leaveForm" label-width="100px" :rules="rules">
                <el-form-item label="休假类型" prop="applyType" required>
                    <el-select v-model="leaveForm.applyType">
                        <el-option :value="1" label="事假"></el-option>
                        <el-option :value="2" label="调休"></el-option>
                        <el-option :value="3" label="年假"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="休假类型" required>
                    <el-row>
                        <el-col :span=8>
                            <el-form-item prop="startTime" required>
                                <el-date-picker
                                v-model="leaveForm.startTime"
                                type="date"
                                placeholder="选择开始日期"
                                @change="(val)=>handleDateChange('startTime',val)"
                            />
                            </el-form-item>
                        </el-col>
                        <el-col :span="1">-</el-col>
                        <el-col :span=8>
                            <el-form-item prop="endTime" required>
                                <el-date-picker
                                v-model="leaveForm.endTime"
                                type="date"
                                placeholder="选择结束日期"
                                @change="(val)=>handleDateChange('endTime',val)"
                            />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="休假时长" required>
                    {{leaveForm.leaveTime}}
                </el-form-item>
                <el-form-item label="休假原因" prop="reasons">
                    <el-input 
                        type="textarea"
                        :rows="3"
                        v-model="leaveForm.reasons"
                        placeholder="请输入休假原因"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleClose">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">
                    确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-dialog title="申请休假详情" width="40%" v-model="showDetailModal">
            <el-steps 
                :active="detail.applyState > 2 ? 3 : detail.applyState" 
                finish-status="success" 
                align-center >
                <el-step title="待审批" />
                <el-step title="审批中" />
                <el-step title="审批通过/审批拒绝" />
            </el-steps>
            <el-form label-width="120px" label-suffix=":">
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
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { getCurrentInstance, onMounted , reactive , ref, toRaw} from 'vue'
import utils from '../uitls/utils';

export default {
    name: 'leave',
    setup(){
        const { proxy } = getCurrentInstance()
        const pager = reactive({
            pageNum:1,
            pageSize:10,
            total:0
        })
        const showModal = ref(false)
        const showDetailModal = ref(false)
        const detail = ref({})
        const applyList = ref([])
        const leaveForm = reactive({ 
            applyType:1,
            startTime:'',
            endTime:'',
            leaveTime:'0天',
            reasons:'',
        })
        const queryForm = reactive({
            applyState:''
        })
        const action = ref('create')


        // 表单校验规则
        const rules = reactive({
            startTime:[
             {
                type:'data',
                required:true,
                message:'请选择开始时间',
                trigger:'change'
             }
            ],
            endTime:[
             {
                type:'data',
                required:true,
                message:'请选择结束时间',
                trigger:'change'
             }
            ],
            reasons:[
             {
                required:true,
                message:'请输入休假原因',
                trigger:['change','blur']
             }
            ],
        })
        // 定义动态表格格式
        const colums = reactive([
           {
            label:'单号',
            prop:'orderNo',
            width:'150px',
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
            formatter(row,column,value){
                return utils.formateDate(new Date(value))
            },
           }, 
           {
            label:'审批人',
            prop:'auditUsers'
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
            let params = {...queryForm,...pager}
            let { list,page } = await proxy.$api.getApplyList(params)
            applyList.value = list;
            pager.total = page.total;
        }

        // 点击申请休假-显示弹窗
        const handleApply = ()=>{
            showModal.value = true;
            action.value = 'create'
        }

        // 查询，获取审批列表
        const handleQuery = ()=>{
            getApplyList()
        }
        // 重置查询表单
        const handleReset = (form)=>{
            proxy.$refs[form].resetFields()
            leaveForm.leaveTime = '0天';
        }
        // 分页事件处理
        const handleCurrentChange = (val)=>{ 
            pager.pageNum = val;
            getApplyList()
        }
        // 关闭用户弹窗
        const handleClose = ()=>{
            showModal.value = false;
            handleReset('dialogForm'); // 重置表单
        }
        // 用户提交
        const handleSubmit = ()=>{
            proxy.$refs.dialogForm.validate( async (valid)=>{
                if(valid){
                    let params = {...leaveForm};
                    params.action=action.value;
                    let res = await proxy.$api.leaveOperate(params);
                    if(res){
                        showModal.value = false;
                        proxy.$message.success('申请休假成功')
                        handleReset('dialogForm');
                        getApplyList()
                    }
                }
            })
        }
        // 获取休假时长
        // key是startTime或endTime，val是时间戳。
        // 当startTime和endTime都有值时，计算两者的差值，然后除以1000*60*60*24，得到天数。
        const handleDateChange = (key,val)=>{
            let { startTime,endTime } = leaveForm;
            if( !startTime || !endTime) return;
            if(startTime > endTime){
                proxy.$message.error('开始时间不能晚于结束时间')
                leaveForm.leaveTime = '0天'
                // 报错并清空字段
                setTimeout(()=>{
                    leaveForm[key] = '';
                },0)
            } else{
                let time = endTime - startTime;
                leaveForm.leaveTime = Math.ceil(time/(1000*60*60*24)) + '天';
            }
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
        // 作废
        const handleDel = async (_id)=>{
            try{
                let params = {_id,action:'delete'}
                let res = await proxy.$api.leaveOperate(params)
                proxy.$message.success('作废成功')
                getApplyList()
            } catch(e){
                proxy.$message.error(e.message)
            }        
        }
        return {
            queryForm,
            applyList,
            leaveForm,
            detail,
            action,
            colums,
            pager,
            getApplyList,
            handleApply,
            handleQuery,
            handleReset,
            handleCurrentChange,
            showModal,
            showDetailModal,
            rules,
            handleClose,
            handleSubmit,
            handleDateChange,
            handleDetail,
            handleDel,
        }
    }
}
</script>

<style lang="scss">
.action{
    text-align: left;
}
</style>