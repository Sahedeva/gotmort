var mongoose = require('mongoose');

var graveyardSchema = new mongoose.Schema({
  name: String,
  deathToll: Array,
  created_at: Date,
  updated_at: Date
});

var Graveyard = mongoose.model('Graveyard', graveyardSchema);

// Make this available to our other files
module.exports = Graveyard;
