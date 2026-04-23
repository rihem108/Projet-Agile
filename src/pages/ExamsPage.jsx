// src/pages/ExamsPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  FileText,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  GraduationCap
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ExamsPage = () => {
  const { exams, addExam, updateExam, deleteExam, user, assignments } = useContext(AppContext);
  const [localExams, setLocalExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    code: '',
    date: '',
    time: '',
    duration: '',
    room: '',
    supervisor: '',
    coefficient: '',
    maxScore: '100',
    type: 'normal',
    status: 'scheduled',
    description: ''
  });

  const canEdit = user?.role === 'Admin' || user?.role === 'Teacher';
  const visibleExams = user?.role === 'Teacher'
    ? localExams.filter(exam => 
        String(exam.createdBy || '') === String(user.id) || assignments.some(a => a.examId === exam.id && a.supervisorId === user.id)
      )
    : localExams;
  const emptyColSpan = 4 + (user?.role === 'Teacher' ? 1 : 0) + (canEdit ? 1 : 0);

  useEffect(() => {
    if (exams && exams.length > 0) {
      setLocalExams(exams);
    }
  }, [exams]);

  const filteredExams = visibleExams.filter(exam => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesType = filterType === 'all' || exam.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: visibleExams.length,
    scheduled: visibleExams.filter(e => e.status === 'scheduled').length,
    ongoing: visibleExams.filter(e => e.status === 'ongoing').length,
    completed: visibleExams.filter(e => e.status === 'completed').length,
    totalStudents: visibleExams.reduce((acc, e) => acc + (e.registeredStudents || 0), 0),
  };

  const handleAdd = () => {
    setEditingExam(null);
    setFormData({
      subject: '',
      code: '',
      date: '',
      time: '',
      duration: '',
      room: '',
      supervisor: '',
      coefficient: '',
      maxScore: '100',
      type: 'normal',
      status: 'scheduled',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      subject: exam.subject,
      code: exam.code,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      room: exam.room,
      supervisor: exam.supervisor,
      coefficient: exam.coefficient,
      maxScore: exam.maxScore || '100',
      type: exam.type || 'normal',
      status: exam.status,
      description: exam.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      setLocalExams(localExams.filter(e => e.id !== id));
      toast.success('Examen supprimé avec succès');
    }
  };

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setShowDetails(true);
  };

  const handleSubmit = () => {
    if (!formData.subject || !formData.code || !formData.date || !formData.duration) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingExam) {
      setLocalExams(localExams.map(e => 
        e.id === editingExam.id 
          ? { ...e, ...formData }
          : e
      ));
      toast.success('Examen modifié avec succès');
    } else {
      const newExam = {
        id: Date.now(),
        ...formData,
        registeredStudents: 0,
        completedStudents: 0,
        avgScore: null
      };
      setLocalExams([...localExams, newExam]);
      toast.success('Examen ajouté avec succès');
    }
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      scheduled: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', icon: ClockIcon, label: 'Planifié' },
      ongoing: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', icon: AlertCircle, label: 'En cours' },
      completed: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', icon: CheckCircle, label: 'Terminé' }
    };
    const s = statuses[status] || statuses.scheduled;
    const Icon = s.icon;
    return (
      <span className="exam-status-badge" style={{ background: s.bg, color: s.color }}>
        <Icon size={12} />
        {s.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === 'normal') {
      return <span className="exam-type-badge normal">📝 Normal</span>;
    }
    return <span className="exam-type-badge practical">💻 Pratique</span>;
  };

  return (
    <div className="exams-page">
      {/* Hero Section */}
      <div className="exams-hero">
        <div className="exams-hero-content">
          <div className="exams-hero-icon">
            <BookOpen size={28} />
          </div>
          <div>
            <h1>Gestion des Examens</h1>
            <p>Planifiez, organisez et suivez tous vos examens</p>
          </div>
        </div>
        <button className="exams-add-btn" onClick={handleAdd}>
          <Plus size={18} />
          Nouvel examen
        </button>
      </div>

      {/* Stats Cards */}
      <div className="exams-stats-grid">
        <div className="exams-stat-card">
          <div className="exams-stat-icon total">
            <BookOpen size={20} />
          </div>
          <div className="exams-stat-info">
            <span className="exams-stat-value">{stats.total}</span>
            <span className="exams-stat-label">Total examens</span>
          </div>
        </div>
        <div className="exams-stat-card">
          <div className="exams-stat-icon scheduled">
            <Calendar size={20} />
          </div>
          <div className="exams-stat-info">
            <span className="exams-stat-value">{stats.scheduled}</span>
            <span className="exams-stat-label">Planifiés</span>
          </div>
        </div>
        <div className="exams-stat-card">
          <div className="exams-stat-icon completed">
            <CheckCircle size={20} />
          </div>
          <div className="exams-stat-info">
            <span className="exams-stat-value">{stats.completed}</span>
            <span className="exams-stat-label">Terminés</span>
          </div>
        </div>
        <div className="exams-stat-card">
          <div className="exams-stat-icon students">
            <Users size={20} />
          </div>
          <div className="exams-stat-info">
            <span className="exams-stat-value">{stats.totalStudents}</span>
            <span className="exams-stat-label">Étudiants inscrits</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="exams-filters">
        <div className="exams-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par matière ou code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="exams-filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifiés</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminés</option>
          </select>
        </div>
        <div className="exams-filter-group">
          <Filter size={18} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tous les types</option>
            <option value="normal">Normal</option>
            <option value="practical">Pratique</option>
          </select>
        </div>
      </div>

      {/* Exams Table */}
      <div className="exams-table-wrapper">
        <div className="exams-table-header">
          <h3>Liste des examens</h3>
          <span className="exams-count">{filteredExams.length} examen(s)</span>
        </div>
        
        <div className="exams-table-container">
          {filteredExams.length > 0 ? (
            <table className="exams-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Date & Horaire</th>
                  <th>Durée</th>
                  <th>Salle</th>
                  <th>Surveillant</th>
                  <th>Coeff</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th className="exams-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="exams-table-row">
                    <td className="exam-cell">
                      <div className="exam-info">
                        <div className="exam-subject">{exam.subject}</div>
                        <div className="exam-code">{exam.code}</div>
                      </div>
                    </td>
                    <td className="date-cell">
                      <div className="exam-date">
                        <Calendar size={14} />
                        <span>{new Date(exam.date).toLocaleDateString('fr-FR')}</span>
                        <Clock size={14} />
                        <span>{exam.time}</span>
                      </div>
                    </td>
                    <td className="duration-cell">
                      <div className="exam-duration">
                        <ClockIcon size={14} />
                        <span>{exam.duration}</span>
                      </div>
                    </td>
                    <td className="room-cell">
                      <div className="exam-room">
                        <MapPin size={14} />
                        <span>{exam.room}</span>
                      </div>
                    </td>
                    <td className="supervisor-cell">
                      <div className="exam-supervisor">
                        <GraduationCap size={14} />
                        <span>{exam.supervisor}</span>
                      </div>
                    </td>
                    <td className="coefficient-cell">
                      <span className="exam-coefficient">{exam.coefficient}</span>
                    </td>
                    <td>{getTypeBadge(exam.type)}</td>
                    <td>{getStatusBadge(exam.status)}</td>
                    <td className="exams-actions-cell">
                      <div className="exams-actions">
                        <button className="exams-action-btn view" onClick={() => handleViewDetails(exam)} title="Voir détails">
                          <Eye size={16} />
                        </button>
                        <button className="exams-action-btn edit" onClick={() => handleEdit(exam)} title="Modifier">
                          <Edit size={16} />
                        </button>
                        <button className="exams-action-btn delete" onClick={() => handleDelete(exam.id)} title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="exams-empty-state">
              <div className="exams-empty-icon">
                <BookOpen size={48} />
              </div>
              <h4>Aucun examen trouvé</h4>
              <p>Cliquez sur "Nouvel examen" pour en ajouter un.</p>
            </div>
          )}
        </div>
      </div>

      {/* Exam Details Modal */}
      {showDetails && selectedExam && (
        <div className="exams-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="exams-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exams-modal-header">
              <h3>Détails de l'examen</h3>
              <button className="exams-modal-close" onClick={() => setShowDetails(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="exams-modal-body">
              <div className="exam-detail-header">
                <div className="exam-detail-title">
                  <BookOpen size={24} />
                  <div>
                    <h4>{selectedExam.subject}</h4>
                    <span>{selectedExam.code}</span>
                  </div>
                </div>
                {getStatusBadge(selectedExam.status)}
              </div>
              
              <div className="exam-detail-grid">
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <label>Date</label>
                    <p>{new Date(selectedExam.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <div>
                    <label>Horaire</label>
                    <p>{selectedExam.time}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <ClockIcon size={16} />
                  <div>
                    <label>Durée</label>
                    <p>{selectedExam.duration}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <MapPin size={16} />
                  <div>
                    <label>Salle</label>
                    <p>{selectedExam.room}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <GraduationCap size={16} />
                  <div>
                    <label>Surveillant</label>
                    <p>{selectedExam.supervisor}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Award size={16} />
                  <div>
                    <label>Coefficient</label>
                    <p>{selectedExam.coefficient}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <div>
                    <label>Étudiants inscrits</label>
                    <p>{selectedExam.registeredStudents || 0}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <FileText size={16} />
                  <div>
                    <label>Note maximale</label>
                    <p>{selectedExam.maxScore || 100}/100</p>
                  </div>
                </div>
              </div>
              
              {selectedExam.description && (
                <div className="exam-description">
                  <label>Description</label>
                  <p>{selectedExam.description}</p>
                </div>
              )}
            </div>
            <div className="exams-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetails(false)}>Fermer</button>
              <button className="btn-primary" onClick={() => {
                setShowDetails(false);
                handleEdit(selectedExam);
              }}>Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="exams-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="exams-modal exams-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="exams-modal-header">
              <h3>{editingExam ? 'Modifier l\'examen' : 'Ajouter un examen'}</h3>
              <button className="exams-modal-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="exams-modal-body">
              <div className="exams-form-row">
                <div className="exams-form-group">
                  <label>Matière *</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="Nom de la matière" />
                </div>
                <div className="exams-form-group">
                  <label>Code *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="Code de l'examen" />
                </div>
              </div>
              <div className="exams-form-row">
                <div className="exams-form-group">
                  <label>Date *</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="exams-form-group">
                  <label>Horaire *</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
                </div>
                <div className="exams-form-group">
                  <label>Durée *</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="2h, 1h30..." />
                </div>
              </div>
              <div className="exams-form-row">
                <div className="exams-form-group">
                  <label>Salle</label>
                  <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} placeholder="Salle d'examen" />
                </div>
                <div className="exams-form-group">
                  <label>Surveillant</label>
                  <input type="text" value={formData.supervisor} onChange={(e) => setFormData({...formData, supervisor: e.target.value})} placeholder="Nom du surveillant" />
                </div>
              </div>
              <div className="exams-form-row">
                <div className="exams-form-group">
                  <label>Coefficient</label>
                  <input type="number" value={formData.coefficient} onChange={(e) => setFormData({...formData, coefficient: e.target.value})} placeholder="Coefficient" />
                </div>
                <div className="exams-form-group">
                  <label>Note maximale</label>
                  <input type="number" value={formData.maxScore} onChange={(e) => setFormData({...formData, maxScore: e.target.value})} placeholder="100" />
                </div>
                <div className="exams-form-group">
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="normal">Normal</option>
                    <option value="practical">Pratique</option>
                  </select>
                </div>
              </div>
              <div className="exams-form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" placeholder="Description de l'examen..." />
              </div>
            </div>
            <div className="exams-modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingExam ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;