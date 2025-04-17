<template>
    <div class="user-manage">
        <!-- query-form、base-table、action是index.scss的默认样式 -->
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="user" class="user-form">
                <el-form-item label="用户ID" prop="userId">
                    <el-input v-model="user.userId" placeholder="请输入用户ID"/>
                </el-form-item>
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="user.userName" placeholder="请输入用户名"/>
                </el-form-item>
                <el-form-item label="用户状态" prop="state">
                    <el-select v-model="user.state" placeholder="用户状态"  clearable style="width: 120px;">
                        <el-option :value="0" label="所有"></el-option>
                        <el-option :value="1" label="在职"></el-option>
                        <el-option :value="2" label="离职"></el-option>
                        <el-option :value="3" label="试用期"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                    <!-- 指该表单的ref属性：form -->
                    <el-button @click="handleReset('form')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleCreate">新增</el-button>
                <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
            </div>
            <el-table :data="userList" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column 
                 v-for="item in colums" 
                 :key="item.prop"
                 :prop="item.prop" 
                 :label="item.label" 
                 :width="item.width"
                 :formatter="item.formatter"
                  />
                <el-table-column fixed="right" label="操作" min-width="60">
                    <template #default="scope">
                        <el-button @click="handleEdit(scope.row)" size="small">
                        编辑
                        </el-button>
                        <el-button type="danger" size="small" 
                        @click="handleDel(scope.row)">
                            删除
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
    </div>



    <!-- 新增用户弹框 -->
    <el-dialog v-model="showModal" title="新增用户" width="30%"  @close="handleClose">
        <el-form ref="dialogForm" :model="userForm" label-width="100px" :rules="rules">
            <el-form-item label="用户名" prop="userName">
                <!-- v-model:双向绑定 -->
                <el-input v-model="userForm.userName" :disabled="action=='edit'" placeholder="请输入用户名称"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="userEmail">
                <el-input v-model="userForm.userEmail" :disabled="action=='edit'" placeholder="请输入用户邮箱">
                    <template #append>@vueqz.com</template>
                </el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="userForm.mobile" placeholder="请输入手机号"/>
            </el-form-item>
            <el-form-item label="岗位" prop="job">
                <el-input v-model="userForm.job" placeholder="请输入岗位"/>
            </el-form-item>
            <el-form-item label="状态" prop="state" style="width: 60%;">
                <el-select v-model="userForm.state" placeholder="用户状态">
                    <el-option :value="1" label="在职"></el-option>
                    <el-option :value="2" label="离职"></el-option>
                    <el-option :value="3" label="试用期"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="系统角色" prop="roleList">
                <!-- multiple：多选 -->
                <el-select v-model="userForm.roleList" 
                placeholder="请选择用户系统角色"
                multiple
                style="width: 80%;">
                    <el-option v-for="role in roleList" 
                    :key="role._id" 
                    :label="role.roleName"
                    :value="role._id"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="部门" prop="deptId">
                <el-cascader 
                style="width: 80%"
                v-model="userForm.deptId"
                placeholder="请选择所属部门"
                :options="deptList" 
                :props="{ checkStrictly: true,value:'_id',label:'deptName'}" 
                clearable />
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
</template>

<script>
import { getCurrentInstance, onMounted , reactive , ref, toRaw} from 'vue'
import utils from '../uitls/utils';

