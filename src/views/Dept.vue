<template>
    <div class="dept-manage">
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm">
                <el-form-item label="部门名称" prop="deptName">
                    <el-input v-model="queryForm.deptName" placeholder="请输入部门名称"/>
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
                @click="handleAdd"
                v-has="'dept-create'">
                创建
              </el-button>
            </div>
            <el-table :data="deptList" row-key="_id" :tree-props="{children:'children'}">
             <el-table-column
                 v-for="item in colums" 
                 :key="item.prop"
                 v-bind="item"
                  />
                <el-table-column fixed="right" label="操作" width="260">
                    <template #default="scope">
                        <el-button size="small" type="primary"
                        v-has="'dept-edit'"
                        @click="handleEdit(scope.row)" >
                        编辑
                        </el-button>
                        <el-button type="danger" size="small" 
                        v-has="'dept-delete'"
                        @click="handleDel(scope.row._id)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
            class="pagination" 
            background 
            layout="prev, pager, next" 
            :total="pager.total"
            :page-size="pager.pageSize"
            @current-change="handleCurrentChange" />
        </div>
        <!-- 新增用户弹框 -->
        <el-dialog 
        v-model="showModal" 
        :title="action=='create'?'创建部门':'编辑部门'" 
        width="30%"  
        @close="handleClose">
            <el-form 
            ref="dialogForm" 
            :model="deptForm" 
            label-width="100px" 
            :rules="rules">
              <el-form-item label="上级部门" prop="parentId">
              <el-cascader
                  v-model="deptForm.parentId"
                  :options="deptList"
                  :props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
                  clearable
              />
              </el-form-item>
              <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="deptForm.deptName" placeholder="请输入部门名称"/>
              </el-form-item>
              <el-form-item label="负责人" prop="user">
                <el-select 
                v-model="deptForm.user" 
                placeholder="请选择负责人" 
                @change="handleUser"
                >
                  <el-option 
                  v-for="item in userList" 
                  :key="item.userId"
                  :label="item.userName"
                  :value="`${item.userId}/${item.userName}/${item.userEmail}`"
                  > 
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="负责人邮箱" prop="userEmail">
              <el-input 
                v-model="deptForm.userEmail" 
                placeholder="请输入负责人邮箱"
                disabled/>
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
    </div>
 </template>

<script>
import { getCurrentInstance, onMounted , reactive , ref, toRaw} from 'vue'
import utils from '../uitls/utils';

export default {
    name: 'dept',
    setup(){
        const { proxy } = getCurrentInstance()
        // 弹框显示对象
        const showModal = ref(false)
        // 分页对象
        const pager = reactive({
            total: 0, // 总条数
            pageSize: 10, // 每页条数
            currentPage: 1, // 当前页码
        })
        // 新增queryForm对象
        const queryForm = reactive({
          deptName:''
        })
        const deptForm = reactive({
          deptName:'',
          parentId:[null]
        })
        // 角色列表
        const deptList = ref([])
        const userList = ref([])
        // 定义用户操作行为
        const action = ref('')

        // 表单校验规则
        const rules = reactive({
          parentId: [
          {
            required: true,
            message: "请选择上级部门",
            trigger: "blur",
          },
        ],
          deptName: [
          {
            required: true,
            message: "请输入部门名称",
            trigger: "blur",
          },
        ],
          user: [
          {
            required: true,
            message: "请选择负责人",
            trigger: "blur",
          },
        ]
        })
        // 定义动态表格格式
        const colums = reactive([
        {
          label: "部门名称",
          prop: "deptName",
          width: 250,
        },
        {
          label: "负责人",
          prop: "userName",
        },
        {
          label: "更新时间",
          prop: "updateTime",
          formatter(row, column, value) {
            return utils.formateDate(new Date(value));
          },
        },
        {
          label: "创建时间",
          prop: "createTime",
          formatter(row, column, value) {
            return utils.formateDate(new Date(value));
          },
        },
        ])

        // 初始化接口调用
        onMounted(()=>{
          getDeptList();
          // getUserList();
          getAllUserList();
        })
        // 获取用户列表
        const getAllUserList = async ()=>{
           let list = await proxy.$api.getAllUserList();
           userList.value = list || [];
        }
        const handleUser = (val)=>{
          if(val){
            const [userId,userName,userEmail] = val.split('/');
            Object.assign(deptForm,{userId,userName,userEmail})
          } 
        }
        // 获取部门列表
        const getDeptList = async ()=>{
            try {
                const params = {...queryForm};
                let list = await proxy.$api.getDeptList(params);
                deptList.value = list;
            } catch (e) {
              console.error('请求失败:', e); 
              proxy.$message.error('获取菜单失败');
            }
        }
        // 查询
        const handleQuery = ()=>{
          getDeptList();
        }
        // 重置
        const handleReset = (form)=>{
            proxy.$refs[form].resetFields()
        }
        // 删除
        const handleDel = async (_id)=>{
          await proxy.$api.deptOperate({ _id, action: "delete" });
          proxy.$message.success("删除成功");
          getDeptList();
      }
        // 新增部门
        const handleAdd = ()=>{
            showModal.value = true;
            action.value = 'create';
            proxy.$nextTick(()=>{
              handleReset('dialogForm'); // 重置表单
            })
        }
        // 编辑
        const handleEdit = (row)=>{
            showModal.value = true;
            action.value = 'edit';
            proxy.$nextTick(()=>{
              Object.assign(deptForm,row,{
              user: `${row.userId}/${row.userName}/${row.userEmail}`,
            });
          })
        }
        // 关闭弹窗
        const handleClose = ()=>{
            showModal.value = false;
            handleReset('dialogForm');
        }
        // 提交
        const handleSubmit = async ()=>{
            proxy.$refs.dialogForm.validate( async (valid)=>{
                if(valid){
                    let params = {...deptForm,action}
                    delete params.user
                    params.action = action.value
                    let res = await proxy.$api.deptOperate(params);
                    proxy.$message.success('操作成功')
                    handleClose()
                    getDeptList()
                }
            })
        }
        // 分页
        const handleCurrentChange = (val)=>{ 
            pager.pageNum = val;
            getDeptList()
        }
       
        return {
            showModal,
            pager,
            queryForm,
            deptForm,
            userList,
            deptList,
            action,
            rules,
            colums,
            getDeptList,
            handleUser,
            handleQuery,
            handleReset,
            handleDel,
            handleSubmit,
            handleClose,
            handleAdd,
            handleEdit,
            handleCurrentChange,
        }
    }
}
</script>

<style lang="scss">
.action{
    text-align: left;
}
</style>