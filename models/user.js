var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  history: Array,
  currentBet: Array,
  created_at: Date,
  updated_at: Date
});

var User = mongoose.model('User', userSchema);

// Make this available to our other files
module.exports = User;
