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
const CorrectionRequest = require('./models/CorrectionRequest');
const ResourceLink = require('./models/ResourceLink');
const Notification = require('./models/Notification');

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
  try {
    const { name, email, password, role, className, status, phone, address, department, joinDate } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email et password sont obligatoires' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student',
      className: role === 'Student' ? className : undefined,
      status,
      phone,
      address,
      department,
      joinDate
    });
    await user.save();
    const userResponse = await User.findById(user._id);
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.put('/api/users/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
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
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const {
      subject,
      className,
      code,
      date,
      time,
      duration,
      room,
      supervisor,
      coefficient,
      maxScore,
      type,
      status,
      description
    } = req.body;

    if (!subject || !date || !duration) {
      return res.status(400).json({ message: 'subject, date et duration sont obligatoires' });
    }

    const exam = new Exam({
      subject: String(subject || '').trim(),
      className: String(className || '').trim() || 'Non definie',
      code: String(code || '').trim(),
      date,
      time: String(time || '').trim(),
      duration,
      room: String(room || '').trim(),
      supervisor: String(supervisor || '').trim(),
      coefficient: String(coefficient || '').trim(),
      maxScore: String(maxScore || '').trim(),
      type: type || 'normal',
      status: status || 'scheduled',
      description: String(description || '').trim(),
      createdBy: req.user?.id
    });

    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.put('/api/exams/:id', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const {
      subject,
      className,
      code,
      date,
      time,
      duration,
      room,
      supervisor,
      coefficient,
      maxScore,
      type,
      status,
      description
    } = req.body;

    if (subject !== undefined) exam.subject = String(subject || '').trim();
    if (className !== undefined) exam.className = String(className || '').trim() || 'Non definie';
    if (code !== undefined) exam.code = String(code || '').trim();
    if (date !== undefined) exam.date = date;
    if (time !== undefined) exam.time = String(time || '').trim();
    if (duration !== undefined) exam.duration = duration;
    if (room !== undefined) exam.room = String(room || '').trim();
    if (supervisor !== undefined) exam.supervisor = String(supervisor || '').trim();
    if (coefficient !== undefined) exam.coefficient = String(coefficient || '').trim();
    if (maxScore !== undefined) exam.maxScore = String(maxScore || '').trim();
    if (type !== undefined) exam.type = type;
    if (status !== undefined) exam.status = status;
    if (description !== undefined) exam.description = String(description || '').trim();

    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
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

    const { examId, studentId, grade, validated, courseraLink } = req.body;
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
      autoGenerated: false,
      courseraLink: courseraLink || null
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

    if (req.body.courseraLink !== undefined) {
      record.courseraLink = req.body.courseraLink || null;
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

// RESOURCE LINKS
app.get('/api/resource-links', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      const links = await ResourceLink.find({ studentId: req.user.id })
        .populate('studentId', 'name className')
        .populate('createdBy', 'name role');
      return res.json(links);
    }

    const links = await ResourceLink.find()
      .populate('studentId', 'name className')
      .populate('createdBy', 'name role');
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/resource-links', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { studentId, link, title, description } = req.body;
    if (!studentId || !link) {
      return res.status(400).json({ message: 'studentId et link sont obligatoires' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(400).json({ message: 'Étudiant invalide' });
    }

    const resourceLink = new ResourceLink({
      studentId,
      link: link.trim(),
      title: title || '',
      description: description || '',
      createdBy: req.user.id
    });
    await resourceLink.save();

    // Create notification for the student
    const notification = new Notification({
      userId: studentId,
      type: 'resource_link',
      message: `Votre enseignant vous a assigné un nouveau lien de cours${title ? ' : ' + title : ''}.`,
      relatedId: resourceLink._id
    });
    await notification.save();

    const populated = await ResourceLink.findById(resourceLink._id)
      .populate('studentId', 'name className')
      .populate('createdBy', 'name role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/resource-links/:id', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await ResourceLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lien supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// CORRECTION REQUESTS
app.get('/api/correction-requests', async (req, res) => {
  try {
    if (req.user?.role === 'Student') {
      // Students can only see their own requests
      const requests = await CorrectionRequest.find({ studentId: req.user.id })
        .populate('studentId', 'name className')
        .populate('gradeId', 'grade examId')
        .populate('examId', 'subject className date')
        .populate('teacherId', 'name email')
        .populate('reviewedByAdmin', 'name')
        .populate('reviewedByTeacher', 'name')
        .sort({ createdAt: -1 });
      return res.json(requests);
    }

    if (req.user?.role === 'Teacher') {
      // Teachers can see requests assigned to them
      const requests = await CorrectionRequest.find({ 
        status: { $in: ['admin_approved', 'teacher_reviewed', 'completed'] },
        teacherId: req.user.id 
      })
        .populate('studentId', 'name className')
        .populate('gradeId', 'grade examId')
        .populate('examId', 'subject className date')
        .populate('teacherId', 'name email')
        .populate('reviewedByAdmin', 'name')
        .populate('reviewedByTeacher', 'name')
        .sort({ createdAt: -1 });
      return res.json(requests);
    }

    // Admin can see all requests
    const requests = await CorrectionRequest.find()
      .populate('studentId', 'name className')
      .populate('gradeId', 'grade examId')
      .populate('examId', 'subject className date')
      .populate('teacherId', 'name email')
      .populate('reviewedByAdmin', 'name')
      .populate('reviewedByTeacher', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/correction-requests', async (req, res) => {
  try {
    if (req.user?.role !== 'Student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { gradeId, type, reason, description } = req.body;
    if (!gradeId || !type || !reason) {
      return res.status(400).json({ message: 'gradeId, type et reason sont obligatoires' });
    }

    // Check if grade exists and belongs to the student
    const grade = await Grade.findById(gradeId).populate('examId');
    if (!grade || String(grade.studentId) !== String(req.user.id)) {
      return res.status(400).json({ message: 'Note invalide' });
    }

    // Find the teacher assigned to this exam
    const assignment = await Assignment.findOne({ examId: grade.examId._id });
    if (!assignment) {
      return res.status(400).json({ message: 'Aucun enseignant assigné à cet examen' });
    }

    // Check if request already exists for this grade
    const existingRequest = await CorrectionRequest.findOne({ 
      gradeId, 
      studentId: req.user.id,
      status: { $in: ['pending', 'admin_approved'] }
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Une demande existe déjà pour cette note' });
    }

    const correctionRequest = new CorrectionRequest({
      studentId: req.user.id,
      gradeId,
      examId: grade.examId._id,
      teacherId: assignment.supervisorId,
      type,
      reason: reason.trim(),
      description: description?.trim() || ''
    });

    await correctionRequest.save();

    // Create notifications for all admins
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        userId: admin._id,
        type: 'correction_request',
        message: `Nouvelle demande de ${type === 'second_correction' ? 'seconde correction' : 'vérification de note'} pour ${grade.examId.subject}`,
        relatedId: correctionRequest._id
      });
      await adminNotification.save();
    }

    const populated = await CorrectionRequest.findById(correctionRequest._id)
      .populate('studentId', 'name className')
      .populate('gradeId', 'grade examId')
      .populate('examId', 'subject className date')
      .populate('teacherId', 'name email');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/correction-requests/:id/admin-decision', async (req, res) => {
  try {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { decision, approved } = req.body;
    if (!decision) {
      return res.status(400).json({ message: 'La décision est obligatoire' });
    }

    const request = await CorrectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }

    request.status = approved ? 'admin_approved' : 'admin_rejected';
    request.adminDecision = decision.trim();
    request.reviewedByAdmin = req.user.id;
    request.adminReviewedAt = new Date();
    request.updatedAt = new Date();

    await request.save();

    if (approved) {
      // Create notification for teacher
      const teacherNotification = new Notification({
        userId: request.teacherId,
        type: 'correction_request_approved',
        message: `Demande de ${request.type === 'second_correction' ? 'seconde correction' : 'vérification de note'} approuvée pour ${request.examId}`,
        relatedId: request._id
      });
      await teacherNotification.save();
    }

    const populated = await CorrectionRequest.findById(request._id)
      .populate('studentId', 'name className')
      .populate('gradeId', 'grade examId')
      .populate('examId', 'subject className date')
      .populate('teacherId', 'name email')
      .populate('reviewedByAdmin', 'name');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/correction-requests/:id/teacher-decision', async (req, res) => {
  try {
    if (req.user?.role !== 'Teacher') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { decision, newGrade } = req.body;
    if (!decision) {
      return res.status(400).json({ message: 'La décision est obligatoire' });
    }

    const request = await CorrectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }

    if (String(request.teacherId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Cette demande ne vous est pas assignée' });
    }

    if (request.status !== 'admin_approved') {
      return res.status(400).json({ message: 'Cette demande n\'a pas été approuvée par l\'administration' });
    }

    request.status = 'teacher_reviewed';
    request.teacherDecision = decision.trim();
    request.reviewedByTeacher = req.user.id;
    request.teacherReviewedAt = new Date();
    request.updatedAt = new Date();

    if (newGrade !== undefined && newGrade !== null) {
      if (newGrade < 0 || newGrade > 20) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 20' });
      }
      request.newGrade = newGrade;

      // Update the actual grade
      await Grade.findByIdAndUpdate(request.gradeId, { 
        grade: newGrade,
        validated: false // Teacher grade changes need revalidation
      });
    }

    await request.save();

    // Create notification for student
    const studentNotification = new Notification({
      userId: request.studentId,
      type: 'correction_request_completed',
      message: `Votre demande de ${request.type === 'second_correction' ? 'seconde correction' : 'vérification de note'} a été traitée`,
      relatedId: request._id
    });
    await studentNotification.save();

    const populated = await CorrectionRequest.findById(request._id)
      .populate('studentId', 'name className')
      .populate('gradeId', 'grade examId')
      .populate('examId', 'subject className date')
      .populate('teacherId', 'name email')
      .populate('reviewedByTeacher', 'name');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/correction-requests/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await CorrectionRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demande supprimée' });
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
  await CorrectionRequest.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const pass = await bcrypt.hash('123456', salt);

  const u1 = await User.create({ name: 'Alice Dupont', role: 'Teacher', email: 'alice@exam.com', password: pass });
  const u2 = await User.create({ name: 'Bob Martin', role: 'Student', className: 'L1 INFO A', email: 'bob@exam.com', password: pass });
  const u3 = await User.create({ name: 'Charlie Durand', role: 'Student', className: 'L1 INFO B', email: 'charlie@exam.com', password: pass });
  const u4 = await User.create({ name: 'Admin Principal', role: 'Admin', email: 'admin@exam.com', password: pass });
  
  const e1 = await Exam.create({ subject: 'Mathématiques', className: 'L1 INFO A', date: '2026-05-15', duration: '2h' });
  const e2 = await Exam.create({ subject: 'Physique', className: 'L1 INFO B', date: '2026-05-16', duration: '1h30' });
  
  const r1 = await Room.create({ name: 'Salle A101', building: 'A', capacity: 30 });
  const r2 = await Room.create({ name: 'Amphi B', building: 'B', capacity: 150 });
  
  await Grade.create({ examId: e1._id, studentId: u2._id, grade: 14, validated: true });
  await Grade.create({ examId: e1._id, studentId: u3._id, grade: 8, validated: false });
  
  res.json({ message: 'Database seeded successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
