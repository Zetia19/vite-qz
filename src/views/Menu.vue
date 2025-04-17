<template>
    <div class="user-manage">
        <!-- query-form、base-table、action是index.scss的默认样式 -->
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm" class="user-form">
                <el-form-item label="菜单名称" prop="menuName">
                    <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称"/>
                </el-form-item>
                <el-form-item label="菜单状态" prop="menuState">
                    <el-select v-model="queryForm.menuState" placeholder="菜单状态"  clearable style="width: 120px;">
                        <el-option :value="1" label="正常"></el-option>
                        <el-option :value="2" label="停用"></el-option>
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
    <el-dialog v-model="showModal" title="用户新增" width="30%"  @close="handleClose">
        <el-form ref="dialogForm" :model="menuForm" label-width="100px" :rules="rules">
            <el-form-item label="父级菜单" prop="parentId">
            <el-cascader
                v-model="menuForm.parentId"
                :options="menuList"
                :props="{ checkStrictly: true, value: '_id', label: 'menuName' }"
                clearable
            />
            <span>不选，则直接创建一级菜单</span>
            </el-form-item>
            <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="menuForm.menuType">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item
          label="菜单图标"
          prop="icon"
          v-show="menuForm.menuType == 1"
        >
          <el-input v-model="menuForm.icon" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item
          label="路由地址"
          prop="path"
          v-show="menuForm.menuType == 1"
        >
          <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item
          label="权限标识"
          prop="menuCode"
          v-show="menuForm.menuType == 2"
        >
          <el-input v-model="menuForm.menuCode" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item
          label="组件路径"
          prop="component"
          v-show="menuForm.menuType == 1"
        >
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item
          label="菜单状态"
          prop="menuState"
          v-show="menuForm.menuType == 1"
        >
          <el-radio-group v-model="menuForm.menuState">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">停用</el-radio>
          </el-radio-group>
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
    name: 'menu',
    setup(){
        //快速初始化一个对象，ctx是上下文的全局对象(获取Composition API上下文对象)
        const { proxy } = getCurrentInstance()

        const menuForm = {
            parentId: [null],
            menuType: 1,
            menuState: 1,
        }
        // 初始化分页器对象
        const pager = reactive({
            pageNum:1,
            pageSize:10,
        })
        // 弹框显示对象
        const showModal = ref(false)
        // 新增queryForm对象
        const queryForm = reactive({
            menuState: 1,
        })
        // 菜单列表
        const menuList = ref([])
        // 定义用户操作行为
        const action = ref('')

        // 表单校验规则
        const rules = reactive({
            menuName: [
          {
            required: true,
            message: "请输入菜单名称",
            trigger: "blur",
          },
          {
            min: 2,
            max: 10,
            message: "长度在2-8个字符",
            trigger: "blur",
          },
        ],
        })
        // 定义动态表格格式
        const colums = reactive([
        {
          label: "菜单名称",
          prop: "menuName",
          width: 150,
        },
        {
          label: "图标",
          prop: "icon",
        },
        {
          label: "菜单类型",
          prop: "menuType",
          formatter(row, column, value) {
            return {
              1: "菜单",
              2: "按钮",
            }[value];
          },
        },
        {
          label: "权限标识",
          prop: "menuCode",
        },
        {
          label: "路由地址",
          prop: "path",
        },
        {
          label: "组件路径",
          prop: "component",
        },
        {
          label: "菜单状态",
          prop: "menuState",
          width: 90,
          formatter(row, column, value) {
            return {
              1: "正常",
              2: "停用",
            }[value];
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
            getMenuList();
        })

        // 获取菜单列表
        const getMenuList = async ()=>{
            try {
                let list = await proxy.$api.getMenuList(this.queryForm);
                this.menuList = list;
            } catch (e) {
                throw new Error(e);
            }
        }
        // 查询，获取用户列表
        const handleQuery = ()=>{
            getMenuList();
        }
        // 重置
        const handleReset = (form)=>{
            proxy.$refs[form].resetFields()
        }
        // 分页事件处理
        // 页码改变时触发,并传递新的页码作为参数。
        const handleCurrentChange = (val)=>{ 
            pager.pageNum = val;
            getUserList()
        }
        // 删除
        const handleDel = async (_id)=>{
        // ?
        await proxy.$api.menuSubmit({ _id, action: "delete" });
        proxy.$message.success("删除成功");
        getMenuList();
    }

        // 新增用户
        const handleCreate = ()=>{
            action.value = 'add';
            showModal.value = true;
        }
        // 关闭用户弹窗
        const handleClose = ()=>{
            showModal.value = false;
            handleReset('dialogForm'); // 重置表单
        }
        // 提交
        const handleSubmit = ()=>{
            proxy.$refs.dialogForm.validate( async (valid)=>{
                if(valid){
                    let params = toRaw(menuForm);
                    params.action=action.value;
                    let res = await proxy.$api.userSubmit(params);
                    if(res){
                        showModal.value = false;
                        proxy.$message.success('操作成功')
                        handleReset('dialogForm'); // 重置表单
                        getMenuList()
                    }
                }
            })
        }
        // 编辑
        const handleEdit = (row)=>{
            showModal.value = true;
            action.value = 'edit';
            proxy.$nextTick(()=>{
                Object.assign(menuForm, row);
            })
            
        }
        return {
            menuForm,
            pager,
            showModal,
            queryForm,
            menuList,
            action,
            rules,
            colums,
            getMenuList,
            handleQuery,
            handleReset,
            handleCurrentChange,
            handleDel,
            handleCreate,
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