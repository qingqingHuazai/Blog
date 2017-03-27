/**
 * Created by Administrator on 2017/3/12.
 */
var mongoose = require('mongoose');
var userschemas = require('../schemas/users');


//创建模型 然后暴露出去
//userschemas 指定的是哪一个表，User是一个对象
module.exports =  mongoose.model('User',userschemas);

