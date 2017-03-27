/**
 * Created by Administrator on 2017/3/11.
 */
var express = require('express');
var router = express.Router();
//通过模型类引入数据库
var User = require('../models/User');//它给我们返回的是一个构造函数
var Content = require('../models/Content');
//返回统一格式
var responseData;
router.use(function (req,res,next) {
    responseData = {
        code : 0,
        message :''
    }
    next();
});

/*
 * 注册逻辑：
 *   1、用户名不能为空
 *   2.注册密码不能为空
 *   3、两次输入的密码一致
 *
 *
 *   1、用户名是否已经注册过了
 *       需要用到数据库的查询
 *
 *
 * */


/*router.get('/user',function (req,res,next) {
    res.send('API-user');
});*/

//增加一个路由注册路由
router.post('/user/register',function (req,res,next) {
   // res.send('API-user');
   // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);//它会把这个数据转化成json返回给前端
        return;
    }
    if(password==''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);//它会把这个数据转化成json返回给前端
        return;
    }
    if(repassword!=password){
        responseData.code = 3;
        responseData.message = '前后密码不一致';
        res.json(responseData);//它会把这个数据转化成json返回给前端
        return;
    }

    //如果数据库中已经存在和注册用户名的数据一致，表示该用户名已经被注册过了
    User.findOne({
        username : username
    }).then(function (userInfo) {
        //console.log(userInfo);
        if(userInfo){
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            return;
        }
        //把数据保存到数据库中
        var user = new User({
            username :username,
            password:password
        })
        return user.save();
    }).then(function (newUserInfo) {
        //console.log(newUserInfo);
        responseData.message='注册成功';
        res.json(responseData);
    });



});

//增加一个路由登录路由

router.post('/user/login',function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == ''||password==''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);//它会把这个数据转化成json返回给前端
        return;
    }
    //如果数据库中已经存在和登录用户名，密码数据一致，表示该用户名存在数据库中
    User.findOne({
        username : username,
        password : password
    }).then(function (userInfo) {
        if(!userInfo){
            responseData.message = '用户名或者密码错误！';
            res.json(responseData);
            return;
        }
        console.log(userInfo);

        //把用户名返回给前端
        responseData.userInfo = {
            _id : userInfo._id,
            username : userInfo.username

        }
        /*发送一个cookies信息给浏览器，浏览器将这个信息保存起来，以后只要访问这个网站，
          浏览器都会通过头信息把这个cookies信息发送给服务器，服务器通过这个信息验证是否处于登录状态*/
        req.cookies.set('userInfo',JSON.stringify({
            _id : userInfo._id,
            username : userInfo.username
        }));
        responseData.message = '登录成功！';
        res.json(responseData);
    })



});
//增加一个退出路由
router.get('/user/logout',function (req,res) {
    req.cookies.set('userInfo',null);
    responseData.message = '退出成功！';
    res.json(responseData);

});

/*
* 获取文章的指定所有评论
* */
router.get('/comment',function (req,res) {
    //内容的id
    var contentId = req.query.contentid||'';//***注意与下面的保存做比较这里不同

    Content.findOne({
        _id:contentId
    }).then(function (newContent) {
        //向前端返回一个数据
        responseData.data = newContent;
        res.json(responseData);
    })
})

//评论提交
router.post('/comment/post',function (req,res) {
    //内容的id
    var contentId = req.body.contentid||'';
    var postData = {
        username : req.body.username,
        addTime : new Date(),
        content : req.body.content
    }
    //查询这篇文章的相关内容
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save()
    }).then(function (newContent) {
        //向前端返回一个数据
        responseData.message = '评论成功！';
        responseData.data = newContent;
        res.json(responseData);
    })
});

module.exports = router;