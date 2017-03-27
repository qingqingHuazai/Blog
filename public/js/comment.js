/**
 * Created by Administrator on 2017/3/15.
 */

var page = 1;
var pages = 0;
var prepage = 5;
var comments = [];

$("#messageBtn").on('click',function () {
    $.ajax({
        type:'post',
        url:'/api/comment/post',
        data:{
            contentid:$('#contentId').val(),
            content:$('#messageContent').val()
        },
        success:function (responseData) {
            $('#messageContent').val('');
            //console.log(responseData);
            comments = responseData.data.comments.reverse();
            renderComment();
        }
    })
})
//每次页面重载的时候，获取一下该文章的所有内容
$.ajax({
    url:'/api/comment',
    data:{
        contentid:$('#contentId').val()
    },
    success:function (responseData) {
       // renderComment(responseData.data.comments.reverse());
        comments = responseData.data.comments.reverse();
        renderComment();
    },
    error:function (err) {
        console.log(err);
    }
})


function renderComment() {

    $('.messageCount').html(comments.length);

    pages =Math.ceil(comments.length/prepage);
    //pages =Math.max((comments.length/prepage),1);
    console.log(pages);
    var $divs = $('.pager div');
    $divs.eq(1).html(page+'/'+pages);
    var html = '';

    //处理越界问题
    var start = Math.max(0,(page-1)*prepage);
    var end =Math.min(comments.length,(start+prepage));

    if(page<=1){
        page = 1;
        $divs.eq(0).html('没有上一页了')
    }else {
        $divs.eq(0).html('<a href="javacript:;">上一页</a>');
    }

    if(page>=pages){
        page =pages;
        $divs.eq(2).html('没有下一页了')
    }else {
        $divs.eq(2).html('<a href="javacript:;">下一页</a>')
    }
    if(!comments.length){
        console.log('');
        $('.messageList').html('<div class="messageBox"><p>没有留言</p></div>');
    }else {
        for(var i=start;i<end;i++){
            //有空去看看es6模板字符串拼接
            html+='<div class="messageBox">'+
                '<div class="name">'+
                '<span class="fl">'+comments[i].username+'</span>'+
                '<span class="fr">'+formatDate(comments[i].addTime)+'</span>'+
                '</div>'+
                '<div class="content">'+comments[i].content+'</div>'+
                '</div>'
        }

        $('.messageList').html(html);
    }


}
//时间的处理
function  formatDate(d) {
    //console.log(typeof d);
    var nd = new Date(d);
    //console.log(nd);
    return nd.getFullYear()+'年'+nd.getMonth()+'月'+nd.getDate()+'日'+' '+nd.getHours()+':'+nd.getMinutes()+':'+nd.getSeconds();
}

//事件委托
$('.pager').delegate('a','click',function () {
    if($(this).parent().hasClass('pre')){
        page--;
    }else {
        page++;
    }
    renderComment(comments);
})
