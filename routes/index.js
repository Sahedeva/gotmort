var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Character = require('../models/character');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Game of Thrones Mortality' });
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
      console.log(characters);
      var len = characters.length
      res.render('userForm', {title: 'User Form', characters:characters, len:len});
    });

});

  router.post('/submitUser', function(req,res,next){
    var name = req.body.name;
    console.log(req.body);
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
