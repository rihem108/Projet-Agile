import React, { useContext, useMemo, useState } from 'react';
import { CheckCircle, ShieldAlert, Save, Trash2 } from 'lucide-react';
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
      const saved = await api.post('/grades', {
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Notes</h1>
        {pendingGrades > 0 && (
          <span className="badge badge-warning flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
            <ShieldAlert size={16} /> {pendingGrades} note(s) en attente
          </span>
        )}
      </div>

      {isTeacher && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Ajouter une note par matière</h3>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Examen / Matière</label>
                <select
                  className="form-input"
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Étudiant</label>
                <select
                  className="form-input"
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Note / 20</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  className="form-input"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, alignSelf: 'end' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Toute note saisie par le surveillant passe en attente de validation.
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Save size={16} /> Enregistrer la note
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Matière</th>
              <th>Note globale</th>
              <th>Statut de Validation</th>
              {isStaff && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayGrades.map(grade => (
              <tr key={grade.id}>
                <td style={{ fontWeight: 500 }}>{getStudentName(grade.studentId)}</td>
                <td>{getExamSubject(grade.examId)}</td>
                <td style={{ fontWeight: 600, color: grade.grade >= 10 ? 'var(--success)' : 'var(--danger)' }}>
                  {grade.grade} / 20
                </td>
                <td>
                  {grade.validated ? (
                    <span className="badge badge-success flex items-center gap-2" style={{ width: 'fit-content' }}>
                      <CheckCircle size={12} /> Validée
                    </span>
                  ) : (
                    <span className="badge badge-warning flex items-center gap-2" style={{ width: 'fit-content' }}>
                      En Attente
                    </span>
                  )}
                </td>
                {isStaff && (
                  <td>
                    {!grade.validated ? (
                      <div className="flex gap-2">
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleValidate(grade.id)}>
                          Valider Officiellement
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.4rem 0.8rem', color: 'var(--danger)' }}
                          onClick={() => handleDeleteGrade(grade.id)}
                        >
                          <Trash2 size={16} /> Supprimer
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Validée</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {displayGrades.length === 0 && (
              <tr>
                <td colSpan={isStaff ? '5' : '4'} style={{ textAlign: 'center', padding: '2rem' }}>
                  {user?.role === 'Student' ? 'Aucune note validée pour le moment.' : 'Aucune note enregistrée.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesPage;

