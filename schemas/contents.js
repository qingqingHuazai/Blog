/**
 * Created by Administrator on 2017/3/12.
 */
//首先引入模块 用于连接数据库
var mongoose = require('mongoose');

//内容的表结构  并且把定义好的对象暴露出去 通过操作models来对数据进行增删改查的
module.exports = new mongoose.Schema({
    //关联字段,不能随便定义成一个字符串，内容分类的id
    category:{
        type: mongoose.Schema.Types.ObjectId,
        //引用另外一张表
        ref:'Category'
    },

    //标题
    title : String,

    //关联字段,用户id
    user:{
        type: mongoose.Schema.Types.ObjectId,
        //引用另外一张表
        ref:'User'
    },

    //添加时间
    addTime :{
        type:Date,
        default: new Date()
    },
    //阅读量
    views:{
        type:Number,
        default:0
    },
    //简介
    description:{
        type:String,
        default:''
    },

    //内容
    content:{
        type:String,
        default:''
    }
    ,
    //评论
    comments:{
        type:Array,
        default:[]
    }


    //区分普通用户和管理员用户，只需要增加一个字段就行了
});