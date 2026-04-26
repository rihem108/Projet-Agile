import React, { useState, useContext, useMemo } from 'react';
import {
  AlertTriangle,
  Trash2,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calculator,
  Send,
  Loader2,
  Clock,
  Percent,
  Users
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useElimination } from '../context/EliminationContext';
import toast from 'react-hot-toast';
import './EliminationPage.css';

const EliminationPage = () => {
  const { user } = useContext(AppContext);
  const {
    eliminations,
    loading,
    calculating,
    publishing,
    calculateEliminations,
    publishEliminations,
    deleteElimination,
    getEliminatedStudents,
    getAtRiskStudents,
    getUnpublishedCount,
    getStatusLabel,
    getStatusColor
  } = useElimination();

  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const role = user?.role || 'Student';
  const isAdmin = role === 'Admin';
  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Student';

  const eliminated = getEliminatedStudents();
  const atRisk = getAtRiskStudents();
  const unpublishedCount = getUnpublishedCount();

  const filteredEliminations = useMemo(() => {
    if (filterStatus === 'all') return eliminations;
    return eliminations.filter(elim => elim.status === filterStatus);
  }, [eliminations, filterStatus]);

  const getStatusIcon = (status) => {
    if (status === 'eliminated') return <XCircle size={18} />;
    return <AlertCircle size={18} />;
  };

  const getStatusClass = (status) => {
    if (status === 'eliminated') return 'status-eliminated';
    return 'status-at-risk';
  };

  const getAbsenceColor = (rate) => {
    if (rate >= 66.67) return '#F59E0B';
    if (rate >= 33.34) return '#EF4444';
    return '#10B981';
  };

  const handleCalculate = async () => {
    await calculateEliminations();
  };

  const handlePublish = async () => {
    if (unpublishedCount === 0) {
      toast.info('Aucune élimination à publier');
      return;
    }
    if (window.confirm(`Publier ${unpublishedCount} élimination(s) ? Les enseignants et étudiants pourront les voir.`)) {
      await publishEliminations();
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      await deleteElimination(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Student view
  if (isStudent) {
    const myEliminations = eliminations.filter(e => String(e.studentId) === String(user?.id));

    return (
      <div className="elim-page">
        <div className="elim-hero">
          <div className="elim-hero-content">
            <div className="elim-hero-icon">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1>Mes Éliminations</h1>
              <p>Consultez votre statut par matière (basé sur les absences)</p>
            </div>
          </div>
        </div>

        {/* Stats Cards for Student */}
        <div className="elim-stats-grid">
          <div className="elim-stat-card">
            <div className="elim-stat-icon eliminated">
              <XCircle size={20} />
            </div>
            <div className="elim-stat-info">
              <span className="elim-stat-value">{myEliminations.filter(e => e.status === 'eliminated').length}</span>
              <span className="elim-stat-label">Éliminés 🔴</span>
            </div>
          </div>
          <div className="elim-stat-card">
            <div className="elim-stat-icon at-risk">
              <AlertCircle size={20} />
            </div>
            <div className="elim-stat-info">
              <span className="elim-stat-value">{myEliminations.filter(e => e.status === 'at_risk').length}</span>
              <span className="elim-stat-label">À risque 🟡</span>
            </div>
          </div>
        </div>

        {myEliminations.length > 0 ? (
          <div className="elim-table-wrapper">
            <div className="elim-table-header">
              <h3>Mes matières</h3>
              <span className="elim-count">{myEliminations.length} résultat(s)</span>
            </div>
            <div className="elim-table-container">
              <table className="elim-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Taux d'absence</th>
                    <th>Statut</th>
                    <th>Publié le</th>
                  </tr>
                </thead>
                <tbody>
                  {myEliminations.map((elim) => (
                    <tr key={elim.id} className={`elim-row ${elim.status}`}>
                      <td className="exam-name">{elim.examName}</td>
                      <td>
                        <div className="absence-rate-cell">
                          <div className="absence-bar-bg">
                            <div
                              className="absence-bar-fill"
                              style={{
                                width: `${Math.min(elim.absenceRate, 100)}%`,
                                backgroundColor: getAbsenceColor(elim.absenceRate)
                              }}
                            />
                          </div>
                          <span className="absence-rate-value" style={{ color: getAbsenceColor(elim.absenceRate) }}>
                            {elim.absenceRate}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`elim-status ${getStatusClass(elim.status)}`}>
                          {getStatusIcon(elim.status)}
                          {getStatusLabel(elim.status)}
                        </span>
                      </td>
                      <td>
                        {elim.publishedAt
                          ? new Date(elim.publishedAt).toLocaleDateString('fr-FR')
                          : <span className="not-published">Non publié</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="elim-empty-state">
            <div className="elim-empty-icon">
              <CheckCircle size={48} />
            </div>
            <h4>Aucune élimination</h4>
            <p>Vous n'avez été éliminé d'aucune matière pour le moment.</p>
          </div>
        )}
      </div>
    );
  }

  // Admin/Teacher view
  return (
    <div className="elim-page">
      <div className="elim-hero">
        <div className="elim-hero-content">
          <div className="elim-hero-icon">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h1>Gestion des Éliminations</h1>
            <p>Basé sur le taux d'absence (🔴 33.34%+ = Éliminé | 🟡 66.67%+ = À risque)</p>
          </div>
        </div>
        {isAdmin && (
          <div className="elim-admin-actions">
            <button
              className="elim-calculate-btn"
              onClick={handleCalculate}
              disabled={calculating}
            >
              {calculating ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Calcul...</span>
                </>
              ) : (
                <>
                  <Calculator size={18} />
                  <span>Calculer</span>
                </>
              )}
            </button>
            <button
              className="elim-publish-btn"
              onClick={handlePublish}
              disabled={publishing || unpublishedCount === 0}
            >
              {publishing ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Publication...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Publier ({unpublishedCount})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="elim-stats-grid">
        <div className="elim-stat-card">
          <div className="elim-stat-icon total">
            <Users size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{eliminations.length}</span>
            <span className="elim-stat-label">Total</span>
          </div>
        </div>
        <div className="elim-stat-card">
          <div className="elim-stat-icon eliminated">
            <XCircle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{eliminated.length}</span>
            <span className="elim-stat-label">Éliminés 🔴</span>
          </div>
        </div>
        <div className="elim-stat-card">
          <div className="elim-stat-icon at-risk">
            <AlertCircle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{atRisk.length}</span>
            <span className="elim-stat-label">À risque 🟡</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="elim-filters">
        <div className="elim-filter-group">
          <label>Filtrer par statut :</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous</option>
            <option value="eliminated">Éliminés 🔴</option>
            <option value="at_risk">À risque 🟡</option>
          </select>
        </div>
      </div>

      {/* Eliminations Table */}
      <div className="elim-table-wrapper">
        <div className="elim-table-header">
          <h3>Liste des éliminations</h3>
          <span className="elim-count">{filteredEliminations.length} élimination(s)</span>
        </div>
        <div className="elim-table-container">
          <table className="elim-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Étudiant</th>
                <th>Classe</th>
                <th>Taux d'absence</th>
                <th>Statut</th>
                <th>Publication</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEliminations.map((elim) => (
                <tr key={elim.id} className={`elim-row ${elim.status} ${!elim.published ? 'unpublished' : ''}`}>
                  <td className="exam-name">{elim.examName}</td>
                  <td>{elim.studentName}</td>
                  <td>{elim.className}</td>
                  <td>
                    <div className="absence-rate-cell">
                      <div className="absence-bar-bg">
                        <div
                          className="absence-bar-fill"
                          style={{
                            width: `${Math.min(elim.absenceRate, 100)}%`,
                            backgroundColor: getAbsenceColor(elim.absenceRate)
                          }}
                        />
                      </div>
                      <span className="absence-rate-value" style={{ color: getAbsenceColor(elim.absenceRate) }}>
                        {elim.absenceRate}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`elim-status ${getStatusClass(elim.status)}`}>
                      {getStatusIcon(elim.status)}
                      {getStatusLabel(elim.status)}
                    </span>
                  </td>
                  <td>
                    {elim.published ? (
                      <span className="published-badge">
                        <CheckCircle size={14} />
                        Publié
                      </span>
                    ) : (
                      <span className="unpublished-badge">
                        <Clock size={14} />
                        En attente
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="actions-cell">
                      <button
                        className={`elim-action-btn delete ${deleteConfirm === elim.id ? 'confirm' : ''}`}
                        onClick={() => handleDelete(elim.id)}
                        title={deleteConfirm === elim.id ? 'Cliquez pour confirmer' : 'Supprimer'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EliminationPage;

