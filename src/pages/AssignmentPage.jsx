// src/pages/AssignmentPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { 
  CalendarCog, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  UserCheck,
  BookOpen,
  X
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const AssignmentPage = () => {
  const { exams, rooms, users, assignments, addAssignment, updateAssignment, deleteAssignment } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    examId: '',
    roomId: '',
    supervisorId: '',
    date: '',
    time: ''
  });

  // Get teachers
  const teachers = users?.filter(u => u.role === 'Teacher') || [];
  
  // Use backend assignments data
  const localAssignments = assignments || [];

  const getExamSubject = (id) => exams?.find(e => e.id === id)?.subject || 'Inconnu';
  const getExamDuration = (id) => exams?.find(e => e.id === id)?.duration || '2h';
  const getRoomName = (id) => rooms?.find(r => r.id === id)?.name || 'Non assignée';
  const getRoomCapacity = (id) => rooms?.find(r => r.id === id)?.capacity || '-';
  const getSupervisorName = (id) => users?.find(u => u.id === id)?.name || 'Non assigné';

  const filteredAssignments = localAssignments.filter(assignment => {
    const examName = getExamSubject(assignment.examId).toLowerCase();
    const supervisor = getSupervisorName(assignment.supervisorId).toLowerCase();
    const room = getRoomName(assignment.roomId).toLowerCase();
    const matchesSearch = examName.includes(searchTerm.toLowerCase()) ||
                          supervisor.includes(searchTerm.toLowerCase()) ||
                          room.includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAdd = () => {
    setEditingAssignment(null);
    setFormData({ examId: '', roomId: '', supervisorId: '', date: '', time: '' });
    setShowModal(true);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      examId: assignment.examId,
      roomId: assignment.roomId,
      supervisorId: assignment.supervisorId,
      date: assignment.date || '',
      time: assignment.time || ''
    });
    setShowModal(true);
  };

  // Auto-populate date and time when exam is selected
  const handleExamChange = (examId) => {
    const selectedExam = exams?.find(e => e.id === parseInt(examId));
    if (selectedExam) {
      setFormData(prev => ({
        ...prev,
        date: prev.date || selectedExam.date || '',
        time: prev.time || selectedExam.time || ''
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      const deleted = await deleteAssignment(id);
      if (!deleted) {
        toast('Suppression locale uniquement (serveur indisponible).', { icon: '⚠️' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.examId || !formData.roomId || !formData.supervisorId) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const assignmentPayload = {
      examId: parseInt(formData.examId),
      roomId: parseInt(formData.roomId),
      supervisorId: parseInt(formData.supervisorId),
      date: formData.date,
      time: formData.time,
      status: 'scheduled'
    };

    if (editingAssignment) {
      const updated = await updateAssignment(editingAssignment.id, assignmentPayload);
      if (!updated) {
        toast('Modification locale uniquement (serveur indisponible).', { icon: '⚠️' });
      }
    } else {
      const added = await addAssignment(assignmentPayload);
      if (!added) {
        toast('Ajout local uniquement (serveur indisponible).', { icon: '⚠️' });
      }
    }
    setShowModal(false);
  };

  const handleExport = () => {
    toast.success('Export PDF en cours...');
  };

  // Stats
  const totalAssignments = localAssignments.length;
  const scheduledCount = localAssignments.filter(a => a.status === 'scheduled').length;
  const completedCount = localAssignments.filter(a => a.status === 'completed').length;
  const uniqueRooms = [...new Set(localAssignments.map(a => a.roomId))].length;

  return (
    <div className="assignment-container">
      {/* Header Section */}
      <div className="assignment-header-section">
        <div className="assignment-header-left">
          <div className="assignment-icon-wrapper">
            <CalendarCog size={28} />
          </div>
          <div>
            <h1>Gestion des Affectations</h1>
            <p>Planifiez et gérez l'affectation des salles et surveillants</p>
          </div>
        </div>
        <div className="assignment-actions">
          <button className="assignment-export-btn" onClick={handleExport}>
            <Download size={16} />
            Exporter
          </button>
          <button className="assignment-add-btn" onClick={handleAdd}>
            <Plus size={16} />
            Nouvelle Affectation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="assignment-stats-grid">
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon purple">
            <CalendarCog size={20} />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-value">{totalAssignments}</span>
            <span className="assignment-stat-label">Total Affectations</span>
          </div>
        </div>
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon blue">
            <Clock size={20} />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-value">{scheduledCount}</span>
            <span className="assignment-stat-label">Planifiées</span>
          </div>
        </div>
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon green">
            <CheckCircle size={20} />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-value">{completedCount}</span>
            <span className="assignment-stat-label">Terminées</span>
          </div>
        </div>
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon orange">
            <MapPin size={20} />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-value">{uniqueRooms}</span>
            <span className="assignment-stat-label">Salles Utilisées</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="assignment-filters">
        <div className="assignment-search-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par examen, salle ou surveillant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="assignment-filter-wrapper">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifiés</option>
            <option value="completed">Terminés</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="assignment-table-wrapper">
        <div className="assignment-table-header">
          <h3>Liste des Affectations</h3>
          <span className="assignment-count-badge">
            {filteredAssignments.length} affectation(s)
          </span>
        </div>
        
        <div className="assignment-table-container">
          {filteredAssignments.length > 0 ? (
            <table className="assignment-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Durée</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Salle</th>
                  <th>Capacité</th>
                  <th>Surveillant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="exam-cell">{getExamSubject(assignment.examId)}</td>
                    <td>{getExamDuration(assignment.examId)}</td>
                    <td>{assignment.date || 'Non définie'}</td>
                    <td>{assignment.time || 'Non défini'}</td>
                    <td>
                      <span className="room-badge">
                        <MapPin size={12} />
                        {getRoomName(assignment.roomId)}
                      </span>
                    </td>
                    <td>{getRoomCapacity(assignment.roomId)}</td>
                    <td>
                      <span className="supervisor-badge">
                        <UserCheck size={12} />
                        {getSupervisorName(assignment.supervisorId)}
                      </span>
                    </td>
                    <td>
                      <span className={`assignment-status-badge ${assignment.status}`}>
                        {assignment.status === 'scheduled' ? 'Planifié' : 'Terminé'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-buttons">
                        <button 
                          className="table-action-btn edit" 
                          onClick={() => handleEdit(assignment)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="table-action-btn delete" 
                          onClick={() => handleDelete(assignment.id)}
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
            <div className="assignment-empty-state">
              <div className="assignment-empty-icon">
                <CalendarCog size={48} />
              </div>
              <h4>Aucune affectation trouvée</h4>
              <p>Cliquez sur "Nouvelle Affectation" pour créer une affectation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="assignment-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assignment-modal-header">
              <h3>{editingAssignment ? 'Modifier l\'affectation' : 'Nouvelle affectation'}</h3>
              <button className="assignment-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="assignment-modal-body">
              <div className="assignment-form-group">
                <label className="assignment-form-label">Examen</label>
                <select 
                  className="assignment-form-select"
                  value={formData.examId}
                  onChange={(e) => {
                    setFormData({...formData, examId: parseInt(e.target.value)});
                    handleExamChange(parseInt(e.target.value));
                  }}
                >
                  <option value="">Sélectionner un examen</option>
                  {exams?.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.subject}</option>
                  ))}
                </select>
              </div>
              <div className="assignment-form-group">
                <label className="assignment-form-label">Salle</label>
                <select 
                  className="assignment-form-select"
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: parseInt(e.target.value)})}
                >
                  <option value="">Sélectionner une salle</option>
                  {rooms?.map(room => (
                    <option key={room.id} value={room.id}>{room.name} (Capacité: {room.capacity})</option>
                  ))}
                </select>
              </div>
              <div className="assignment-form-group">
                <label className="assignment-form-label">Surveillant</label>
                <select 
                  className="assignment-form-select"
                  value={formData.supervisorId}
                  onChange={(e) => setFormData({...formData, supervisorId: parseInt(e.target.value)})}
                >
                  <option value="">Sélectionner un surveillant</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div className="assignment-form-group">
                <label className="assignment-form-label">Date</label>
                <input 
                  type="date"
                  className="assignment-form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="assignment-form-group">
                <label className="assignment-form-label">Horaire</label>
                <input 
                  type="time"
                  className="assignment-form-input"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
            <div className="assignment-modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingAssignment ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;