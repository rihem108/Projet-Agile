require('dotenv').config();
const express = require('express'); // Framework web pour créer l'API REST
const mongoose = require('mongoose'); // ODM pour interagir avec MongoDB de manière plus facile et structurée
const cors = require('cors'); // Middleware pour permettre les requêtes cross-origin (entre le frontend et le backend)
const bcrypt = require('bcryptjs'); // Bibliothèque pour hasher les mots de passe de manière sécurisée
const jwt = require('jsonwebtoken'); // Bibliothèque pour créer et vérifier les JSON Web Tokens (JWT) utilisés pour l'authentification

const User = require('./models/User');
const Exam = require('./models/Exam');
const Room = require('./models/Room');
const Assignment = require('./models/Assignment');
const Grade = require('./models/Grade');
const Elimination = require('./models/Elimination');

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
  // Ignorer pour login, register, forgot-password, reset-password et seed
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/seed', '/api/seed'];
  if (publicPaths.includes(req.path)) return next();
  
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

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun compte associé à cet email.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetCode = code;
    user.resetCodeExpires = expires;
    await user.save();

    res.json({ message: 'Code de vérification généré.', code });
  } catch(err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    if (user.resetCode !== String(code).trim()) {
      return res.status(400).json({ message: 'Code invalide.' });
    }
    if (!user.resetCodeExpires || new Date() > user.resetCodeExpires) {
      return res.status(400).json({ message: 'Code expiré.' });
    }
    if (!newPassword || String(newPassword).trim().length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword).trim(), salt);
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
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
      const exams = await Exam.find({
        $or: [
          { _id: { $in: assignedExamIds } },
          { createdBy: req.user.id }
        ]
      });
      if (!exams.length) {
        return res.json([]);
      }
      return res.json(exams);
    }

    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/exams', async (req, res) => {
  if (req.user?.role === 'Student') {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const { subject, className, date, time, duration, coefficient } = req.body;
  const exam = new Exam({
    subject,
    className: String(className || '').trim(),
    date,
    time,
    duration,
    coefficient: String(coefficient || '').trim(),
    createdBy: req.user?.id
  });
  await exam.save();
  res.json(exam);
});
app.put('/api/exams/:id', async (req, res) => {
  if (req.user?.role === 'Student') {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  const { subject, className, date, time, duration, coefficient } = req.body;
  if (subject !== undefined) exam.subject = subject;
  if (className !== undefined) exam.className = String(className || '').trim();
  if (date !== undefined) exam.date = date;
  if (time !== undefined) exam.time = time;
  if (duration !== undefined) exam.duration = duration;
  if (coefficient !== undefined) exam.coefficient = String(coefficient || '').trim();

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
  if (req.user?.role === 'Student') {
    return res.status(403).json({ message: 'Accès refusé' });
  }

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
  try {
    const list = await Assignment.find()
      .populate('examId', 'subject className date duration')
      .populate('roomId', 'name capacity')
      .populate('supervisorId', 'name email role');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/assignments', async (req, res) => {
  try {
    const { examId, roomId, supervisorId } = req.body;
    if (!examId || !roomId || !supervisorId) {
      return res.status(400).json({ message: 'examId, roomId et supervisorId sont obligatoires' });
    }

    const assignment = new Assignment({ examId, roomId, supervisorId });
    await assignment.save();
    const populated = await Assignment.findById(assignment._id)
      .populate('examId', 'subject className date duration')
      .populate('roomId', 'name capacity')
      .populate('supervisorId', 'name email role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.put('/api/assignments/:id', async (req, res) => {
  try {
    const { examId, roomId, supervisorId } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Affectation introuvable' });
    }

    if (examId) assignment.examId = examId;
    if (roomId) assignment.roomId = roomId;
    if (supervisorId) assignment.supervisorId = supervisorId;

    await assignment.save();
    const populated = await Assignment.findById(assignment._id)
      .populate('examId', 'subject className date duration')
      .populate('roomId', 'name capacity')
      .populate('supervisorId', 'name email role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Affectation supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/assignments', async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.put('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/assignments/bulk', async (req, res) => {
  try {
    await Assignment.deleteMany({});
    const result = await Assignment.insertMany(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GRADES
app.get('/api/grades', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      const grades = await Grade.find({ studentId: req.user.id, validated: true })
        .populate('examId', 'subject className date duration')
        .populate('studentId', 'name className');
      return res.json(grades);
    }

    if (req.user?.role === 'Teacher') {
      const assignedExamIds = await Assignment.distinct('examId', { supervisorId: req.user.id });
      const grades = await Grade.find({ examId: { $in: assignedExamIds } })
        .populate('examId', 'subject className date duration')
        .populate('studentId', 'name className');
      return res.json(grades);
    }

    const grades = await Grade.find()
      .populate('examId', 'subject className date duration')
      .populate('studentId', 'name className');
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

    const studentClass = String(student.className || '').trim().toLowerCase();
    const examClass = String(exam.className || '').trim().toLowerCase();
    
    // More flexible class matching
    const classMatches = studentClass === examClass || 
                       studentClass.includes(examClass) || 
                       examClass.includes(studentClass);
    
    if (!classMatches) {
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
    
    // Return populated data
    const populated = await Grade.findById(record._id)
      .populate('examId', 'subject className date duration')
      .populate('studentId', 'name className');
    res.json(populated);
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
    
    // Return populated data
    const populated = await Grade.findById(record._id)
      .populate('examId', 'subject className date duration')
      .populate('studentId', 'name className');
    res.json(populated);
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

// ELIMINATIONS
app.get('/api/eliminations', async (req, res) => {
  try {
    const { role, id } = req.user;

    if (role === 'Admin') {
      const eliminations = await Elimination.find().sort({ createdAt: -1 });
      return res.json(eliminations);
    }

    if (role === 'Teacher') {
      const assignedExamIds = await Assignment.distinct('examId', { supervisorId: id });
      const eliminations = await Elimination.find({
        examId: { $in: assignedExamIds },
        published: true
      }).sort({ createdAt: -1 });
      return res.json(eliminations);
    }

    if (role === 'Student') {
      const eliminations = await Elimination.find({
        studentId: id,
        published: true
      }).sort({ createdAt: -1 });
      return res.json(eliminations);
    }

    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/eliminations/calculate', async (req, res) => {
  try {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé. Seul l\'admin peut calculer les éliminations.' });
    }

    const exams = await Exam.find();
    const calculated = [];

    for (const exam of exams) {
      if (!exam.attendance || exam.attendance.length === 0) continue;

      const totalSessions = exam.attendance.length;
      const students = await User.find({ role: 'Student', className: exam.className });

      for (const student of students) {
        const studentAttendance = exam.attendance.filter(a => String(a.studentId) === String(student._id));
        const absentCount = studentAttendance.filter(a => !a.present).length;
        const absenceRate = totalSessions > 0 ? (absentCount / totalSessions) * 100 : 0;

        let status = null;
        if (absenceRate >= 66.67) status = 'at_risk';
        else if (absenceRate >= 33.34) status = 'eliminated';

        if (status) {
          const exists = await Elimination.findOne({ examId: exam._id, studentId: student._id });
          if (!exists) {
            const elimination = new Elimination({
              examId: exam._id,
              examName: exam.subject,
              studentId: student._id,
              studentName: student.name,
              className: student.className,
              absenceRate: Math.round(absenceRate * 100) / 100,
              status,
              published: false
            });
            await elimination.save();
            calculated.push(elimination);
          }
        }
      }
    }

    res.json({ message: `${calculated.length} éliminations calculées`, calculated });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/eliminations/publish', async (req, res) => {
  try {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé. Seul l\'admin peut publier les éliminations.' });
    }

    const result = await Elimination.updateMany(
      { published: false },
      { published: true, publishedBy: req.user?.name || 'Admin', publishedAt: new Date() }
    );

    res.json({ message: `${result.modifiedCount} éliminations publiées` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/eliminations/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await Elimination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Élimination supprimée' });
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
