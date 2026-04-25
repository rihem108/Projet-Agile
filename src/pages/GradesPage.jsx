import React, { useContext, useMemo, useState } from 'react';
import { CheckCircle, ShieldAlert, Save, Trash2, BookOpen, Clock, Award, ClipboardList } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

const GradesPage = () => {
  const { grades, users, exams, assignments, setGrades, user } = useContext(AppContext);
  const isTeacher = user?.role === 'Teacher';
  const isStaff = user?.role === 'Teacher' || user?.role === 'Admin';
  const [formData, setFormData] = useState({ examId: '', studentId: '', grade: '' });
  const [saving, setSaving] = useState(false);

  const getStudentName = (id) => users.find(u => u.id === id)?.name || 'Inconnu';
  const getExamSubject = (id) => exams.find(e => e.id === id)?.subject || 'Inconnu';

  const selectableExams = useMemo(() => {
    if (user?.role === 'Admin') return exams;
    if (user?.role === 'Teacher') {
      const assignedExamIds = new Set(
        assignments
          .filter(item => item.supervisorId === user.id)
          .map(item => item.examId)
      );
      return exams.filter(exam => assignedExamIds.has(exam.id));
    }
    return [];
  }, [assignments, exams, user]);

  const selectableStudents = useMemo(() => {
    if (!formData.examId) return [];
    const exam = exams.find(item => item.id === formData.examId);
    if (!exam) return [];
    return users
      .filter(person => person.role === 'Student' && String(person.className || '').trim() === String(exam.className || '').trim())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exams, formData.examId, users]);

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
    if (!formData.examId || !formData.studentId || formData.grade === '') {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSaving(true);
      await api.post('/grades', {
        examId: formData.examId,
        studentId: formData.studentId,
        grade: Number(formData.grade),
        validated: false
      });

      const refreshedGrades = await api.get('/grades');
      setGrades(refreshedGrades);
      toast.success('Note enregistrée');
      setFormData(current => ({ ...current, grade: '' }));
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
                <label>Examen / Matière</label>
                <select
                  value={formData.examId}
                  onChange={(e) => setFormData({ examId: e.target.value, studentId: '', grade: '' })}
                  required
                >
                  <option value="">Sélectionner un examen</option>
                  {selectableExams.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.subject} - {exam.className}</option>
                  ))}
                </select>
              </div>

              <div className="grades-form-group">
                <label>Étudiant</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  disabled={!formData.examId}
                >
                  <option value="">Sélectionner un étudiant</option>
                  {selectableStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
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

