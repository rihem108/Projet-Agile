require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Exam = require('./models/Exam');
const Room = require('./models/Room');
const Assignment = require('./models/Assignment');
const Grade = require('./models/Grade');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examadmin';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error(err));

// ========== AUTH ========== //
const authMiddleware = (req, res, next) => {
  // Ignorer pour login, register et seed
  if (req.path === '/auth/login' || req.path === '/auth/register' || req.path === '/seed') return next();
  
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey2026');
    req.user = decoded;
    next();
  } catch(err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

app.use('/api', authMiddleware);

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey2026', { expiresIn: '1d' });
    res.json({ token, user });
  } catch(err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, className } = req.body;
    const normalizedRole = role || 'Student';
    if (normalizedRole === 'Student' && !className) {
      return res.status(400).json({ message: 'La classe est obligatoire pour un étudiant' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Cet email existe déjà' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role: normalizedRole, className: normalizedRole === 'Student' ? className : undefined });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey2026', { expiresIn: '1d' });
    res.json({ token, user });
  } catch(err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch(err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ========== ROUTES ========== //
// USERS
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});
app.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});
app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// EXAMS
app.get('/api/exams', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || !currentUser.className) {
        return res.json([]);
      }
      const exams = await Exam.find({ className: currentUser.className });
      return res.json(exams);
    }

    if (req.user?.role === 'Teacher') {
      const assignedExamIds = await Assignment.distinct('examId', { supervisorId: req.user.id });
      if (!assignedExamIds.length) {
        return res.json([]);
      }
      const exams = await Exam.find({ _id: { $in: assignedExamIds } });
      return res.json(exams);
    }

    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/exams', async (req, res) => {
  const { subject, className, date, duration } = req.body;
  const exam = new Exam({
    subject,
    className: String(className || '').trim(),
    date,
    duration
  });
  await exam.save();
  res.json(exam);
});
app.put('/api/exams/:id', async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  const { subject, className, date, duration } = req.body;
  if (subject !== undefined) exam.subject = subject;
  if (className !== undefined) exam.className = String(className || '').trim();
  if (date !== undefined) exam.date = date;
  if (duration !== undefined) exam.duration = duration;

  await exam.save();
  res.json(exam);
});
app.put('/api/exams/:id/attendance', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user?.role === 'Teacher') {
      const assignment = await Assignment.findOne({ examId: exam._id, supervisorId: req.user.id });
      if (!assignment) {
        return res.status(403).json({ message: 'Vous ne pouvez pas gérer la présence pour cet examen' });
      }
    }

    const students = await User.find({ role: 'Student', className: exam.className }).sort({ name: 1 });
    const submittedAttendance = Array.isArray(req.body.attendance) ? req.body.attendance : [];
    const attendanceMap = new Map(
      submittedAttendance.map(item => [String(item.studentId), Boolean(item.present)])
    );

    const normalizedAttendance = students.map(student => ({
      studentId: student._id,
      present: attendanceMap.has(String(student._id)) ? attendanceMap.get(String(student._id)) : true
    }));

    exam.attendance = normalizedAttendance;
    await exam.save();

    const absentStudentIds = normalizedAttendance
      .filter(item => !item.present)
      .map(item => item.studentId);
    const presentStudentIds = normalizedAttendance
      .filter(item => item.present)
      .map(item => item.studentId);

    for (const studentId of absentStudentIds) {
      await Grade.updateOne(
        { examId: exam._id, studentId },
        { $set: { grade: 0, validated: false, autoGenerated: true } },
        { upsert: true }
      );
    }

    if (presentStudentIds.length > 0) {
      await Grade.deleteMany({
        examId: exam._id,
        studentId: { $in: presentStudentIds },
        autoGenerated: true
      });
    }

    const updatedGrades = await Grade.find();
    res.json({ exam, grades: updatedGrades });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.delete('/api/exams/:id', async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.json({ message: 'Exam deleted' });
});

// ROOMS
app.get('/api/rooms', async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});
app.post('/api/rooms', async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.json(room);
});
app.put('/api/rooms/:id', async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
});
app.delete('/api/rooms/:id', async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: 'Room deleted' });
});

// ASSIGNMENTS
app.get('/api/assignments', async (req, res) => {
  const list = await Assignment.find();
  res.json(list);
});
app.post('/api/assignments/bulk', async (req, res) => {
  await Assignment.deleteMany({});
  const result = await Assignment.insertMany(req.body);
  res.json(result);
});

