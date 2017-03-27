/**
 * Created by Administrator on 2017/3/11.
 */

//admin路由的分模块处理
//引入框架express
var express = require('express');
var router = express.Router();

//读取数据库中的用户信息，需要引入模型
var User = require('../models/User');

//保存前端表单提交过来的数据，想加载数据模型
var Content = require('../models/Content');

//引入分类的模型
var Category = require('../models/Category');

router.use(function (req,res,next) {
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才能进入后台管理页面');
        return;
    }
    next();
})

/*router.get('/user',function (req,res,next) {
    res.send('ADMIN-user');
});*/
//首页
router.get('/',function (req,res,next) {
    /*res.send('后台管理首页');*/
    res.render('./admin/index',{
        userInfo:req.userInfo
    });
});
//用户管理
router.get('/user',function (req,res,next) {
    /*
    * 从数据库中读取所有的用户数据
    * limit(Number)，限制获取数据的条数
    * skip(2) 忽略数据条数
    * 每页显示2条
    *   第一页：1-2 skip(0) （当前页-1）*limit
    *   第二页：3-4 skip(2)
    * */

    var page = Number(req.query.page||1) ;
    var limit = 5;
    var pages = 0;
    //从数据库中查找总的条目数
    User.count().then(function (count) {//是异步的，所以需要把limit放在里面
        console.log(count);//总的条目数
        //总页数
        pages = Math.ceil(count/limit);//向上取整

        //取这两个数值中的最小值，当page大于pages时候，取总页数pages,
        page = Math.min(page,pages);
        //取这两个值的最大值，当page小于1时候，取值最大值1
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        User.find().limit(limit).skip(skip).then(function (users) {
            // console.log('所有用户数据');
            //  console.log(users);
            //把数据传递给模板变量
            res.render('./admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                page:page,
                pages:pages,
                limit:limit,
                count:count
            });
        });

    });

    //读取一个模板
    /*res.render('./admin/user_index',{
        userInfo:req.userInfo
    });*/
});

/*
* 分类的首页
* */
router.get('/category',function (req,res,next) {
        var page = Number(req.query.page||1) ;
        var limit = 5;
        var pages = 0;
        //从数据库中查找总的条目数
        Category.count().then(function (count) {//是异步的，所以需要把limit放在里面
            console.log(count);//总的条目数
            //总页数
            pages = Math.ceil(count/limit);//向上取整

            //取这两个数值中的最小值，当page大于pages时候，取总页数pages,
            page = Math.min(page,pages);
            //取这两个值的最大值，当page小于1时候，取值最大值1
            page = Math.max(page,1);
            var skip = (page-1)*limit;

            /*
            * sort();
            *  1代表升序
            *  -1代表降序
            *  id默认地与随机生成的一个id值时间戳
            * */
            Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
                // console.log('所有用户数据');
                //  console.log(users);
                //把数据传递给模板变量
                res.render('./admin/category_index',{
                    userInfo:req.userInfo,
                    categories:categories,
                    page:page,
                    pages:pages,
                    limit:limit,
                    count:count
                });
            });

        });

});

/*
 * 分类添加
 * */
router.get('/category/add',function (req,res,next) {

    //渲染一个模板
    res.render('./admin/category_add',{
        userInfo:req.userInfo
    });
});

/*
* 分类的保存
* */
router.post('/category/add',function (req,res,next) {
    //获取前端表单传过来的数据
    //console.log('分类表单的数据');
    //console.log(req.body);

    var name = req.body.name ||'';
    if(name==''){
       res.render('./admin/error',{
           userInfo:req.userInfo,
           message:'名称不能为空'
       });
       return;
    }

    //查询数据库中是否有同名分类名称
    Category.findOne({
        name:name
    }).then(function (rs) {
        if(rs){
            //数据库中已经存在该分类了
            res.render('./admin/error',{
                userInfo:req.userInfo,
                message:'分类已经存在'
            })
            return Promise.reject();
        }else{
            //数据库中不存在，保存下来
            return new Category({
                name:name
            }).save();
        }
    }).then(function (newCategory) {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'分类保存成功',
            url:'/admin/category'
        });
    })
})


/*
* 分类修改
* */
router.get('/category/edit',function (req,res) {
    //获取要修改的分类信息信息，并且用表单的方式展示出来
    var id = req.query.id||'';
    console.log('输出id');
    console.log(id);
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('./admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
            return Promise.reject();
        }else{
            res.render('./admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            })
        }
    })
})

