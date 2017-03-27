/**
 * Created by Administrator on 2017/3/12.
 */
$(function () {
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');

    //切换到注册页面
    $loginBox.find('a').on('click',function () {
        $registerBox.show();
        $loginBox.hide();
    })
    //切换到登录页面
    $registerBox.find('a').on('click',function () {
        $loginBox.show();
        $registerBox.hide();
    });
    //注册
    $registerBox.find('button').on('click',function () {
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$registerBox.find('[name=username]').val(),
                password:$registerBox.find('[name=password]').val(),
                repassword:$registerBox.find('[name=repassword]').val()
            },
            dataType:'json',
            success:function (result) {
                //console.log('success');
                //console.log(result);
                $registerBox.find(".colWarning").html(result.message+result.code);

                if(result.code == 0){
                    setTimeout(function () {
                        $loginBox.show();
                        $registerBox.hide();
                    },1000)
                }
            }
        })
    });

    //登录
    $loginBox.find('button').on('click',function () {
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username:$loginBox.find('[name=username]').val(),
                password:$loginBox.find('[name=password]').val()
            },
            dataType:'json',
            success:function (result) {
                //console.log('success');
                //console.log(result);
                $loginBox.find(".colWarning").html(result.message+result.code);

                if(result.code == 0){
                    setTimeout(function () {
                        /*$loginBox.show();
                        $registerBox.hide();*/
                        /*$userInfo.show();*/


                        /*$userInfo.find('.username').html(result.userInfo.username);
                        $userInfo.find('.info').html('您好，欢迎光临我的博客!');*/
                        window.location.reload();
                    },1000)
                }
            }
        })
    });
    
    //退出
    $("#logout").on('click',function () {
        $.ajax({
            url:'/api/user/logout',
            success:function (result) {
                window.location.reload();
            }
        })
    })


})
