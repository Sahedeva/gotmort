var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Character = require('../models/character');

/* GET home page. */
router.get('/', function(req, res, next) {
  User.find({}, function(err,users){
    Character.find({},function(err,characters){
      res.render('mainView', { title: 'Game of Thrones Mortality Picker', characters:characters, users:users });
    });
  });
});

router.get('/characterForm', function(req,res,next){
  res.render('characterForm', {title: 'Character Form'});
});

router.post('/characterForm', function(req,res,next){
  var name = req.body.name;
  var newCharacter = Character({
      name:name,
      isAlive: true
  });
});

router.get('/userForm', function(req,res,next){

  Character.find({}, function(err, characters){
    User.find({},function(err,users){
      console.log(characters);
      console.log(users);
      var len = characters.length
      res.render('userForm', {title: 'User Form', characters:characters, users:users, len:len});
    });
  });

});

  router.post('/submitUser', function(req,res,next){
    var name = req.body.name;
    console.log("POST route: /submitUser  req.body = ",req.body);
    var currentBet = []
    for (var i = 0;i<5;i++) {
      currentBet[i] = req.body['characterChoice'+(i+1)];
    }
    var newUser = User({
        name:name,
        currentBet:currentBet
    });

  // Save the user
  newUser.save(function(err) {
      if (err) console.log(err);

      res.redirect('/userForm');
  });
});

module.exports = router;
