import React, { useContext, useState } from 'react';
import { CalendarCog, Check, Building2, DoorOpen, Users, Clock, AlertCircle, RefreshCw, UserCheck, MapPin } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

const OrganizationPage = () => {
  const { exams, rooms, users, assignments, addAssignment, setAssignments } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const generateAutoAssignments = async () => {
    if (exams.length === 0) {
      toast.error('Aucun examen disponible pour l\'affectation');
      return;
    }
    
    if (rooms.length === 0 || users.filter(u => u.role === 'Teacher').length === 0) {
      toast.error('Veuillez ajouter des salles et des surveillants avant de lancer l\'affectation');
      return;
    }
    
    setLoading(true);
    toast.success('Génération des affectations en cours...');
    
    // Simulate delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const teachers = users.filter(u => u.role === 'Teacher');
    let successCount = 0;
    
    // Generate assignments and save them to backend
    for (let i = 0; i < exams.length; i++) {
      const exam = exams[i];
      const room = rooms[i % rooms.length] || rooms[0];
      const teacher = teachers[i % teachers.length] || teachers[0];
      
      const assignmentData = {
        examId: exam.id,
        roomId: room?.id,
        supervisorId: teacher?.id,
        date: exam.date,
        time: exam.time,
        status: 'scheduled'
      };
      
      const result = await addAssignment(assignmentData);
      if (result) successCount++;
    }
    
    setLoading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} affectations générées avec succès!`);
    } else {
      toast.error('Erreur lors de la génération des affectations');
    }
  };

  const getExamSubject = (id) => exams.find(e => e.id === id)?.subject || 'Inconnu';
  const getExamDate = (id) => exams.find(e => e.id === id)?.date || '';
  const getExamDuration = (id) => exams.find(e => e.id === id)?.duration || '';
  const getRoomName = (id) => rooms.find(r => r.id === id)?.name || 'Non assignée';
  const getRoomCapacity = (id) => rooms.find(r => r.id === id)?.capacity || '-';
  const getSupervisorName = (id) => users.find(u => u.id === id)?.name || 'Non assigné';

  // Stats
  const totalExams = exams.length;
  const totalRooms = rooms.length;
  const totalTeachers = users.filter(u => u.role === 'Teacher').length;
  const assignedCount = assignments.length;

  return (
    <div className="org-container">
      {/* Header Section */}
      <div className="org-header-section">
        <div className="org-header-left">
          <div className="org-icon-wrapper">
            <CalendarCog size={28} />
          </div>
          <div>
            <h1>Organisation Automatique</h1>
            <p>Gérez l'affectation des salles et surveillants pour les examens</p>
          </div>
        </div>
        <button 
          className="org-generate-btn" 
          onClick={generateAutoAssignments} 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner-small"></div>
              Génération...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Lancer l'affectation
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="org-stats-grid">
        <div className="org-stat-card">
          <div className="org-stat-icon blue">
            <CalendarCog size={20} />
          </div>
          <div className="org-stat-info">
            <span className="org-stat-value">{totalExams}</span>
            <span className="org-stat-label">Examens</span>
          </div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-icon green">
            <DoorOpen size={20} />
          </div>
          <div className="org-stat-info">
            <span className="org-stat-value">{totalRooms}</span>
            <span className="org-stat-label">Salles</span>
          </div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-icon orange">
            <Users size={20} />
          </div>
          <div className="org-stat-info">
            <span className="org-stat-value">{totalTeachers}</span>
            <span className="org-stat-label">Surveillants</span>
          </div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-icon purple">
            <Check size={20} />
          </div>
          <div className="org-stat-info">
            <span className="org-stat-value">{assignedCount}</span>
            <span className="org-stat-label">Affectations</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="org-info-card">
        <div className="org-info-icon">
          <AlertCircle size={20} />
        </div>
        <div className="org-info-content">
          <h3>Critères d'Organisation</h3>
          <p>L'algorithme assignera les salles et les surveillants en respectant la capacité et en évitant les conflits horaires et de disponibilité.</p>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="org-table-wrapper">
        <div className="org-table-header">
          <h3>Planning des Affectations</h3>
          <span className="org-table-badge">
            {assignedCount} / {totalExams} assignés
          </span>
        </div>
        
        <div className="org-table-container">
          {assignments.length > 0 ? (
            <table className="org-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Date</th>
                  <th>Durée</th>
                  <th>Salle</th>
                  <th>Capacité</th>
                  <th>Surveillant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="exam-cell">{getExamSubject(assignment.examId)}</td>
                    <td>{getExamDate(assignment.examId)}</td>
                    <td>{getExamDuration(assignment.examId) || '2h'}</td>
                    <td>
                      {getRoomName(assignment.roomId) === 'Non assignée' ? (
                        <span className="unassigned-badge">
                          <AlertCircle size={12} />
                          {getRoomName(assignment.roomId)}
                        </span>
                      ) : (
                        <span className="room-badge">
                          <MapPin size={12} />
                          {getRoomName(assignment.roomId)}
                        </span>
                      )}
                    </td>
                    <td>{getRoomCapacity(assignment.roomId)}</td>
                    <td>
                      {getSupervisorName(assignment.supervisorId) === 'Non assigné' ? (
                        <span className="unassigned-badge">
                          <AlertCircle size={12} />
                          {getSupervisorName(assignment.supervisorId)}
                        </span>
                      ) : (
                        <span className="supervisor-badge">
                          <UserCheck size={12} />
                          {getSupervisorName(assignment.supervisorId)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="status-badge confirmed">
                        <Check size={12} />
                        Confirmé
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="org-empty-state">
              <div className="empty-icon">
                <CalendarCog size={48} />
              </div>
              <h4>Aucune organisation générée</h4>
              <p>Cliquez sur "Lancer l'affectation" pour générer automatiquement<br />l'assignation des salles et surveillants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;