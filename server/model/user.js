const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  bbUpper: [String],
  bbLower: [String],
  pullback: [String],
  trigger: [{ market: String, cur: Number }]
});

module.exports = mongoose.model("User", userSchema);