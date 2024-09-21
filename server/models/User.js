const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  loginId: {
    type: String,
    required: true,
    unique: true,
  },
  toggles: {
    type: [Boolean],
    default: [false, false, false],
  },
});

module.exports = mongoose.model('User', UserSchema);