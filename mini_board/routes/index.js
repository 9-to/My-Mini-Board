var express = require('express');
var router = express.Router();
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
var Message = Bookshelf.Model.extend({
  tableName: 'messages',
  hasTimestamps: true,
  user: function(){
    return this.belongsTo(User);
  },
});

/* GET home page. */
router.get('/', (req, res, next)=> {
  if(req.session.login == null){
    res.redirect('/users/login');
  }else{
    res.redirect('/1');
  }
});

router.get('/:page', (req, res, next)=> {
  if(req.session.login == null){
    res.redirect('/users/login');
    return;
  }
  var pg = req.params.page;
  pg *= 1;
  if(pg<1){pg=1;}
  new Message().orderBy('created_at','DESC')
      .fetchPage({page:pg,pageSize:10,withRelated:['user']})
      .then((collection)=>{
    var data = {
      title: 'miniBoard',
      login: req.session.login,
      collection: collection.toArray(),
      pagination: collection.pagination,
    };
    res.render('index', data);
  }).catch((err)=>{
    res.status(501).json({error: true, data:{message: err.message}});
  });
});

/*POST*/
router.post('/',(rq,rs,next)=>{
  var rec = {
    message: rq.body.msg,
    user_id: rq.session.login.id,
  }
  new Message(rec).save().then((model)=>{
    rs.redirect('/');
  });
});


module.exports = router;
