/** 
 * 负责与数据库交互，增删改查等操作
 * 定义一个用户模型，用于操作数据库中的用户表
 */ 
const mongoose = require('mongoose')
const usersSchema = mongoose.Schema({
  "userId":Number,   // 用户ID，自增长
  "userName":String,
  "userPwd":String,  //md5加密，123456
  "userEmail":String,
  "mobile":String,
  "sex":Number,    // 性别： 0：男  1：女
  "deptId":[],    //部门，101
  "job":String,
  "state":{
    type:Number,
    default:1
  },   //1：在职  2：离职  3：试用期
  "role":{
    type:Number,
    default:0
  },    // 用户角色  0：系统管理员  1：普通用户
  "roleList":[],    // 系统角色
  "createTime":{
    type:Date,
    default:Date.now()
  }, //创建时间
  "lastLoginTime":{
    type:Date,
    default:Date.now()
  },   //更新时间
  remark:String   // 备注
})

module.exports = mongoose.model('user',usersSchema,'users')