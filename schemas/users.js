/**
 * Created by Administrator on 2017/3/12.
 */
//首先引入模块 用于连接数据库
var mongoose = require('mongoose');

//用户的表结构  并且把定义好的对象暴露出去 通过操作models来对数据进行增删改查的
module.exports = new mongoose.Schema({
    username : String,
    password : String,
    repassword : String,
    isAdmin : {
        type :Boolean,
        default:false
    }

    //区分普通用户和管理员用户，只需要增加一个字段就行了
});