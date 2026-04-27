import React, { useState, useContext } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  Eye,
  Send,
  UserCheck,
  Calendar,
  Edit
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useCorrection } from '../context/CorrectionContext';
import toast from 'react-hot-toast';

const TeacherCorrectionPage = () => {
  const { user } = useContext(AppContext);
  const { 
    correctionRequests,
    makeTeacherDecision,
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
    newGrade: ''
  });

  const myRequests = correctionRequests.filter(req => 
    String(req.teacherId) === String(user?.id) && 
    ['admin_approved', 'teacher_reviewed', 'completed'].includes(req.status)
  );

  const filteredRequests = myRequests.filter(request => {
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

    const newGradeValue = decisionData.newGrade ? parseFloat(decisionData.newGrade) : undefined;
    const success = await makeTeacherDecision(selectedRequest.id, decisionData.decision, newGradeValue);
    if (success) {
      setShowDecisionModal(false);
      setSelectedRequest(null);
      setDecisionData({ decision: '', newGrade: '' });
    }
  };

  const openDecisionModal = (request) => {
    setSelectedRequest(request);
    setDecisionData({ decision: '', newGrade: '' });
    setShowDecisionModal(true);
  };

  // Teacher view
  if (user?.role === 'Teacher') {
    return (
      <div className="correction-page">
        {/* Header */}
        <div className="correction-header-section">
          <div className="correction-header-left">
            <div className="correction-icon-wrapper">
              <FileText size={28} />
            </div>
            <div>
              <h1>Demandes de Correction Assignées</h1>
              <p>Examinez et traitez les demandes approuvées par l'administration</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="correction-stats-grid">
          <div className="correction-stat-card">
            <div className="correction-stat-icon blue">
              <CheckCircle size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {myRequests.filter(r => r.status === 'admin_approved').length}
              </span>
              <span className="correction-stat-label">À traiter</span>
            </div>
          </div>
          <div className="correction-stat-card">
            <div className="correction-stat-icon purple">
              <Eye size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {myRequests.filter(r => r.status === 'teacher_reviewed').length}
              </span>
              <span className="correction-stat-label">Traitées</span>
            </div>
          </div>
          <div className="correction-stat-card">
            <div className="correction-stat-icon green">
              <CheckCircle size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {myRequests.filter(r => r.status === 'completed').length}
              </span>
              <span className="correction-stat-label">Terminées</span>
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
              <option value="admin_approved">Approuvé par admin</option>
              <option value="teacher_reviewed">Traité par enseignant</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="correction-table-wrapper">
          <div className="correction-table-header">
            <h3>Mes demandes assignées</h3>
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
                    <th>Note proposée</th>
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
                          {request.status === 'admin_approved' && (
                            <button 
                              className="table-action-btn edit" 
                              onClick={() => openDecisionModal(request)}
                              title="Traiter la demande"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          <button className="table-action-btn view" title="Voir les détails">
                            <Eye size={16} />
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
                <h4>Aucune demande assignée</h4>
                <p>Il n'y a aucune demande de correction à traiter pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Decision Modal */}
        {showDecisionModal && selectedRequest && (
          <div className="correction-modal-overlay" onClick={() => setShowDecisionModal(false)}>
            <div className="correction-modal" onClick={(e) => e.stopPropagation()}>
              <div className="correction-modal-header">
                <h3>Traitement de la demande</h3>
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
                      <strong>Date de demande:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <strong>Décision admin:</strong> {selectedRequest.adminDecision}
                    </div>
                  </div>
                  <div className="reason-section">
                    <strong>Raison de l'étudiant:</strong>
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
                  <h4>Votre traitement</h4>
                  
                  {selectedRequest.type === 'second_correction' && (
                    <div className="correction-form-group">
                      <label className="correction-form-label">
                        Nouvelle note (0-20) {selectedRequest.type === 'second_correction' && '*'}
                      </label>
                      <input 
                        type="number"
                        className="correction-form-input"
                        value={decisionData.newGrade}
                        onChange={(e) => setDecisionData({...decisionData, newGrade: e.target.value})}
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder={selectedRequest.type === 'second_correction' ? 
                          "Entrez la nouvelle note..." : 
                          "Optionnel: nouvelle note si correction nécessaire"
                        }
                      />
                      {selectedRequest.type === 'second_correction' && (
                        <small className="form-hint">
                          Obligatoire pour les demandes de seconde correction
                        </small>
                      )}
                    </div>
                  )}
                  
                  <div className="correction-form-group">
                    <label className="correction-form-label">Votre décision *</label>
                    <textarea 
                      className="correction-form-textarea"
                      value={decisionData.decision}
                      onChange={(e) => setDecisionData({...decisionData, decision: e.target.value})}
                      placeholder="Décrivez votre décision et les actions effectuées..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
              <div className="correction-modal-footer">
                <button className="btn-secondary" onClick={() => setShowDecisionModal(false)}>Annuler</button>
                <button className="btn-primary" onClick={handleDecision}>
                  <Send size={16} />
                  Valider le traitement
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
        <p>Seuls les enseignants peuvent accéder à cette page.</p>
      </div>
    </div>
  );
};

export default TeacherCorrectionPage;
