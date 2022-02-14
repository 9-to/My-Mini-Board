var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
var mysql = require('mysql');

var knex = require('knex')({
  client: 'mysql',
  connection:{
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'my-nodeapp-db00',
    charset: 'utf8'
  }
});
var Bookshelf = require('bookshelf')(knex);

var User = Bookshelf.Model.extend({
  tableName: 'users',
});

function vCheck(){
  return [check('name','NAMEは必須項目です').notEmpty(),
  check('password','PASSWORDは必須項目です').notEmpty()]
}

/* GET users listing. */
router.get('/add', (req, res, next)=> {
  var data = {
    title: 'Users/Add',
    form:{name:'',password:'',comment:''},
    content:'登録するname,pw,commentを入力ください',
  }
  res.render('users/add',data);
});

router.get('/login',(rq,rs,next)=>{
  var data = {
    title: 'Users/Login',
    form:{name:'',password:''},
    content:'name,pwを入力ください',
  }
  rs.render('users/login',data);
});

router.post('/add',vCheck(),(rq,rs,next)=>{
  var request  =rq;
  var response = rs;
  var errResult = validationResult(rq);
  if(!errResult.isEmpty()){
    var re = '<ul class="error">';
    var result_arr = errResult.array();
    for(var n in result_arr){
        re += '<li>' + result_arr[n].msg + '</li><br>'
    }
    re += '</ul>'
    var data = {title:'Users/Add',
                content: re,
                form:rq.body};
    response.render('users/add',data);
  }else{
    request.session.login = null;
    new User(rq.body).save().then((model)=>{
      response.redirect('/');
    });
  }
});

router.post('/login',vCheck(),(rq,rs,next)=>{
  var request  =rq;
  var response = rs;
  var errResult = validationResult(rq);
  if(!errResult.isEmpty()){
    var re = '<ul class="error">';
    var result_arr = errResult.array();
    for(var n in result_arr){
        re += '<li>' + result_arr[n].msg + '</li><br>'
    }
    re += '</ul>'
    var data = {title:'Users/Add',
                content: re,
                form:rq.body};
    response.render('users/login',data);
  }else{
    var nm = rq.body.name;
    var pw = rq.body.password;
    User.query({where: {name:nm}, andWhere: {password:pw}}).fetch().then((model)=>{
      if(model ==null){
        //ここは冗長
        var data = {
          title: '再入力',
          content: '<p class="error">name or pw が違います</p>',
          form: rq.body,
        };
        response.render('users/login',data);
      } else {
        request.session.login = model.attributes;
        console.log(model.attributes);
        var data = {
          title: 'Users/Login',
          content: '<p>ログインしました!<br>Topに戻ってmsgを送信しましょう</p><br>',
          form: rq.body
        };
        response.render('users/login',data);
      }
    }).catch((err)=>{
      //rs.status(502).json({error: true, data:{message: err.message}});
      var data = {
        title: '再入力',
        content: '<p class="error">name or pw が違います</p>',
        form: rq.body,
      };
      response.render('users/login',data);
    });
  }
});

module.exports = router;
