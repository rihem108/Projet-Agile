import React, { useContext } from 'react';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { api } from '../api';

const GradesPage = () => {
  const { grades, users, exams, setGrades } = useContext(AppContext);

  const getStudentName = (id) => users.find(u => u.id === id)?.name || 'Inconnu';
  const getExamSubject = (id) => exams.find(e => e.id === id)?.subject || 'Inconnu';

  const handleValidate = async (gradeId) => {
    const updated = await api.put(`/grades/${gradeId}`, { validated: true });
    setGrades(grades.map(g => g.id === gradeId ? updated : g));
  };

  const pendingGrades = grades.filter(g => !g.validated).length;

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

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Matière</th>
              <th>Note globale</th>
              <th>Statut de Validation</th>
              <th>Action Admin</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => (
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
                <td>
                  {!grade.validated ? (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleValidate(grade.id)}>
                      Valider Officiellement
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aucune action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesPage;

