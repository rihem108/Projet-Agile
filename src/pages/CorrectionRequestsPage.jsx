import React, { useState, useContext } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Send
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useCorrection } from '../context/CorrectionContext';
import toast from 'react-hot-toast';

const CorrectionRequestsPage = () => {
  const { user, grades, exams } = useContext(AppContext);
  const { 
    getMyRequests, 
    addCorrectionRequest, 
    deleteCorrectionRequest,
    getStatusColor, 
    getStatusLabel, 
    getTypeLabel 
  } = useCorrection();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    gradeId: '',
    type: '',
    reason: '',
    description: ''
  });

  const myRequests = getMyRequests();
  const myGrades = grades?.filter(g => String(g.studentId) === String(user?.id)) || [];

  const filteredRequests = myRequests.filter(request => {
    const matchesSearch = 
      (request.examId?.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async () => {
    if (!formData.gradeId || !formData.type || !formData.reason) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const success = await addCorrectionRequest(formData);
    if (success) {
      setShowModal(false);
      setFormData({ gradeId: '', type: '', reason: '', description: '' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      await deleteCorrectionRequest(id);
    }
  };

  const getGradeInfo = (gradeId) => {
    const grade = myGrades.find(g => String(g.id) === String(gradeId));
    const exam = exams?.find(e => String(e.id) === String(grade?.examId));
    return { grade, exam };
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

  // Student view
  if (user?.role === 'Student') {
    return (
      <div className="correction-page">
        {/* Header */}
        <div className="correction-header-section">
          <div className="correction-header-left">
            <div className="correction-icon-wrapper">
              <FileText size={28} />
            </div>
            <div>
              <h1>Mes Demandes de Correction</h1>
              <p>Suivez vos demandes de seconde correction et de vérification de notes</p>
            </div>
          </div>
          <button className="correction-add-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Nouvelle Demande
          </button>
        </div>

        {/* Stats */}
        <div className="correction-stats-grid">
          <div className="correction-stat-card">
            <div className="correction-stat-icon yellow">
              <Clock size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {myRequests.filter(r => r.status === 'pending').length}
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
                {myRequests.filter(r => r.status === 'admin_approved').length}
              </span>
              <span className="correction-stat-label">Approuvées</span>
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
          <div className="correction-stat-card">
            <div className="correction-stat-icon red">
              <XCircle size={20} />
            </div>
            <div className="correction-stat-info">
              <span className="correction-stat-value">
                {myRequests.filter(r => r.status === 'admin_rejected').length}
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
              placeholder="Rechercher par examen ou raison..." 
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
            <h3>Liste de mes demandes</h3>
            <span className="correction-count-badge">
              {filteredRequests.length} demande(s)
            </span>
          </div>
          
          <div className="correction-table-container">
            {filteredRequests.length > 0 ? (
              <table className="correction-table">
                <thead>
                  <tr>
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
                  {filteredRequests.map((request) => {
                    const { grade, exam } = getGradeInfo(request.gradeId);
                    return (
                      <tr key={request.id}>
                        <td className="exam-name">{exam?.subject || 'Inconnu'}</td>
                        <td>
                          <span className="type-badge">
                            {getTypeLabel(request.type)}
                          </span>
                        </td>
                        <td>
                          <span className="grade-badge" style={{ backgroundColor: '#6B7280', color: 'white' }}>
                            {grade?.grade || '-'}
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
                        <td>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="table-action-buttons">
                            <button className="table-action-btn view" title="Voir les détails">
                              <Eye size={16} />
                            </button>
                            {request.status === 'pending' && (
                              <button 
                                className="table-action-btn delete" 
                                onClick={() => handleDelete(request.id)}
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="correction-empty-state">
                <div className="correction-empty-icon">
                  <FileText size={48} />
                </div>
                <h4>Aucune demande trouvée</h4>
                <p>Cliquez sur "Nouvelle Demande" pour créer une demande de correction.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="correction-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="correction-modal" onClick={(e) => e.stopPropagation()}>
              <div className="correction-modal-header">
                <h3>Nouvelle Demande de Correction</h3>
                <button className="correction-modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <div className="correction-modal-body">
                <div className="correction-form-group">
                  <label className="correction-form-label">Examen *</label>
                  <select 
                    className="correction-form-select"
                    value={formData.gradeId}
                    onChange={(e) => setFormData({...formData, gradeId: e.target.value})}
                  >
                    <option value="">Sélectionner un examen</option>
                    {myGrades.map(grade => {
                      const exam = exams?.find(e => String(e.id) === String(grade.examId));
                      return (
                        <option key={grade.id} value={grade.id}>
                          {exam?.subject || 'Inconnu'} - Note: {grade.grade}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="correction-form-group">
                  <label className="correction-form-label">Type de demande *</label>
                  <select 
                    className="correction-form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="second_correction">Seconde correction</option>
                    <option value="note_check">Vérification de note</option>
                  </select>
                </div>
                <div className="correction-form-group">
                  <label className="correction-form-label">Raison *</label>
                  <textarea 
                    className="correction-form-textarea"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Expliquez pourquoi vous demandez cette correction..."
                    rows={3}
                  />
                </div>
                <div className="correction-form-group">
                  <label className="correction-form-label">Description détaillée</label>
                  <textarea 
                    className="correction-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Fournissez plus de détails si nécessaire..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="correction-modal-footer">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn-primary" onClick={handleSubmit}>
                  <Send size={16} />
                  Soumettre la demande
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
        <h4>Page en développement</h4>
        <p>Cette page sera disponible pour les enseignants et administrateurs prochainement.</p>
      </div>
    </div>
  );
};

export default CorrectionRequestsPage;
