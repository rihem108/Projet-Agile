// src/pages/ReportsPage.jsx
import React, { useState, useContext } from 'react';
import { FileText, Printer, Download, Calendar, Clock, MapPin, User, AlertCircle, CheckCircle, TrendingUp, Filter, Search, GraduationCap } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ReportsPage = () => {
  const { exams, assignments, rooms, users } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Get teachers
  const teachers = users?.filter(u => u.role === 'Teacher') || [];

  // Create exam reports with assignment data
  const createExamReports = () => {
    return exams?.map(exam => {
      const assignment = assignments?.find(a => a.examId === exam.id);
      const room = rooms?.find(r => r.id === assignment?.roomId);
      const supervisor = teachers?.find(t => t.id === assignment?.supervisorId);
      
      return {
        id: exam.id,
        subject: exam.subject,
        code: exam.code,
        date: exam.date,
        time: exam.time,
        duration: exam.duration,
        room: room?.name || 'Non assignée',
        supervisor: supervisor?.name || 'Non assigné',
        status: exam.status,
        students: 45 // This could be calculated from actual student data
      };
    }) || [];
  };

  const examReports = createExamReports();

  const filteredExams = examReports.filter(exam => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exam.code && exam.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePrint = () => window.print();
  const handleExportPDF = () => alert('Export PDF en cours de développement');

  return (
    <div className="reports-container">
      {/* Header Section */}
      <div className="reports-header-section">
        <div className="reports-header-left">
          <div className="reports-icon-wrapper">
            <FileText size={28} />
          </div>
          <div>
            <h1>Rapports & Documents</h1>
            <p>Gérez et exportez vos rapports d'examens</p>
          </div>
        </div>
        <div className="reports-header-right">
          <button className="action-btn action-btn-outline" onClick={handlePrint}>
            <Printer size={16} />
            Imprimer
          </button>
          <button className="action-btn action-btn-primary" onClick={handleExportPDF}>
            <Download size={16} />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card">
          <div className="report-stat-icon blue">
            <FileText size={20} />
          </div>
          <div className="report-stat-info">
            <span className="report-stat-value">{exams.length}</span>
            <span className="report-stat-label">Total Examens</span>
          </div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-icon yellow">
            <Clock size={20} />
          </div>
          <div className="report-stat-info">
            <span className="report-stat-value">{exams.filter(e => e.status === 'scheduled').length}</span>
            <span className="report-stat-label">À Venir</span>
          </div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-icon green">
            <CheckCircle size={20} />
          </div>
          <div className="report-stat-info">
            <span className="report-stat-value">{exams.filter(e => e.status === 'completed').length}</span>
            <span className="report-stat-label">Terminés</span>
          </div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-icon purple">
            <TrendingUp size={20} />
          </div>
          <div className="report-stat-info">
            <span className="report-stat-value">{exams.reduce((acc, e) => acc + e.students, 0)}</span>
            <span className="report-stat-label">Étudiants</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filters">
        <div className="search-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par matière ou code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifiés</option>
            <option value="completed">Terminés</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="reports-table-wrapper">
        <div className="table-header">
          <h3>Planning Officiel des Examens</h3>
          <span className="academic-badge">2025/2026</span>
        </div>
        
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Code</th>
                <th>Date</th>
                <th>Horaire</th>
                <th>Durée</th>
                <th>Salle</th>
                <th>Surveillant</th>
                <th>Étudiants</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.id}>
                  <td className="subject-cell">{exam.subject}</td>
                  <td className="code-cell">{exam.code || '-'}</td>
                  <td>{new Date(exam.date).toLocaleDateString('fr-FR')}</td>
                  <td>{exam.time || '-'}</td>
                  <td>{exam.duration}</td>
                  <td>
                    {exam.room === 'Non assignée' ? (
                      <span className="unassigned-badge">
                        <AlertCircle size={12} />
                        À assigner
                      </span>
                    ) : (
                      <span className="room-badge">{exam.room}</span>
                    )}
                  </td>
                  <td>
                    {exam.supervisor === 'Non assigné' ? (
                      <span className="unassigned-badge">
                        <AlertCircle size={12} />
                        À assigner
                      </span>
                    ) : (
                      <span className="supervisor-badge">
                        <GraduationCap size={12} />
                        {exam.supervisor}
                      </span>
                    )}
                  </td>
                  <td className="students-cell">{exam.students}</td>
                  <td>
                    <span className={`status-indicator status-${exam.status}`}>
                      {exam.status === 'scheduled' ? 'Planifié' : 'Terminé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>

        {/* Footer */}
        <div className="reports-footer">
          <div className="footer-stats">
            <span className="footer-stat">
              <FileText size={14} />
              {filteredExams.length} examens affichés
            </span>
            <span className="footer-stat">
              <Calendar size={14} />
              Généré le {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="footer-note">
            Document officiel - Planning des examens
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;