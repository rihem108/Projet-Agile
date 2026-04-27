import React, { useState, useContext } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Trash2,
  Send,
  UserCheck,
  Calendar
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useCorrection } from '../context/CorrectionContext';
import toast from 'react-hot-toast';

const AdminCorrectionPage = () => {
  const { user } = useContext(AppContext);
  const { 
    correctionRequests,
    makeAdminDecision,
    deleteCorrectionRequest,
    getStatusColor, 
    getStatusLabel, 
    getTypeLabel 
  } = useCorrection();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionData, setDecisionData] = useState({
    decision: '',
    approved: true
  });

  const filteredRequests = correctionRequests.filter(request => {
    const matchesSearch = 
      (request.examId?.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleDecision = async () => {
    if (!decisionData.decision.trim()) {
      toast.error('Veuillez entrer une décision');
      return;
    }

    const success = await makeAdminDecision(selectedRequest.id, decisionData.decision, decisionData.approved);
    if (success) {
      setShowDecisionModal(false);
      setSelectedRequest(null);
      setDecisionData({ decision: '', approved: true });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      await deleteCorrectionRequest(id);
    }
  };

  const openDecisionModal = (request) => {
    setSelectedRequest(request);
    setDecisionData({ decision: '', approved: true });
    setShowDecisionModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'admin_approved': return <CheckCircle size={16} />;
      case 'admin_rejected': return <XCircle size={16} />;
      case 'teacher_reviewed': return <Eye size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  // Admin view
  if (user?.role === 'Admin') {
    return (
      <div className="correction-page">
        {/* Header */}
        <div className="correction-header-section">
          <div className="correction-header-left">
            <div className="correction-icon-wrapper">
              <FileText size={28} />
            </div>
            <div>
              <h1>Gestion des Demandes de Correction</h1>
              <p>Examinez et approuvez les demandes de correction des étudiants</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="correction-stats-grid">
          <div className="correction-stat-card">
            <div className="correction-stat-icon yellow">
              <Clock size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {correctionRequests.filter(r => r.status === 'pending').length}
              </span>
              <span className="correction-stat-label">En attente</span>
            </div>
          </div>
          <div className="correction-stat-card">
            <div className="correction-stat-icon blue">
              <CheckCircle size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {correctionRequests.filter(r => r.status === 'admin_approved').length}
              </span>
              <span className="correction-stat-label">Approuvées</span>
            </div>
          </div>
          <div className="correction-stat-card">
            <div className="correction-stat-icon purple">
              <Eye size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {correctionRequests.filter(r => r.status === 'teacher_reviewed').length}
              </span>
              <span className="correction-stat-label">Traitées</span>
            </div>
          </div>
          <div className="correction-stat-card">
            <div className="correction-stat-icon red">
              <XCircle size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {correctionRequests.filter(r => r.status === 'admin_rejected').length}
              </span>
              <span className="correction-stat-label">Rejetées</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="correction-filters">
          <div className="correction-search-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par étudiant, examen ou raison..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="correction-filter-wrapper">
            <Filter size={18} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="admin_approved">Approuvé par admin</option>
              <option value="admin_rejected">Rejeté par admin</option>
              <option value="teacher_reviewed">Traité par enseignant</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="correction-table-wrapper">
          <div className="correction-table-header">
            <h3>Toutes les demandes</h3>
            <span className="correction-count-badge">
              {filteredRequests.length} demande(s)
            </span>
          </div>
          
          <div className="correction-table-container">
            {filteredRequests.length > 0 ? (
              <table className="correction-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Examen</th>
                    <th>Type</th>
                    <th>Note actuelle</th>
                    <th>Nouvelle note</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="student-info">
                          <UserCheck size={14} />
                          {request.studentId?.name || 'Inconnu'}
                          <small className="student-class">
                            {request.studentId?.className || ''}
                          </small>
                        </div>
                      </td>
                      <td className="exam-name">{request.examId?.subject || 'Inconnu'}</td>
                      <td>
                        <span className="type-badge">
                          {getTypeLabel(request.type)}
                        </span>
                      </td>
                      <td>
                        <span className="grade-badge" style={{ backgroundColor: '#6B7280', color: 'white' }}>
                          {request.gradeId?.grade || '-'}
                        </span>
                      </td>
                      <td>
                        {request.newGrade ? (
                          <span className="grade-badge" style={{ backgroundColor: '#10B981', color: 'white' }}>
                            {request.newGrade}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span 
                          className="correction-status-badge" 
                          style={{ backgroundColor: getStatusColor(request.status), color: 'white' }}
                        >
                          {getStatusIcon(request.status)}
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td>
                        <div className="date-info">
                          <Calendar size={14} />
                          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td>
                        <div className="table-action-buttons">
                          {request.status === 'pending' && (
                            <button 
                              className="table-action-btn edit" 
                              onClick={() => openDecisionModal(request)}
                              title="Prendre une décision"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button className="table-action-btn view" title="Voir les détails">
                            <Eye size={16} />
                          </button>
                          <button 
                            className="table-action-btn delete" 
                            onClick={() => handleDelete(request.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="correction-empty-state">
                <div className="correction-empty-icon">
                  <FileText size={48} />
                </div>
                <h4>Aucune demande trouvée</h4>
                <p>Il n'y a aucune demande de correction pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Decision Modal */}
        {showDecisionModal && selectedRequest && (
          <div className="correction-modal-overlay" onClick={() => setShowDecisionModal(false)}>
            <div className="correction-modal" onClick={(e) => e.stopPropagation()}>
              <div className="correction-modal-header">
                <h3>Décision sur la demande</h3>
                <button className="correction-modal-close" onClick={() => setShowDecisionModal(false)}>
                  ×
                </button>
              </div>
              <div className="correction-modal-body">
                <div className="request-summary">
                  <h4>Détails de la demande</h4>
                  <div className="summary-grid">
                    <div>
                      <strong>Étudiant:</strong> {selectedRequest.studentId?.name}
                    </div>
                    <div>
                      <strong>Examen:</strong> {selectedRequest.examId?.subject}
                    </div>
                    <div>
                      <strong>Type:</strong> {getTypeLabel(selectedRequest.type)}
                    </div>
                    <div>
                      <strong>Note actuelle:</strong> {selectedRequest.gradeId?.grade}
                    </div>
                    <div>
                      <strong>Date:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="reason-section">
                    <strong>Raison:</strong>
                    <p>{selectedRequest.reason}</p>
                    {selectedRequest.description && (
                      <>
                        <strong>Description:</strong>
                        <p>{selectedRequest.description}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="decision-section">
                  <h4>Votre décision</h4>
                  <div className="decision-options">
                    <label className="decision-radio">
                      <input 
                        type="radio" 
                        name="decision" 
                        checked={decisionData.approved}
                        onChange={() => setDecisionData({...decisionData, approved: true})}
                      />
                      <span className="radio-label approved">Approuver la demande</span>
                    </label>
                    <label className="decision-radio">
                      <input 
                        type="radio" 
                        name="decision" 
                        checked={!decisionData.approved}
                        onChange={() => setDecisionData({...decisionData, approved: false})}
                      />
                      <span className="radio-label rejected">Rejeter la demande</span>
                    </label>
                  </div>
                  
                  <div className="correction-form-group">
                    <label className="correction-form-label">Motif de la décision *</label>
                    <textarea 
                      className="correction-form-textarea"
                      value={decisionData.decision}
                      onChange={(e) => setDecisionData({...decisionData, decision: e.target.value})}
                      placeholder={decisionData.approved ? 
                        "Expliquez pourquoi vous approuvez cette demande..." : 
                        "Expliquez pourquoi vous rejetez cette demande..."
                      }
                      rows={4}
                    />
                  </div>
                </div>
              </div>
              <div className="correction-modal-footer">
                <button className="btn-secondary" onClick={() => setShowDecisionModal(false)}>Annuler</button>
                <button 
                  className={`btn-primary ${!decisionData.approved ? 'btn-danger' : ''}`}
                  onClick={handleDecision}
                >
                  <Send size={16} />
                  {decisionData.approved ? 'Approuver' : 'Rejeter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Placeholder for other roles
  return (
    <div className="correction-page">
      <div className="correction-empty-state">
        <h4>Accès refusé</h4>
        <p>Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
    </div>
  );
};

export default AdminCorrectionPage;
