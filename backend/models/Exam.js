const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  className: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  duration: { type: String, required: true },
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
