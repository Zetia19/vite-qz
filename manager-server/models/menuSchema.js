const mongoose = require('mongoose')
const menuSchema = mongoose.Schema(
    {
        menuType: Number,
        menuState: Number,
        menuName: String,
        menuCode: String,
        path: String,
        icon: String,
        component: String,
        parentId: [mongoose.Types.ObjectId],
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

module.exports = mongoose.model('menu', menuSchema, 'menus')