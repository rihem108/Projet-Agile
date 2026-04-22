// src/pages/EliminationPage.jsx
import React, { useState, useContext } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  X,
  User,
  BookOpen,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useElimination } from '../context/EliminationContext';
import toast from 'react-hot-toast';

const EliminationPage = () => {
  const { user, users, exams, grades } = useContext(AppContext);
  const { 
    eliminations, 
    addElimination, 
    deleteElimination,
    updateElimination,
    getDisqualifiedStudents,
    getAtRiskStudents,
    getAllEliminations
  } = useElimination();
  
  const [showModal, setShowModal] = useState(false);
  const [editingElimination, setEditingElimination] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    examId: '',
    studentId: '',
    grade: '',
    teacherNote: ''
  });

  const role = user?.role || 'Student';
  const isAdmin = role === 'Admin';
  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Student';

  // Get students list
  const students = users?.filter(u => u.role === 'Student') || [];
  
  // Get teacher's exams
  const teacherExams = isTeacher ? exams?.filter(e => e.supervisor === user?.name) : exams;

  const disqualified = getDisqualifiedStudents();
  const atRisk = getAtRiskStudents();
  const allEliminations = getAllEliminations();

  const filteredEliminations = allEliminations.filter(elim => {
    if (filterStatus === 'all') return true;
    return elim.status === filterStatus;
  });

  const getStatusIcon = (status) => {
    if (status === 'disqualified') {
      return <XCircle size={16} />;
    }
    return <AlertCircle size={16} />;
  };

  const getStatusClass = (status) => {
    if (status === 'disqualified') {
      return 'status-disqualified';
    }
    return 'status-at-risk';
  };

  const getStatusLabel = (status) => {
    if (status === 'disqualified') {
      return 'Éliminé';
    }
    return 'À risque';
  };

  const getGradeColor = (grade) => {
    if (grade <= 33.33) return '#EF4444';
    if (grade <= 66.66) return '#F59E0B';
    return '#10B981';
  };

  const handleAdd = () => {
    setEditingElimination(null);
    setFormData({
      examId: '',
      studentId: '',
      grade: '',
      teacherNote: ''
    });
    setShowModal(true);
  };

  const handleEdit = (elimination) => {
    setEditingElimination(elimination);
    setFormData({
      examId: elimination.examId,
      studentId: elimination.studentId,
      grade: elimination.grade,
      teacherNote: elimination.teacherNote || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.examId || !formData.studentId || !formData.grade) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const grade = parseFloat(formData.grade);
    const exam = exams?.find(e => e.id === parseInt(formData.examId));
    const student = students?.find(s => s.id === parseInt(formData.studentId));

    if (editingElimination) {
      await updateElimination(editingElimination.id, {
        ...formData,
        grade: grade,
        status: grade <= 33.33 ? 'disqualified' : 'at_risk',
        reason: grade <= 33.33 
          ? 'Note inférieure au seuil d\'élimination (0-33.33%)' 
          : 'Note dans la zone à risque (33.34-66.66%)',
        message: grade <= 33.33 
          ? `Note: ${grade}% - Élimination définitive de l'examen`
          : `Note: ${grade}% - Risque d'élimination. Une session de rattrapage est recommandée.`
      });
    } else {
      await addElimination({
        examId: parseInt(formData.examId),
        examName: exam?.subject || '',
        studentId: parseInt(formData.studentId),
        studentName: student?.name || '',
        grade: grade,
        status: grade <= 33.33 ? 'disqualified' : 'at_risk',
        reason: grade <= 33.33 
          ? 'Note inférieure au seuil d\'élimination (0-33.33%)' 
          : 'Note dans la zone à risque (33.34-66.66%)',
        message: grade <= 33.33 
          ? `Note: ${grade}% - Élimination définitive de l'examen`
          : `Note: ${grade}% - Risque d'élimination. Une session de rattrapage est recommandée.`,
        teacherNote: formData.teacherNote,
        publishedBy: user?.name || user?.role
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette élimination ?')) {
      await deleteElimination(id);
    }
  };

  // Student view
  if (isStudent) {
    const myEliminations = allEliminations.filter(e => e.studentId === user?.id);
    
    return (
      <div className="elim-page">
        <div className="elim-hero">
          <div className="elim-hero-content">
            <div className="elim-hero-icon">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1>Mes Éliminations</h1>
              <p>Consultez votre statut par examen</p>
            </div>
          </div>
        </div>

        {/* Stats Cards for Student */}
        <div className="elim-stats-grid">
          <div className="elim-stat-card">
            <div className="elim-stat-icon disqualified">
              <XCircle size={20} />
            </div>
            <div className="elim-stat-info">
              <span className="elim-stat-value">{myEliminations.filter(e => e.status === 'disqualified').length}</span>
              <span className="elim-stat-label">Éliminé 🔴</span>
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
              <h3>Résultats par examen</h3>
              <span className="elim-count">{myEliminations.length} résultat(s)</span>
            </div>
            <div className="elim-table-container">
              <table className="elim-table">
                <thead>
                  <tr>
                    <th>Examen</th>
                    <th>Note</th>
                    <th>Statut</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myEliminations.map((elim) => (
                    <tr key={elim.id} className={`elim-row ${elim.status}`}>
                      <td className="exam-name">{elim.examName}</td>
                      <td>
                        <span className="grade-badge" style={{ backgroundColor: getGradeColor(elim.grade), color: 'white' }}>
                          {elim.grade}%
                        </span>
                      </td>
                      <td>
                        <span className={`elim-status ${getStatusClass(elim.status)}`}>
                          {getStatusIcon(elim.status)}
                          {getStatusLabel(elim.status)}
                        </span>
                      </td>
                      <td className="message-cell">{elim.message}</td>
                      <td>{elim.date}</td>
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
            <p>Vous n'avez été éliminé d'aucun examen pour le moment.</p>
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
            <p>Gérez les éliminations selon les notes (🔴 0-33.33% | 🟡 33.34-66.66%)</p>
          </div>
        </div>
        {(isAdmin || isTeacher) && (
          <button className="elim-add-btn" onClick={handleAdd}>
            <Plus size={18} />
            Nouvelle élimination
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="elim-stats-grid">
        <div className="elim-stat-card">
          <div className="elim-stat-icon total">
            <AlertTriangle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{allEliminations.length}</span>
            <span className="elim-stat-label">Total</span>
          </div>
        </div>
        <div className="elim-stat-card">
          <div className="elim-stat-icon disqualified">
            <XCircle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{disqualified.length}</span>
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
            <option value="disqualified">Éliminés 🔴</option>
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
                <th>Examen</th>
                <th>Étudiant</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Motif</th>
                <th>Date</th>
                <th>Publié par</th>
                {(isAdmin || isTeacher) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEliminations.map((elim) => (
                <tr key={elim.id} className={`elim-row ${elim.status}`}>
                  <td className="exam-name">{elim.examName}</td>
                  <td>{elim.studentName}</td>
                  <td>
                    <span className="grade-badge" style={{ backgroundColor: getGradeColor(elim.grade), color: 'white' }}>
                      {elim.grade}%
                    </span>
                  </td>
                  <td>
                    <span className={`elim-status ${getStatusClass(elim.status)}`}>
                      {getStatusIcon(elim.status)}
                      {getStatusLabel(elim.status)}
                    </span>
                  </td>
                  <td className="reason-cell">{elim.reason}</td>
                  <td>{elim.date}</td>
                  <td>{elim.publishedBy}</td>
                  {(isAdmin || isTeacher) && (
                    <td className="actions-cell">
                      <div className="elim-actions">
                        <button className="elim-action-btn edit" onClick={() => handleEdit(elim)}>
                          <Edit size={16} />
                        </button>
                        <button className="elim-action-btn delete" onClick={() => handleDelete(elim.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="elim-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="elim-modal" onClick={(e) => e.stopPropagation()}>
            <div className="elim-modal-header">
              <h3>{editingElimination ? 'Modifier l\'élimination' : 'Nouvelle élimination'}</h3>
              <button className="elim-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="elim-modal-body">
              <div className="elim-form-group">
                <label>Examen *</label>
                <select 
                  value={formData.examId}
                  onChange={(e) => setFormData({...formData, examId: e.target.value})}
                >
                  <option value="">Sélectionner un examen</option>
                  {(isAdmin ? exams : teacherExams)?.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.subject}</option>
                  ))}
                </select>
              </div>
              <div className="elim-form-group">
                <label>Étudiant *</label>
                <select 
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div className="elim-form-group">
                <label>Note (%) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  placeholder="Entrez la note de l'étudiant"
                />
                <small className="form-hint">
                  🔴 0-33.33% = Élimination | 🟡 33.34-66.66% = Risque d'élimination
                </small>
              </div>
              <div className="elim-form-group">
                <label>Note de l'enseignant</label>
                <textarea 
                  value={formData.teacherNote}
                  onChange={(e) => setFormData({...formData, teacherNote: e.target.value})}
                  rows="3"
                  placeholder="Commentaire supplémentaire..."
                />
              </div>
            </div>
            <div className="elim-modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingElimination ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EliminationPage;