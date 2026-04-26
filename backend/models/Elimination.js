const mongoose = require('mongoose');

const EliminationSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  examName: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  className: { type: String, required: true },
  absenceRate: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['eliminated', 'at_risk'], required: true },
  published: { type: Boolean, default: false },
  publishedBy: { type: String, default: null },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

EliminationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Elimination', EliminationSchema);

