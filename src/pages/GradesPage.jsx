import React, { useContext, useState } from 'react';
import { CheckCircle, ShieldAlert, Save, Trash2, BookOpen, Clock, Award, ClipboardList } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

const GradesPage = () => {
  const { grades, users, exams, setGrades, user } = useContext(AppContext);
  const isTeacher = user?.role === 'Teacher';
  const isStaff = user?.role === 'Teacher' || user?.role === 'Admin';
  const [formData, setFormData] = useState({ className: '', examName: '', studentName: '', grade: '' });
  const [saving, setSaving] = useState(false);

  const getStudentName = (id) => users.find(u => u.id === id)?.name || 'Inconnu';
  const getExamSubject = (id) => exams.find(e => e.id === id)?.subject || 'Inconnu';

  // Available classes — hardcoded list
  const AVAILABLE_CLASSES = [
    'L1 Tech',
    'L2 Tech',
    'L3 Tech',
    'M1 Tech',
    'M2 Tech',
    'L1 Business',
    'L2 Business',
    'L3 Business',
    'M1 Business',
    'M2 Business',
    "Cycle d'ingénieur",
    'Cycle préparatoire',
  ];

  const handleValidate = async (gradeId) => {
    try {
      const updated = await api.put(`/grades/${gradeId}`, { validated: true });
      setGrades(grades.map(g => g.id === gradeId ? updated : g));
      toast.success('Note validée');
    } catch (err) {
      console.error(err);
      toast.error('Validation impossible');
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.className || !formData.examName.trim() || !formData.studentName.trim() || formData.grade === '') {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Find exam by name (flexible match)
    const searchExamName = formData.examName.toLowerCase().trim();
    const selectedClass = formData.className.trim().toLowerCase();
    const exam = exams.find(e => {
      const examClass = String(e.className || '').trim().toLowerCase();
      const examSubject = String(e.subject || '').trim().toLowerCase();
      const classMatch = examClass === selectedClass || examClass.includes(selectedClass) || selectedClass.includes(examClass);
      const subjectMatch = examSubject.includes(searchExamName) || searchExamName.includes(examSubject);
      return classMatch && subjectMatch;
    });
    if (!exam) {
      console.log('DEBUG - All exams:', exams);
      console.log('DEBUG - Searching class:', formData.className, 'subject:', formData.examName);
      const allExamsList = exams.length ? exams.map(e => `  - ${e.subject} (classe: ${e.className})`).join(' | ') : '(aucun examen dans le systeme)';
      toast.error(`Examen "${formData.examName}" non trouve pour ${formData.className}. Examens existants: ${allExamsList}`, { duration: 8000 });
      return;
    }

    // Find student by name (flexible match)
    const searchStudentName = formData.studentName.toLowerCase().trim();
    const student = users.find(u => {
      const userClass = String(u.className || '').trim().toLowerCase();
      const userName = String(u.name || '').trim().toLowerCase();
      const classMatch = userClass === selectedClass || userClass.includes(selectedClass) || selectedClass.includes(userClass);
      const nameMatch = userName.includes(searchStudentName) || searchStudentName.includes(userName);
      return u.role === 'Student' && classMatch && nameMatch;
    });
    if (!student) {
      console.log('DEBUG - All students:', users.filter(u => u.role === 'Student'));
      const allStudentsList = users.filter(u => u.role === 'Student').map(u => `  - ${u.name} (classe: ${u.className})`).join(' | ') || '(aucun etudiant dans le systeme)';
      toast.error(`Etudiant "${formData.studentName}" non trouve pour ${formData.className}. Etudiants existants: ${allStudentsList}`, { duration: 8000 });
      return;
    }

    try {
      setSaving(true);
      await api.post('/grades', {
        examId: exam.id,
        studentId: student.id,
        grade: Number(formData.grade),
        validated: false
      });

      const refreshedGrades = await api.get('/grades');
      setGrades(refreshedGrades);
      toast.success('Note enregistrée');
      setFormData({ className: '', examName: '', studentName: '', grade: '' });
    } catch (err) {
      console.error(err);
      toast.error('Enregistrement de la note impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm('Supprimer cette note ?')) return;

    try {
      await api.delete(`/grades/${gradeId}`);
      setGrades(grades.filter(item => item.id !== gradeId));
      toast.success('Note supprimée');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Suppression impossible');
    }
  };

  const displayGrades = user?.role === 'Student'
    ? grades.filter(g => g.studentId === user.id && g.validated)
    : grades;

  const pendingGrades = isStaff
    ? displayGrades.filter(g => !g.validated).length
    : 0;

  const totalGrades = displayGrades.length;
  const validatedGrades = displayGrades.filter(g => g.validated).length;
  const averageGrade = totalGrades > 0
    ? (displayGrades.reduce((acc, g) => acc + g.grade, 0) / totalGrades).toFixed(2)
    : '0.00';

  return (
    <div className="grades-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.06))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', flexShrink: 0 }}>
            <ClipboardList size={26} />
          </div>
          <h1 className="page-title">Gestion des Notes</h1>
        </div>
        {pendingGrades > 0 && (
          <span className="badge badge-warning flex items-center gap-2">
            <ShieldAlert size={16} /> {pendingGrades} note(s) en attente
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grades-stats-grid">
        <div className="grades-stat-card">
          <div className="grades-stat-icon blue">
            <BookOpen size={22} />
          </div>
          <div className="grades-stat-info">
            <span className="grades-stat-value">{totalGrades}</span>
            <span className="grades-stat-label">Total Notes</span>
          </div>
        </div>
        <div className="grades-stat-card">
          <div className="grades-stat-icon amber">
            <Clock size={22} />
          </div>
          <div className="grades-stat-info">
            <span className="grades-stat-value">{pendingGrades}</span>
            <span className="grades-stat-label">En Attente</span>
          </div>
        </div>
        <div className="grades-stat-card">
          <div className="grades-stat-icon emerald">
            <CheckCircle size={22} />
          </div>
          <div className="grades-stat-info">
            <span className="grades-stat-value">{validatedGrades}</span>
            <span className="grades-stat-label">Validées</span>
          </div>
        </div>
        <div className="grades-stat-card">
          <div className="grades-stat-icon violet">
            <Award size={22} />
          </div>
          <div className="grades-stat-info">
            <span className="grades-stat-value">{averageGrade}</span>
            <span className="grades-stat-label">Moyenne</span>
          </div>
        </div>
      </div>

      {/* Teacher Form */}
      {isTeacher && (
        <div className="grades-form-card">
          <h3>Ajouter une note par matière</h3>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="grades-form-grid">
              <div className="grades-form-group">
                <label>Classe</label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ className: e.target.value, examId: '', studentId: '', grade: '' })}
                >
                  <option value="">Toutes les classes</option>
                  {AVAILABLE_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="grades-form-group">
                <label>Examen / Matière</label>
                <input
                  type="text"
                  placeholder="Entrer le nom de l'examen"
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  required
                  disabled={!formData.className}
                />
              </div>

              <div className="grades-form-group">
                <label>Étudiant</label>
                <input
                  type="text"
                  placeholder="Entrer le nom de l'étudiant"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  required
                  disabled={!formData.className}
                />
              </div>

              <div className="grades-form-group">
                <label>Note / 20</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                />
              </div>

              <div className="grades-form-note">
                Toute note saisie par le surveillant passe en attente de validation.
              </div>
            </div>

            <button className="grades-submit-btn" type="submit" disabled={saving}>
              <Save size={16} /> Enregistrer la note
            </button>
          </form>
        </div>
      )}

      {/* Grades Table */}
      <div className="grades-table-card">
        <div className="grades-table-header">
          <h3>Liste des Notes</h3>
          <span className="grades-table-count">{totalGrades} entrée(s)</span>
        </div>
        <div className="grades-table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Matière</th>
                <th>Note</th>
                <th>Statut</th>
                {isStaff && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayGrades.map(grade => (
                <tr key={grade.id}>
                  <td className="student-cell">{getStudentName(grade.studentId)}</td>
                  <td className="subject-cell">{getExamSubject(grade.examId)}</td>
                  <td className={`grade-cell ${grade.grade >= 10 ? 'grade-pass' : 'grade-fail'}`}>
                    {grade.grade} / 20
                  </td>
                  <td>
                    {grade.validated ? (
                      <span className="grades-badge success">
                        <CheckCircle size={12} /> Validée
                      </span>
                    ) : (
                      <span className="grades-badge warning">
                        En Attente
                      </span>
                    )}
                  </td>
                  {isStaff && (
                    <td>
                      {!grade.validated ? (
                        <div className="grades-actions">
                          <button className="grades-btn validate" onClick={() => handleValidate(grade.id)}>
                            Valider
                          </button>
                          <button className="grades-btn delete" onClick={() => handleDeleteGrade(grade.id)}>
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      ) : (
                        <span className="grades-text-muted">Validée</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {displayGrades.length === 0 && (
                <tr>
                  <td colSpan={isStaff ? 5 : 4} className="grades-empty">
                    <h4>Aucune note</h4>
                    <p>{user?.role === 'Student' ? 'Aucune note validée pour le moment.' : 'Aucune note enregistrée.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;