/*
* 增加一个post方式去保存编辑的数据
*
* */
router.post('/category/edit',function (req,res) {
    //获取要修改的分类信息信息，并且用表单的方式展示出来
    var id = req.query.id||'';
    //获取post提交过来的名称
    var name = req.body.name;

    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('./admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
            return Promise.reject();
        }else{
            //当用户没有做任何修改去提交的时候
            if(name==category.name){//名字==从数据库中查找出来的数据
                res.render('./admin/success',{
                    userInfo:req.userInfo,
                    message:'修改成功，没有数据库操作',
                    url:'/admin/category'
                })
                return Promise.reject();
            }else {
                //修改的名称是否已经在数据库中存在了
               return Category.findOne({
                    _id:{$ne:id},//id不相等
                    name:name
                })
            }
        }
    }).then(function (sameCategory) {//同名的
        if(sameCategory){
            res.render('./admin/error',{
                userInfo:req.userInfo,
                message:'数据库已经存在同名分类'
            })
            console.log(1);
            return Promise.reject();
        }else{
            console.log(2);
            return Category.update({
                _id:id //修改哪条数据
            },{
                name:name //修改的值
            })
        }
    }).then(function () {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'修改成功，经过数据库的操作',
            url:'/admin/category'
        })
    })

})

/*
* 分类删除
* */
router.get('/category/delete',function (req,res) {
    //获取要修改的分类信息信息，并且用表单的方式展示出来
    var id = req.query.id||'';
    Category.remove({
        _id:id
    }).then(function () {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        })
    })
})

/*
* 内容首页 
*
* */
router.get('/content',function (req,res) {

    var page = Number(req.query.page||1) ;
    var limit = 5;
    var pages = 0;
    //从数据库中查找总的条目数
    Content.count().then(function (count) {//是异步的，所以需要把limit放在里面
        //总页数
        pages = Math.ceil(count/limit);//向上取整

        //取这两个数值中的最小值，当page大于pages时候，取总页数pages,
        page = Math.min(page,pages);
        //取这两个值的最大值，当page小于1时候，取值最大值1
        page = Math.max(page,1);
        var skip = (page-1)*limit;

        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function (contents) {
            //  console.log(users);
            //把数据传递给模板变量
            //console.log('数据类型');
           // console.log(contents);

            res.render('./admin/content_index',{
             userInfo:req.userInfo,
             contents:contents,
             page:page,
             pages:pages,
             limit:limit,
             count:count
             });
        });

    });
})
/*
* 内容添加页面
* */
router.get('/content/add',function (req,res) {
    //读取所有的分类内容
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('./admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    })
})

/*
* 内容保存
* */
router.post('/content/add',function (req,res) {
    //表单不为空验证
    if(req.body.title==''){
        res.render('./admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        })
        return;
    }

    if(req.body.description==''){
        res.render('./admin/error',{
            userInfo:req.userInfo,
            message:'简介不能为空'
        })
        return;
    }

    if(req.body.content==''){
        res.render('./admin/error',{
            userInfo:req.userInfo,
            message:'内容不能为空'
        })
        return;
    }
    //保存数据到数据库中
    new Content({
        category: req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content
    }).save().then(function (rs) {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            url:'/admin/content'
        })
    })

})
/*
* 内容编辑
*
* */
router.get('/content/edit',function (req,res) {
    var id = req.query.id||'';
    var categories = [];
    //读取所有的分类内容
    Category.find().sort({_id:-1}).then(function (rs) {
        categories = rs;
       return Content.findOne({//数组用fineOne
            _id :id
        }).populate('category');
    }).then(function (content) {
        if(!content){
            res.render('./admin/error',{
                userInfo:req.userInfo,
                message:'指定内容不存在'
            })
            return Promise.reject();
        }else {
            res.render('./admin/content_edit',{
                userInfo:req.userInfo,
                content:content,
                categories:categories
            })
        }
    })

})
/*
* 修改内容
* */
router.post('/content/edit',function (req,res) {
    var id = req.query.id||'';
    //表单不为空验证
    if(req.body.title==''){
        res.render('./admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        })
        return;
    }

    if(req.body.description==''){
        res.render('./admin/error',{
            userInfo:req.userInfo,
            message:'简介不能为空'
        })
        return;
    }

    if(req.body.content==''){
        res.render('./admin/error',{
            userInfo:req.userInfo,
            message:'内容不能为空'
        })
        return;
    }
    //保存数据到数据库中
    /*new Content({
        category: req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function (rs) {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            url:'/admin/content/edit?id='+id
        })
    })*/
    Content.update({
        _id:id
    },{
        category: req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function (rs) {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            url:'/admin/content/edit?id='+id
        })
    })

})
/*
* 删除内容
* */
router.get('/content/delete',function (req,res) {
    var id = req.query.id||'';
    Content.remove({
        _id:id
    }).then(function () {
        res.render('./admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        })
    })

})

module.exports = router;