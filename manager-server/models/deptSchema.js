const mongoose = require('mongoose')
const deptSchema = mongoose.Schema(
    {
        parentId: [mongoose.Types.ObjectId],
        deptName: String,
        userId: Number,
        userName: String,
        userEmail: String,
        "updateTime": {
            type: Date,
            default: Date.now()
        },
        "createTime": {
            type: Date,
            default: Date.now()
        }
    }
)

module.exports = mongoose.model('dept', deptSchema, 'depts')