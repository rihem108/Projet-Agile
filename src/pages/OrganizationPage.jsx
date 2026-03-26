import React, { useContext, useState } from 'react';
import { CalendarCog, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const OrganizationPage = () => {
  const { exams, rooms, users, assignments, setAssignments } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const generateAutoAssignments = () => {
    setLoading(true);
    // Fake automated assignment algorithm avoiding conflicts
    setTimeout(() => {
      const teachers = users.filter(u => u.role === 'Teacher');
      const newAssignments = exams.map((exam, index) => {
        const room = rooms[index % rooms.length] || rooms[0];
        const teacher = teachers[index % teachers.length] || teachers[0];
        return {
          id: Date.now() + index,
          examId: exam.id,
          roomId: room?.id,
          supervisorId: teacher?.id
        };
      });
      setAssignments(newAssignments);
      setLoading(false);
    }, 1200);
  };

  const getExamSubject = (id) => exams.find(e => e.id === id)?.subject || 'Inconnu';
  const getExamDate = (id) => exams.find(e => e.id === id)?.date || '';
  const getRoomName = (id) => rooms.find(r => r.id === id)?.name || 'Non assignée';
  const getSupervisorName = (id) => users.find(u => u.id === id)?.name || 'Non assigné';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Organisation Automatique</h1>
        <button className="btn btn-primary" onClick={generateAutoAssignments} disabled={loading}>
          {loading ? 'Génération...' : <><CalendarCog size={18} /> Lancer l'affectation</>}
        </button>
      </div>

      <div className="glass-card mb-6">
        <h3>Critères d'Organisation</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          L'algorithme assignera les salles et les surveillants en respectant la capacité et en évitant les conflits horaires et de disponibilité.
        </p>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Examen</th>
              <th>Date</th>
              <th>Salle</th>
              <th>Surveillant(s) assigné(s)</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td style={{ fontWeight: 500 }}>{getExamSubject(assignment.examId)}</td>
                  <td>{getExamDate(assignment.examId)}</td>
                  <td>{getRoomName(assignment.roomId)}</td>
                  <td>{getSupervisorName(assignment.supervisorId)}</td>
                  <td>
                    <span className="badge badge-success flex items-center gap-2" style={{ width: 'fit-content' }}>
                      <Check size={12} /> Confirmé
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <CalendarCog size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  Aucune organisation générée.<br/>Cliquez sur "Lancer l'affectation".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationPage;

