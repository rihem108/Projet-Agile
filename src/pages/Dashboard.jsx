// src/pages/Dashboard.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, BookOpen, MapPin, CheckCircle, TrendingUp, Calendar, Clock, Award } from 'lucide-react';

const Dashboard = () => {
  const { user, users, exams, rooms, grades } = useContext(AppContext);
  const role = user?.role || 'Student';

  // Stats data based on role
  const stats = [
    { 
      title: 'Total Utilisateurs', 
      value: users?.length || 0, 
      icon: Users, 
      color: '#3B82F6',
      change: '+12%',
      visible: ['Admin']
    },
    { 
      title: 'Examens Planifiés', 
      value: exams?.length || 0, 
      icon: BookOpen, 
      color: '#10B981',
      change: '+5%',
      visible: ['Admin', 'Teacher', 'Student']
    },
    { 
      title: 'Salles Disponibles', 
      value: rooms?.length || 0, 
      icon: MapPin, 
      color: '#F59E0B',
      change: '+2%',
      visible: ['Admin']
    },
    { 
      title: 'Notes à Valider', 
      value: grades?.filter(g => !g.validated)?.length || 0, 
      icon: CheckCircle, 
      color: '#EF4444',
      change: '-3%',
      visible: ['Admin', 'Teacher']
    },
  ];

  const visibleStats = stats.filter(stat => stat.visible.includes(role));

  // Recent activity (mock data)
  const recentActivities = [
    { id: 1, action: 'Nouvel examen ajouté', user: 'Admin', time: 'Il y a 5 minutes', icon: Calendar },
    { id: 2, action: 'Salle B202 réservée', user: 'Teacher', time: 'Il y a 1 heure', icon: MapPin },
    { id: 3, action: 'Notes publiées pour Mathématiques', user: 'Teacher', time: 'Il y a 3 heures', icon: Award },
    { id: 4, action: 'Nouvel utilisateur inscrit', user: 'Student', time: 'Il y a 5 heures', icon: Users },
  ];

  return (
    <div>
      {/* Page Header - Reduced spacing */}
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <p>Bienvenue {user?.name || 'Admin'} ! Voici un aperçu de votre espace</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {visibleStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <stat.icon size={22} />
              </div>
              <span className="stat-change positive">
                <TrendingUp size={12} />
                {stat.change}
              </span>
            </div>
            <div className="stat-value">
              {stat.value}
            </div>
            <div className="stat-label">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity-card">
        <div className="activity-header">
          <h2>Flux d'Activité Récent</h2>
          <button className="btn-secondary btn-sm">Voir tout</button>
        </div>
        <div className="activity-list">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <activity.icon size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-action">{activity.action}</p>
                <p className="activity-meta">par {activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;