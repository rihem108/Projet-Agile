const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  className: { type: String, required: true, trim: true },
  code: { type: String, trim: true },
  date: { type: String, required: true },
  time: { type: String, trim: true },
  duration: { type: String, required: true },
  coefficient: { type: String, trim: true },
  maxScore: { type: String, trim: true },
  type: { type: String, enum: ['normal', 'practical'], default: 'normal' },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed'], default: 'scheduled' },
  description: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendance: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    present: { type: Boolean, default: true }
  }]
}, { timestamps: true });

ExamSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Exam', ExamSchema);
