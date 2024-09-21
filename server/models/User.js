import mongoose from 'mongoose';

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

export default mongoose.model('User', UserSchema);