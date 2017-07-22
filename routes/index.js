var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Character = require('../models/character');
var Graveyard = require('../models/graveyard');
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
  Graveyard.findOne({'name':'Graveyard'}, function(err,graveyard){
    var deathToll = graveyard.deathToll;
    res.render('graveyard',{title:'Graveyard', name:name, isAdmin:isAdmin, deathToll:deathToll});
  });
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

router.get('/graveyardForm', requireAdmin, function(req,res,next){
  // this route is not on the nav bar - it only needs to be done once
  // navigate by typing the route in the url directly and click initiale button
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  res.render('graveyardForm',{title:'Graveyard Set Up', name:name, isAdmin:isAdmin});
});

router.post('/initializeGraveyard', requireAdmin, function(req,res,next){
  var newGraveyard = Graveyard({
      name:'Graveyard',
      deathToll: []
  });
  newGraveyard.save(function(err) {
      if (err) console.log(err);
  });
});

router.post('/submitDeath',requireAdmin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  var numDeaths = req.body.numDeaths;
  var deathNames = [];
  // kill the characters
  for (var l = 0;l<numDeaths;l++) {
    deathNames[l] = req.body['deathName'+(l+1)];
    Character.findOneAndUpdate({'name': deathNames[l]}, {'isAlive':false}, {new: true}, function(err,character) {
          console.log(character);
    });
  }
  console.log(deathNames);
  // poplulate graveyard
  Graveyard.findOne({'name':'Graveyard'}, function(err, graveyard) {
    if (err)
        console.log(err);
    var deathToll = graveyard.deathToll;
    deathToll.push(deathNames);
    graveyard.deathToll = deathToll;
    graveyard.save(function(err,graveyard) {
      if (err)
        console.log(err);
      console.log(graveyard);
    });
  });
  var scoreArray = [10,8,6,4,2];
  User.find({},function(err,users){
    var len = users.length;
    // payOut array for users
    var payOut = new Array(users.length);
    payOut.fill(0);
    console.log(payOut);
    for (var j = 0;j<numDeaths;j++){
      for (var i = 0;i<len;i++){
        console.log('user: ');
        console.log(users[i].name);
        console.log(' currentBet: ');
        console.log(users[i].currentBet);
        console.log('CurrentDeathName: ',deathNames[j]);
        var match = users[i].currentBet.indexOf(deathNames[j]);
        console.log('Match: ',match);
        if (match>-1){
          console.log('Match!');
          payOut[i] += scoreArray[match];
        } else {
          console.log('no matches');
        }
        console.log('PayOut: ',payOut[i]);
      }
    }
    // need to loop through users
    for (var k = 0;k<len;k++){
      console.log('Name: ',users[k].name);
      console.log('Payout: ',payOut[k]);
      if (users[k].currentPoints){
          var currentPoints = users[k].currentPoints+payOut[k];
      } else {
        var currentPoints = payOut[k];
      }
      console.log('currentPoints: ',currentPoints);
      console.log('history: ')
      console.log(users[k].history);
      var history = users[k].history;
      var histObj = {"payOut":payOut[k],"weeklyBet":users[k].currentBet};
      console.log('object: ');
      console.log(histObj);
      var newHistory = [];
      newHistory = history;
      console.log('newHistory: ');
      console.log(newHistory);
      newHistory.push(histObj);
      console.log('newHistory: ');
      console.log(newHistory);
      User.findOneAndUpdate({'name': users[k].name}, {currentPoints:currentPoints, currentBet: [], history:newHistory}, {new: true}, function(err,user) {
            console.log(user);
      });
    }
    res.redirect('/stats');
  });
});

router.get('/deathNote', requireLogin, function(req,res,next){
  var name = req.cookies['name'];
  var isAdmin = req.cookies['isAdmin'];
  var episodeEndTime = "July 23, 2017 21:00:00";
  console.log('/deathNote route - name: ',name);
  Character.find({}, function(err, characters){
    User.find({},function(err,users){
      console.log(characters);
      console.log(users);
      var charLen = characters.length;
      var usersLen = users.length;
      res.render('deathNote', {title: 'Place Bet', characters:characters, users:users, usersLen: usersLen, charLen:charLen, episodeEndTime: episodeEndTime, name:name, isAdmin:isAdmin});
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
      var episodeStartTime = "July 23, 2017 20:00:00";
      var len = characters.length;
      res.render('userForm', {title: 'Place Bet', characters:characters, episodeStartTime:episodeStartTime, user:user, len:len, name:name, isAdmin:isAdmin});
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
