const mongoose = require('mongoose');

const CorrectionRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['second_correction', 'note_check'], 
    required: true 
  },
  reason: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'admin_approved', 'admin_rejected', 'teacher_reviewed', 'completed'], 
    default: 'pending' 
  },
  adminDecision: { type: String, trim: true },
  teacherDecision: { type: String, trim: true },
  newGrade: { type: Number, min: 0, max: 20 },
  reviewedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedByTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminReviewedAt: { type: Date },
  teacherReviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CorrectionRequestSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('CorrectionRequest', CorrectionRequestSchema);
