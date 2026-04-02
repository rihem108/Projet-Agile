import React, { useContext } from 'react';
import { Users, BookOpen, MapPin, CheckCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Dashboard = () => {
  const { users, exams, rooms, grades, user } = useContext(AppContext);
  const role = user?.role || 'Student';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tableau de Bord</h1>
      </div>

      <div className="stats-grid">
        {(role === 'Admin' || role === 'Teacher') && (
          <div className="glass-card stat-card">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Total Utilisateurs</span>
              <span className="stat-value">{users.length}</span>
            </div>
          </div>
        )}
        
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--secondary)' }}><BookOpen size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Examens Planifiés</span>
            <span className="stat-value">{exams.length}</span>
          </div>
        </div>

        {(role === 'Admin' || role === 'Teacher') && (
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><MapPin size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Salles Disponibles</span>
              <span className="stat-value">{rooms.length}</span>
            </div>
          </div>
        )}

        {(role === 'Admin' || role === 'Teacher') && (
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><CheckCircle size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Notes à Valider</span>
              <span className="stat-value">{grades.filter(g => !g.validated).length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Flux d'Activité Récent</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Bienvenue sur le module. En tant que {role}, utilisez la barre latérale pour naviguer.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