// GRADES
app.get('/api/grades', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      const grades = await Grade.find({ studentId: req.user.id, validated: true });
      return res.json(grades);
    }

    if (req.user?.role === 'Teacher') {
      const assignedExamIds = await Assignment.distinct('examId', { supervisorId: req.user.id });
      const grades = await Grade.find({ examId: { $in: assignedExamIds } });
      return res.json(grades);
    }

    const grades = await Grade.find();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/grades', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { examId, studentId, grade, validated } = req.body;
    if (!examId || !studentId || grade === undefined || grade === null) {
      return res.status(400).json({ message: 'examId, studentId et grade sont obligatoires' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Examen introuvable' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(400).json({ message: 'Étudiant invalide' });
    }

    if (String(student.className || '').trim() !== String(exam.className || '').trim()) {
      return res.status(400).json({ message: 'Cet étudiant ne fait pas partie de la classe de cet examen' });
    }

    if (req.user?.role === 'Teacher') {
      const assignment = await Assignment.findOne({ examId, supervisorId: req.user.id });
      if (!assignment) {
        return res.status(403).json({ message: 'Vous ne pouvez pas noter cet examen' });
      }
    }

    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 20) {
      return res.status(400).json({ message: 'La note doit être comprise entre 0 et 20' });
    }

    const isTeacher = req.user?.role === 'Teacher';
    const validationValue = isTeacher ? false : Boolean(validated);

    const duplicates = await Grade.find({ examId, studentId }).sort({ updatedAt: -1, createdAt: -1 });
    let record = duplicates[0] || null;
    if (record) {
      record.grade = numericGrade;
      record.validated = validationValue;
      record.autoGenerated = false;
      await record.save();

      if (duplicates.length > 1) {
        await Grade.deleteMany({
          examId,
          studentId,
          _id: { $ne: record._id }
        });
      }

      return res.json(record);
    }

    record = new Grade({
      examId,
      studentId,
      grade: numericGrade,
      validated: validationValue,
      autoGenerated: false
    });
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.put('/api/grades/:id', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const record = await Grade.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Note introuvable' });
    }

    if (req.user?.role === 'Teacher') {
      const assignment = await Assignment.findOne({ examId: record.examId, supervisorId: req.user.id });
      if (!assignment) {
        return res.status(403).json({ message: 'Vous ne pouvez pas modifier cette note' });
      }
    }

    const isTeacher = req.user?.role === 'Teacher';

    if (req.body.grade !== undefined) {
      const numericGrade = Number(req.body.grade);
      if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 20) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 20' });
      }
      record.grade = numericGrade;
      record.autoGenerated = false;
      if (isTeacher) {
        // Any teacher score update must go back to pending for validation workflow.
        record.validated = false;
      }
    }

    if (req.body.validated !== undefined) {
      if (!isTeacher) {
        record.validated = Boolean(req.body.validated);
      }
    }

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.delete('/api/grades/:id', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const record = await Grade.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Note introuvable' });
    }

    if (req.user?.role === 'Teacher') {
      const assignment = await Assignment.findOne({ examId: record.examId, supervisorId: req.user.id });
      if (!assignment) {
        return res.status(403).json({ message: 'Vous ne pouvez pas supprimer cette note' });
      }
    }

    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// SEED DB (Development Helper)
app.get('/api/seed', async (req, res) => {
  await User.deleteMany();
  await Exam.deleteMany();
  await Room.deleteMany();
  await Grade.deleteMany();
  await Assignment.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const pass = await bcrypt.hash('123456', salt);

  const u1 = await User.create({ name: 'Alice Dupont', role: 'Teacher', email: 'alice@exam.com', password: pass });
  const u2 = await User.create({ name: 'Bob Martin', role: 'Student', className: 'L1 INFO A', email: 'bob@exam.com', password: pass });
  const u3 = await User.create({ name: 'Charlie Durand', role: 'Student', className: 'L1 INFO B', email: 'charlie@exam.com', password: pass });
  const u4 = await User.create({ name: 'Admin Principal', role: 'Admin', email: 'admin@exam.com', password: pass });
  
  const e1 = await Exam.create({ subject: 'Mathématiques', className: 'L1 INFO A', date: '2026-05-15', duration: '2h' });
  const e2 = await Exam.create({ subject: 'Physique', className: 'L1 INFO B', date: '2026-05-16', duration: '1h30' });
  
  const r1 = await Room.create({ name: 'Salle A101', capacity: 30 });
  const r2 = await Room.create({ name: 'Amphi B', capacity: 150 });
  
  await Grade.create({ examId: e1._id, studentId: u2._id, grade: 14, validated: true });
  await Grade.create({ examId: e1._id, studentId: u3._id, grade: 8, validated: false });
  
  res.json({ message: 'Database seeded successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
