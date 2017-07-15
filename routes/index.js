var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Character = require('../models/character');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Game of Thrones Mortality' });
});

module.exports = router;
