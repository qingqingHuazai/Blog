/**
 * Created by Administrator on 2017/3/11.
 */
/*应用启动文件（入口）文件*/

//加载模块
var express = require('express');

//加载模板处理模板
var swig = require('swig');

//加载数据库模块
var mongoose = require('mongoose');

//创建app应用=>nodeJs http.createServer();
var app = express();
//加载body-parse 用来处理post提交过来的数据
var bodyParser = require('body-parser');

//加载cookie模块
var cookies = require('cookies');

var User = require('./models/User');

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应的__dirname + '/public'下的文件
app.use('/public',express.static(__dirname+'/public'));

//使用一个中间件
//bodyparser的设置
app.use(bodyParser.urlencoded({extended:true}));//调用此方法后，会自动在api中的req增加一个属性body,也就是post里面保存的数据

//设置cookies
//使用中间建，只要用户访问这个网站，都会走这个中间件
app.use(function (req,res,next) {
    req.cookies = new cookies(req,res);

    //解析登录用户的cookies信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前用户的类型，判断是否为管理员
            User.findById(req.userInfo._id).then(function (userInfo) {//req.userInfo:当前登录的用户信息
                req.userInfo.isAdmin = userInfo.isAdmin;
                next();
            })

        }catch(e){
            next();
        }
    }else {
        next();
    }

    console.log(req.cookies.get('userInfo'));
    //console.log(typeof req.cookies.get('userInfo'));

});

//配置应用模板
//定义当前应用的模板引擎
/*
* 注意问题：
*   1、第一个参数是模板引擎的名称，同时也是文件的后缀
*   2、第二个参数用于解析处理模板内容的方法
*
* */
app.engine('html',swig.renderFile);

//设置模板文件存放的位置，第一个参数必须是views,第二个参数是路径
app.set('views','./views');

//注册所使用的模板引擎，第一个参数必须为views engine ,第二个参数与app.engine()方法中定义的模板引擎名称一致
app.set('view engine','html');

//在开发过程中需要取消模板缓存,不设置的话，模板改变后，需要从新启动服务器才能才能看到效果
swig.setDefaults({cache:false});



/*
* req: request对象
* res: response对象
* next: 函数
*
* */

/*完成了一个路由的绑定*/
/*app.get('/',function (req,res,next) {

    //res.send('<h1>欢迎光临我的博客！</h1>');
    /!*
    * 读取views目录下指定文件，解析并且返回给客户端
    * 第一个参数模板的文件相对于views目录  views/index.html
    * 第二个参数表示传递给模板使用的数据
    * *!/
    res.render('index');
})*/

/*
* 根据不同的功能划分模块
*
* */
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

//连接数据库
//使用mongdb协议
mongoose.connect('mongodb://localhost:27018/blog',function (err) {
    if(err){
        console.log('数据库连接失败！');
    }else{
        console.log('数据库连接成功！');
        //监听http请求
        app.listen(8081);
    }
});