export default {
    name: 'user',
    setup(){
        //快速初始化一个对象，ctx是上下文的全局对象(获取Composition API上下文对象)
        const { proxy } = getCurrentInstance()

        // 初始化用户表单对象
        //  reactive 是Vue3中提供的响应式API，用于创建响应式对象（引用类型）
        const user = reactive({
            state:1
        });
        // ref 是Vue3中提供的响应式API，用于创建响应式引用（基本类型）
        const userList = ref([]);
        // 初始化分页器对象
        const pager = reactive({
            pageNum:1,
            pageSize:10,
        })
        // 定义选中的用户列表的对象
        const checkedUserIds = ref([])
        // 弹框显示对象
        const showModal = ref(false)
        // 新增用户userForm对象
        const userForm = reactive({
            // 默认值
            state:3
        })
        // 角色列表
        const roleList = ref([])
        // 部门列表
        const deptList = ref([])
        // 定义用户操作行为
        const action = ref('add')


        // 表单校验规则
        const rules = reactive({
            userName:[
                {required:true,message:'请输入用户名称',trigger:'blur'},
                {min:3,max:10,message:'长度在3到10个字符',trigger:'blur'}
            ],
            userEmail:[{required:true,message:'请输入用户邮箱',trigger:'blur'}],
            deptId:[{required:true,message:'请选择部门',trigger:'blur'}],
            mobile:[
                {pattern:/^1[3-9]\d{9}$/,message:'手机号格式不正确',trigger:'blur'}
            ],
        })
        // 定义动态表格格式
        const colums = reactive([
           {
            label:'用户ID',
            prop:'userId',
            width:'200px',
           }, 
           {
            label:'用户名称',
            prop:'userName',
            width:'200px',
           }, 
           {
            label:'用户邮箱',
            prop:'userEmail',
            width:'200px',
           }, 
           {
            label:'用户角色',
            prop:'role',
            // 将role的值转换为对应的角色名称
            // formatter是一个函数，用于格式化单元格的值。
            // 类似的有parser函数，配合表单输入控件（输入框），将用户输入的值转换为程序需要的数据格式。此处是表格，只能使用formatter函数。
            formatter(row,column,value){
                // row是当前行的数据对象，column是当前列的对象，value是当前单元格的值。
                // 此处的value是role的值，即0或1。
                return {
                    0:'管理员',
                    1:'普通用户',
                }[value]
            },
            width:'150px',
           }, 
           {
            label:'用户状态',
            prop:'state',
            width:'150px',
            formatter(row,column,value){
                return {
                    1:'在职',
                    2:'离职',
                    3:'试用期',
                }[value]
            },
           }, 
           {
            label:'用户注册时间',
            prop:'createTime',
            formatter(row,column,value){
                return utils.formateDate(new Date(value))
            },
           }, 
           {
            label:'最后登录时间',
            prop:'lastLoginTime',
            formatter(row,column,value){
                return utils.formateDate(new Date(value))
            },
           } 
        ])

        // 初始化接口调用
        onMounted(()=>{
            getUserList();
            getRoletList();
            getDeptList();
        })

        // 获取用户列表
        const getUserList = async ()=>{
            let params ={
                ...user,...pager
            }
            try{
                const { list, page } = await proxy.$api.getUserList(params)
                userList.value = list;
                pager.total = page.total;
            } catch(err){
                console.log(err)
            }
        }
        // 查询，获取用户列表
        const handleQuery = ()=>{
            getUserList();
        }
        // 重置查询表单
        const handleReset = (form)=>{
        // 需要给表单配置ref名称(form) 和 给输入框配置prop属性(user对象属性名userId),获取表单实例
         // ElementPlus 提供的 resetFields方法,用于重置表单字段。
        //  因为查询和新增用户对话框中都需要重置，动态获取form表单实例，让重置方法共用
            proxy.$refs[form].resetFields()
        }
        // 分页事件处理
        // 页码改变时触发,并传递新的页码作为参数。
        const handleCurrentChange = (val)=>{ 
            pager.pageNum = val;
            getUserList()
        }
        // 删除单个用户
        const handleDel = async (row)=>{
        try{
            await proxy.$api.userDel({
                userIds:[row.userId],
            });
            proxy.$message.success('删除成功')
            getUserList()
        } catch (err) {
                console.error('删除失败:', err.response?.data);
                proxy.$message.error(err.message);
        }
    }

        // 批量删除用户
        const handlePatchDel = async ()=>{
            if(checkedUserIds.value.length == 0){
                proxy.$message.error('请至少选择一条数据');
                return
            }
            const res = await proxy.$api.userDel({
                userIds:checkedUserIds.value
            })
            if(res.modifiedCount > 0){
                proxy.$message.success('删除成功')
                getUserList()
            }else{
                proxy.$message.error('修改失败')
            }
        }

        // 表格选择
        const handleSelectionChange = (list)=>{
            console.log(list); // 选中的数据
            let arr =[]
            list.map(item=>{
                arr.push(item.userId)
            })
            checkedUserIds.value = arr
        }
        // 新增用户
        const handleCreate = ()=>{
            action.value = 'add';
            showModal.value = true;
        }
        // 获取部门列表
        const getDeptList = async () =>{
            let dept = await proxy.$api.getDeptList()
            deptList.value = dept;
        }
        // 获取角色列表
        const getRoletList = async () =>{
            let list = await proxy.$api.getRoleList()
            roleList.value = list;
        }
        // 关闭用户弹窗
        const handleClose = ()=>{
            showModal.value = false;
            handleReset('dialogForm'); // 重置表单
        }
        // 用户提交
        const handleSubmit = ()=>{
            // 表单校验，validate方法会执行所有表单项的校验规则。
            // 校验通过，回调函数中的valid参数为true，否则为false。
            proxy.$refs.dialogForm.validate( async (valid)=>{
                if(valid){
                    // toRaw:将响应式对象转换为普通对象(不会直接更改输入框字段)
                    let params = toRaw(userForm);
                    params.userEmail += '@vueqz.com';
                    params.action=action.value;
                    let res = await proxy.$api.userSubmit(params);
                    if(res){
                        showModal.value = false;
                        proxy.$message.success('新增成功')
                        handleReset('dialogForm'); // 重置表单
                        getUserList()
                    }
                }
            })
        }
        // 用户编辑
        const handleEdit = (row)=>{
            action.value = 'edit';
            showModal.value = true;
            proxy.$nextTick(()=>{
                // Object.assign:将一个或多个源对象的可枚举属性复制到目标对象中。
                // 将row对象的值赋值给userForm对象
                Object.assign(userForm,row) 
            })
            
        }
        return {
            user,
            userList,
            roleList,
            deptList,
            action,
            colums,
            pager,
            checkedUserIds,
            getUserList,
            handleQuery,
            handleReset,
            handleCurrentChange,
            handleDel,
            handlePatchDel,
            handleSelectionChange,
            handleCreate,
            showModal,
            userForm,
            rules,
            getDeptList,
            getRoletList,
            handleClose,
            handleSubmit,
            handleEdit,
        }
    }
}
</script>

<style lang="scss">
.action{
    text-align: left;
}
</style>