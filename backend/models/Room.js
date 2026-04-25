const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  building: { type: String, required: true, trim: true },
  floor: { type: String, trim: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['amphitheater', 'lab', 'standard', 'small'], default: 'standard' },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  equipment: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  currentExam: { type: String, trim: true },
  nextExam: { type: String, trim: true }
}, { timestamps: true });

RoomSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Room', RoomSchema);
