var mongoose = require('mongoose');

var characterSchema = new mongoose.Schema({
  name: String,
  isAlive: Boolean,
  created_at: Date,
  updated_at: Date
});

var Character = mongoose.model('Character', characterSchema);

// Make this available to our other files
module.exports = Character;
