/**
 * Created by Administrator on 2017/3/11.
 */
var express = require('express');
var router = express.Router();

var Category = require('../models/Category');
var Content = require('../models/Content');

/*
* 处理通用的数据
*
* */
router.use(function (req,res,next) {
    data={
        userInfo : req.userInfo,
        categories : []
    }
    Category.find().then(function (categories) {
        data.categories = categories;
        next();
    })
})

router.get('/',function (req,res,next) {

    /*data = {
         category:req.query.category||'',
         count:0,
         page : Number(req.query.page||1) ,
         limit : 5,
         pages : 0,
        contents:{}
    }*/

    data.category = req.query.category||'';
    data.count = 0;
    data.page = Number(req.query.page||1);
    data.limit = 5;
    data.pages = 0;
    data.contents = {};

    var where = {};

   // res.send('首页');
    //console.log(req.userInfo);
   // console.log(req.userInfo);
    //读取所有的分类信息

    /*Category.find().then(function (categories) {
       // console.log(categories);
        res.render('main/index',{
            userInfo : req.userInfo,
            categories : categories
        });//第二个对象就是分配给这个模板使用的数组
    });*/
    //读取分类信息

    if(data.category){
        where.category = data.category;
    }
    //读取栏目
    Content.where(where).count().then(function (count) {//不要忘记了

       data.count = count;

        //计算总页数
       data.pages = Math.ceil(data.count/data.limit);//向上取整

        //取这两个数值中的最小值，当page大于pages时候，取总页数pages,
        data.page = Math.min(data.page,data.pages);
        //取这两个值的最大值，当page小于1时候，取值最大值1
        data.page = Math.max(data.page,1);
        var skip = (data.page-1)*data.limit;

        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['category','user'])



    }).then(function (contents) {

        data.contents = contents;
        //console.log(data);
        res.render('main/index',data)
    });


});

/*
* 读取文章内容
* */
router.get('/view',function (req,res,next) {
    var contentId =  req.query.contentId||'';
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        data.content = content;
        //console.log(data.content);
        content.views++;
        content.save();//content.views.save()这样会出错的
        res.render('main/view',data)
    })
})
module.exports = router;