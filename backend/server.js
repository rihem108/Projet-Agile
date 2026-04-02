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
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Cet email existe déjà' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role: role || 'Student' });
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
  const exams = await Exam.find();
  res.json(exams);
});
app.post('/api/exams', async (req, res) => {
  const exam = new Exam(req.body);
  await exam.save();
  res.json(exam);
});
app.put('/api/exams/:id', async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(exam);
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
  const grades = await Grade.find();
  res.json(grades);
});
app.post('/api/grades', async (req, res) => {
  const grade = new Grade(req.body);
  await grade.save();
  res.json(grade);
});
app.put('/api/grades/:id', async (req, res) => {
  const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(grade);
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
  const u2 = await User.create({ name: 'Bob Martin', role: 'Student', email: 'bob@exam.com', password: pass });
  const u3 = await User.create({ name: 'Charlie Durand', role: 'Student', email: 'charlie@exam.com', password: pass });
  const u4 = await User.create({ name: 'Admin Principal', role: 'Admin', email: 'admin@exam.com', password: pass });
  
  const e1 = await Exam.create({ subject: 'Mathématiques', date: '2026-05-15', duration: '2h' });
  const e2 = await Exam.create({ subject: 'Physique', date: '2026-05-16', duration: '1h30' });
  
  const r1 = await Room.create({ name: 'Salle A101', capacity: 30 });
  const r2 = await Room.create({ name: 'Amphi B', capacity: 150 });
  
  await Grade.create({ examId: e1._id, studentId: u2._id, grade: 14, validated: true });
  await Grade.create({ examId: e1._id, studentId: u3._id, grade: 8, validated: false });
  
  res.json({ message: 'Database seeded successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
