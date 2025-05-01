const mongoose = require('mongoose')
const leaveSchema = mongoose.Schema({
  orderNo: String,
  applyType: Number,//申请类型  1:事假 2：调休 3:年假
  startTime: {
    type: Date,
    default: Date.now()
  },
  endTime: {
    type: Date,
    default: Date.now()
  },
  applyUser: {
    userId: Number,
    userName: String,
    userEmail: String
  },
  leaveTime: String,
  reasons: String,
  auditUsers: String,
  curAuditUserName: String,
  applyState: {
    type: Number,
    default: 1
  },
  auditFlows: [
    {
      userId: Number,
      userName: String,
      userEmail: String
    }
  ],
  auditLogs: [
    {
      userId: Number,
      userName: String,
      createTime: Date,
      remark: String,
      action: String
    }
  ],
  createTime: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('leave', leaveSchema, 'leaves')