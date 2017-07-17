var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Character = require('../models/character');
var bcrypt = require('bcrypt');

function requireLogin(req, res, next) {
  if (req.cookies['name']) {
    next(); // allow the next route to run
  } else {
    // require the user to log in
    res.redirect('/login'); // or render a form, etc.
  }
}

function requireAdmin(req, res, next) {
  if (req.cookies['isAdmin']) {
        next(); // allow the next route to run
  } else {
    // require the user to log in
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  console.log('/ route - name: ',name);
  res.render('bobTest', {title:'Home', name:name, isAdmin:isAdmin});
});

/* GET index page */
router.get('/deadPool', requireLogin, function(req, res, next) {
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  User.find({}, function(err,users){
    Character.find({},function(err,characters){
      res.render('mainView', { title: 'Dead Pool', characters:characters, users:users, name:name, isAdmin:isAdmin});
    });
  });
});

// Get Logout page
router.get('/logout', function(req,res,next){
  console.log('deleting cookies');
  res.cookie('name', '');
  res.cookie('isAdmin', '');
  res.redirect('/');
});

router.get('/stats', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  User.find({},  null, {sort: {currentPoints: -1}}, function(err,users){
    var len = users.length;
    res.render('stats', {title: 'Stats', users:users, name: name, isAdmin:isAdmin, len:len});
  });
});

router.get('/currentBet', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  User.findOne({'name':name},function(err,user){
    res.render('currentBet', {title: 'Current Bet', user:user, name: name, isAdmin:isAdmin});
  });
});

router.get('/characterForm', requireAdmin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  res.render('characterForm', {title: 'Character Form', name:name, isAdmin:isAdmin});
});

router.post('/characterForm', requireAdmin, function(req,res,next){
  var name = req.body.name;
  console.log('character form req.body: ',req.body);
  var isAlive = req.body.isAlive;
  var newCharacter = Character({
      name:name,
      isAlive: isAlive
  });
  // Save the character
  newCharacter.save(function(err) {
      if (err) console.log(err);
      res.redirect('/characterForm');
  });
});

router.get('/login',function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  console.log('/login route - name: ',name);
  res.render('login',{title:'Login', message:'', name:name, isAdmin:isAdmin});
});

router.get('/test', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  res.render('test',{title:'Test',name:name, isAdmin:isAdmin});
});

router.get('/graveyard', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  var deathToll = [['Brienne of Tarth'],['Sandor Clegagne', 'Varys the Spider'],['none'],['Ned Stark',"Petyr Baelish 'Littlefinger'"]];
  res.render('graveyard',{title:'Graveyard', name:name, isAdmin:isAdmin, deathToll:deathToll});
});


router.post('/authenticate', function(req, res) {
  var name = req.body.name;
  var password = req.body.password;

  User.findOne({name: name}, function(err, user) {
    if (user){
      bcrypt.compare(password, user.password, function(err, result) {
        if (result) {
          //success - set cookies
          console.log('setting cookies');
          res.cookie('name', user.name);
          res.cookie('isAdmin',user.isAdmin);
          return res.redirect('/deadPool');
        }
      });
    } else {
      // failed path - either wrong email &/or password
      res.render('login', {title: 'Login', name:'', isAdmin: '', message:'Username &/or Password is incorrect!'});
      }
  });
});

router.get('/registerForm',function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  res.render('register',{title:'Register', name:name, isAdmin:isAdmin});
});

router.post('/registerUser', function(req, res, next) {
    console.log('hit register user post');
    var name = req.body.name;
    var password = req.body.password;
    var newUser = User({
        name: name,
        password: password,
        isAdmin: false,
        currentPoints: 0
    });

    console.log('newUser: ',newUser);
    // Save the user
    newUser.save(function(err,user) {
        if (err) console.log(err);
        console.log('saved user: ',user)
        //success - set cookies
        console.log('setting cookies');
        res.cookie('name', user.name);
        res.cookie('admin',user.isAdmin);
        res.redirect('/deadPool');
    });
});

router.post('/submitDeath',requireAdmin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  var deathName = req.body.deathName;
  var scoreArray = [10,8,6,4,2];
  User.find({},function(err,users){
    // check through submitted bets - tabulate points declare winner - clear submit bet and add to history
    for (var i = 0, len = users.length;i<len;i++){
      console.log('user: ');
      console.log(users[i].name);
      console.log(' currentBet: ');
      console.log(users[i].currentBet);
      var match = users[i].currentBet.indexOf(deathName);
      console.log('Match: ',match);
      if (match>-1){
        var payOut = scoreArray[match];
      } else {
        var payOut = 0;
      }
      console.log('PayOut: ',payOut);
      if (users[i].currentPoints){
          var currentPoints = users[i].currentPoints+payOut;
      } else {
        var currentPoints = payOut;
      }
      console.log('history: ')
      console.log(users[i].history);
      var history = users[i].history;
      var histObj = {"payOut":payOut,"weeklyBet":users[i].currentBet};
      console.log('object: ');
      console.log(histObj);
      var newHistory = [];
      newHistory = history;
      console.log('newHistory: ');
      console.log(newHistory);
      newHistory.push(histObj);
      console.log('newHistory: ');
      console.log(newHistory);

      User.findOneAndUpdate({'name': users[i].name}, {currentPoints:currentPoints, currentBet: [],history:newHistory}, {new: true}, function(err,user) {
        console.log(user);
      });
    }
    res.redirect('/stats');
  });

});

router.get('/deathNote', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  console.log('/userForm route - name: ',name);
  Character.find({}, function(err, characters){
    User.find({},function(err,users){
      console.log(characters);
      console.log(users);
      var charLen = characters.length;
      var usersLen = users.length;
      res.render('deathNote', {title: 'Place Bet', characters:characters, users:users, usersLen: usersLen, charLen:charLen, name:name, isAdmin:isAdmin});
    });
  });

});

router.get('/userForm', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  console.log('/userForm route - name: ',name);
  Character.find({}, function(err, characters){
    User.findOne({'name':name},function(err,user){
      console.log(characters);
      console.log(user);
      var len = characters.length;
      res.render('userForm', {title: 'Place Bet', characters:characters, user:user, len:len, name:name, isAdmin:isAdmin});
    });
  });

});

router.post('/submitBet', requireLogin, function(req,res,next){
    var name = req.cookies['name'];
    var isAdmin = req.cookies['isAdmin'];
    console.log('/ route - name: ',name);
    console.log('/ route - isAdmin: ',isAdmin);

    var currentBet = []
    for (var i = 0;i<5;i++) {
      currentBet[i] = req.body['characterChoice'+(i+1)];
    }

    User.findOneAndUpdate({'name': name}, {currentBet: currentBet}, {new: true}, function(err, user) {
      console.log(user);
      res.redirect('/currentBet');
    });
});

module.exports = router;
