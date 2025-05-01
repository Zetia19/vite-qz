<template>
    <div class="role-manage">
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="queryForm.roleName" placeholder="请输入角色名称"/>
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
                v-has:add="'role-create'">
                创建
              </el-button>
            </div>
            <el-table :data="roleList" >
             <el-table-column
                 v-for="item in colums" 
                 :key="item.prop"
                 :prop="item.prop" 
                 :label="item.label" 
                 :width="item.width"
                 :formatter="item.formatter"
                  />
                <el-table-column fixed="right" label="操作" width="260">
                    <template #default="scope">
                        <el-button size="small"
                        v-has="'role-edit'"
                        @click="handleEdit(scope.row)" >
                        编辑
                        </el-button>
                        <el-button type="primary" size="small" 
                        v-has="'role-setting'"
                        @click="handleOpenPermission(scope.row)">
                          设置权限
                        </el-button>
                        <el-button type="danger" size="small" 
                        v-has="'role-delete'"
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
        <el-dialog v-model="showModal" title="角色新增" width="30%"  @close="handleClose">
            <el-form ref="dialogForm" 
            :model="roleForm" 
            label-width="100px" 
            :rules="rules">
                <el-form-item label="角色名称" prop="roleName">
                  <el-input v-model="roleForm.roleName" placeholder="请输入角色名称"/>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                  <el-input 
                  type="textarea" 
                  :row="2"
                  v-model="roleForm.remark" 
                  placeholder="请输入备注" />
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
        <!-- 权限弹框 -->
        <el-dialog v-model="showPermission" title="设置权限" 
         width="30%"  @close="showPermission = false">
            <el-form 
            label-width="100px" >
                <el-form-item label="角色名称" >
                  {{ curRoleName }}
                </el-form-item>
                <el-form-item label="选择权限">
                  <el-tree
                    ref="permissionTree"
                    :data="menuList"
                    default-expand-all
                    show-checkbox
                    node-key="_id"
                    :props="{label: 'menuName', children: 'children'}"
                  />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showPermission = false">取消</el-button>
                    <el-button type="primary" @click="handlePermissionSubmit">
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
    name: 'role',
    setup(){
        //快速初始化一个对象，ctx是上下文的全局对象(获取Composition API上下文对象)
        const { proxy } = getCurrentInstance()
        // 弹框显示对象
        const showModal = ref(false)
        // 权限弹框显示对象
        const showPermission = ref(false)
        const curRoleName = ref('')
        const curRoleId = ref('')
        // 菜单映射表
        const actionMap = ref({});
        // 新增queryForm对象
        const queryForm = reactive({
            roleName:''
        })
        const roleForm = reactive({
            roleName:''
        })
        // 角色列表
        const roleList = ref([])
        const menuList = ref([])
        // 定义用户操作行为
        const action = ref('')
        // 初始化分页器对象
        const pager = reactive({
            pageNum:1,
            pageSize:10,
            total:0
        })

        // 表单校验规则
        const rules = reactive({
          roleName: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur",
          },
        ]
        })
        // 定义动态表格格式
        const colums = reactive([
        {
          label: "角色名称",
          prop: "roleName",
          width: 250,
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "权限列表",
          prop: "permissionList",
          wideth: 230,
          formatter(row, column, value) {
            let names = []
            let list = value.halfCheckedKeys || []
            list.map(key=>{
              let name = actionMap.value[key]
              // actionMap是响应式对象，不能直接使用actionMap[key]来获取值
              // 或使用toRaw()将其转换为普通对象
              if (key && name)names.push(name)
            })
            return names.join(',')
          },
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
            getRoleList();
            getMenuList();
        })

        // 获取菜单列表
        const getMenuList = async ()=>{
          try {
                let list = await proxy.$api.getMenuList();
                menuList.value = list;
                getActionMap(list);
            } catch (e) {
              console.error('请求失败:', e); // 添加错误日志
              proxy.$message.error('获取菜单失败');
            } 
        }
        const getActionMap = (list)=>{
          let allActionMap = {}; // 存储所有菜单的权限
          const deep = (arr) =>{
            while(arr.length){
              let item = arr.pop()
              // 最后一级
              if(item.children && item.action){
                allActionMap[item._id] = item.menuName;
              }
              // 一级菜单
              if(item.children && !item.action){
                deep(item.children)
              }
            }
          }
          deep(JSON.parse(JSON.stringify(list)));
          // console.log('获取到的权限映射表actionMap:', allActionMap);
          actionMap.value = allActionMap;
        }
        // 获取角色列表
        const getRoleList = async ()=>{
            try {
                const params = {...queryForm,...pager};
                let { list,page } = await proxy.$api.getRoleList(params);
                roleList.value = list;
                pager.total = page.total;
            } catch (e) {
              console.error('请求失败:', e); 
              proxy.$message.error('获取菜单失败');
            }
        }
        // 查询
        const handleQuery = ()=>{
          getRoleList();
        }
        // 重置
        const handleReset = (form)=>{
            proxy.$refs[form].resetFields()
        }
        // 删除
        const handleDel = async (_id)=>{
          await proxy.$api.roleOperate({ _id, action: "delete" });
          proxy.$message.success("删除成功");
          getRoleList();
      }
        // 新增用户
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
              roleForm._id = row._id;
              roleForm.roleName = row.roleName;
              roleForm.remark = row.remark;
            })
        }
        // 关闭用户弹窗
        const handleClose = ()=>{
            showModal.value = false;
            handleReset('dialogForm'); // 重置表单
        }
        // 提交
        const handleSubmit = async ()=>{
            proxy.$refs.dialogForm.validate( async (valid)=>{
                if(valid){
                    let params = {...roleForm,action}
                    params.action = action.value
                    let res = await proxy.$api.roleOperate(params);
                    showModal.value = false;
                    proxy.$message.success('操作成功')
                    handleReset('dialogForm'); // 重置表单
                    getRoleList()
                }
            })
        }
        // 设置权限弹框
        const handleOpenPermission = (row)=>{
          showPermission.value = true;
          curRoleName.value = row.roleName; 
          curRoleId.value = row._id;
          let { checkedKeys } = row.permissionList;
          setTimeout(()=>{
            proxy.$refs.permissionTree.setCheckedKeys(checkedKeys);
          })
        }
        // 提交权限
        const handlePermissionSubmit = async ()=>{
          let nodes = proxy.$refs.permissionTree.getCheckedNodes();
          let halfKeys = proxy.$refs.permissionTree.getHalfCheckedKeys();
          let checkedKeys = []; //选中菜单的按钮
          let parentKeys = [];  //选中菜单
          nodes.map((node) => {
            if(!node.children){  
              checkedKeys.push(node._id);
            }else{
              parentKeys.push(node._id);
            }
          });
          let params = {
            _id:curRoleId.value,
            permissionList:{
              checkedKeys,
              halfCheckedKeys:parentKeys.concat(halfKeys),
            }
          }
          await proxy.$api.updatePermission(params);
          showPermission.value = false;
          proxy.$message.success('权限设置成功')
          getRoleList();
        } 

        // 分页
        const handleCurrentChange = (val)=>{ 
            pager.pageNum = val;
            getRoleList()
        }
        return {
            showModal,
            menuList,
            queryForm,
            curRoleId,
            roleForm,
            roleList,
            pager,
            action,
            rules,
            colums,
            getRoleList,
            handleQuery,
            handleReset,
            handleDel,
            handleSubmit,
            handleClose,
            handleCurrentChange,
            handleAdd,
            handleEdit,
            showPermission,
            curRoleName,
            handleOpenPermission,
            handlePermissionSubmit,
        }
    }
}
</script>

<style lang="scss">
.action{
    text-align: left;
}
</style>