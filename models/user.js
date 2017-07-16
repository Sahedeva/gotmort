var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: String,
  history: Array,
  currentBet: Array,
  isAdmin: Boolean,
  created_at: Date,
  updated_at: Date
});

userSchema.pre('save', function(next) {
  console.log('pre user save function hit');
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

var User = mongoose.model('User', userSchema);

// Make this available to our other files
module.exports = User;
