 const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Teacher', 'Student', 'Admin'], default: 'Student' },
  className: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'Student';
    }
  },
  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Date, default: null }
}, { timestamps: true });

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

module.exports = mongoose.model('User', UserSchema);
