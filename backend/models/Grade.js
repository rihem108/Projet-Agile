const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: Number, required: true },
  validated: { type: Boolean, default: false }
}, { timestamps: true });

GradeSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Grade', GradeSchema);
