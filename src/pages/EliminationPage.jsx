import React, { useState, useContext, useMemo, useEffect } from 'react';
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
  AlertCircle,
  ShieldCheck,
  SendHorizontal
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useElimination } from '../context/EliminationContext';
import toast from 'react-hot-toast';
import './EliminationPage.css';

const EliminationPage = () => {
  const { user, users, exams, grades, assignments } = useContext(AppContext);
  const { 
    eliminations, 
    addElimination, 
    deleteElimination,
    updateElimination,
    publishElimination,
    getDisqualifiedStudents,
    getAtRiskStudents,
    getAllEliminations
  } = useElimination();
  
  const [showModal, setShowModal] = useState(false);
  const [editingElimination, setEditingElimination] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    examId: '',
    studentId: '',
    presenceRate: '',
    teacherNote: ''
  });

  const role = user?.role || 'Student';
  const isAdmin = role === 'Admin';
  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Student';

  // Get students list
  const students = users?.filter(u => u.role === 'Student') || [];
  
  // Get teacher's assigned exam IDs from assignments
  const teacherAssignedExamIds = useMemo(() => {
    if (!isTeacher || !assignments) return new Set();
    return new Set(
      assignments
        .filter(a => String(a.supervisorId) === String(user?.id))
        .map(a => String(a.examId))
    );
  }, [assignments, isTeacher, user]);

  // Get teacher's exams (assigned + created)
  const teacherExams = useMemo(() => {
    if (!isTeacher || !exams) return [];
    return exams.filter(e => 
      teacherAssignedExamIds.has(String(e.id)) || 
      String(e.createdBy) === String(user?.id)
    );
  }, [exams, isTeacher, teacherAssignedExamIds, user]);

  const disqualified = getDisqualifiedStudents();
  const atRisk = getAtRiskStudents();
  const allEliminations = getAllEliminations();

  const filteredEliminations = allEliminations.filter(elim => {
    if (filterStatus === 'all') return true;
    return elim.status === filterStatus;
  });

  // Teacher can only see eliminations for their assigned exams
  const visibleEliminations = useMemo(() => {
    if (isAdmin) return filteredEliminations;
    if (isTeacher) {
      return filteredEliminations.filter(elim => 
        teacherAssignedExamIds.has(String(elim.examId))
      );
    }
    // Students only see published eliminations
    return filteredEliminations.filter(elim => elim.published === true);
  }, [filteredEliminations, isAdmin, isTeacher, teacherAssignedExamIds]);

  // Stats computed from visible eliminations
  const visibleDisqualified = visibleEliminations.filter(e => e.status === 'disqualified');
  const visibleAtRisk = visibleEliminations.filter(e => e.status === 'at_risk');
  const visibleSafe = visibleEliminations.filter(e => e.status === 'safe');

  const getStatusIcon = (status) => {
    if (status === 'disqualified') {
      return <XCircle size={16} />;
    }
    if (status === 'safe') {
      return <ShieldCheck size={16} />;
    }
    return <AlertCircle size={16} />;
  };

  const getStatusClass = (status) => {
    if (status === 'disqualified') {
      return 'status-disqualified';
    }
    if (status === 'safe') {
      return 'status-safe';
    }
    return 'status-at-risk';
  };

  const getStatusLabel = (status) => {
    if (status === 'disqualified') {
      return 'Éliminé';
    }
    if (status === 'safe') {
      return 'Sécurisé';
    }
    return 'À risque';
  };

  const getPresenceColor = (rate) => {
    if (rate <= 33.33) return '#EF4444';
    if (rate <= 66.66) return '#F59E0B';
    return '#10B981';
  };

  // Calculate presence rate for a student in a course (all exams with same subject + class)
  const calculatePresenceRate = (examId, studentId) => {
    if (!examId || !studentId || !exams) return null;
    
    const selectedExam = exams.find(e => String(e.id) === String(examId));
    if (!selectedExam) return null;
    
    // Find all exams with same subject and same className
    const relatedExams = exams.filter(e => 
      e.subject === selectedExam.subject && 
      e.className === selectedExam.className
    );
    
    if (relatedExams.length === 0) return null;
    
    let presentCount = 0;
    relatedExams.forEach(exam => {
      const attendance = exam.attendance || [];
      const studentAttendance = attendance.find(a => String(a.studentId) === String(studentId));
      if (studentAttendance && studentAttendance.present) {
        presentCount++;
      }
    });
    
    const rate = (presentCount / relatedExams.length) * 100;
    return Math.round(rate * 100) / 100;
  };

  // Auto-calculate presence rate when exam or student changes
  useEffect(() => {
    if (formData.examId && formData.studentId && !editingElimination) {
      const rate = calculatePresenceRate(formData.examId, formData.studentId);
      if (rate !== null) {
        setFormData(prev => ({ ...prev, presenceRate: rate.toString() }));
      }
    }
  }, [formData.examId, formData.studentId, editingElimination]);

  const handleAdd = () => {
    setEditingElimination(null);
    setFormData({
      examId: '',
      studentId: '',
      presenceRate: '',
      teacherNote: ''
    });
    setShowModal(true);
  };

  const handleEdit = (elimination) => {
    setEditingElimination(elimination);
    setFormData({
      examId: elimination.examId,
      studentId: elimination.studentId,
      presenceRate: elimination.presenceRate !== undefined ? elimination.presenceRate : (elimination.grade || ''),
      teacherNote: elimination.teacherNote || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (publish = false) => {
    if (!formData.examId || !formData.studentId || !formData.presenceRate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const presenceRate = parseFloat(formData.presenceRate);
    const exam = exams?.find(e => String(e.id) === String(formData.examId));
    const student = students?.find(s => String(s.id) === String(formData.studentId));

    if (editingElimination) {
      await updateElimination(editingElimination.id, {
        ...formData,
        presenceRate: presenceRate,
        grade: presenceRate,
        examId: formData.examId,
        studentId: formData.studentId,
        published: publish ? true : editingElimination.published
      });
    } else {
      await addElimination({
        examId: formData.examId,
        examName: exam?.subject || '',
        studentId: formData.studentId,
        studentName: student?.name || '',
        presenceRate: presenceRate,
        grade: presenceRate,
        teacherNote: formData.teacherNote,
        publishedBy: user?.name || user?.role,
        published: publish
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await deleteElimination(id);
    setDeleteConfirmId(null);
  };

  const handlePublish = async (id) => {
    await publishElimination(id);
  };

  // Student view
  if (isStudent) {
    const myEliminations = allEliminations.filter(e => 
      e.studentId === user?.id && e.published === true
    );
    
    return (
      <div className="elim-page">
        <div className="elim-hero">
          <div className="elim-hero-content">
            <div className="elim-hero-icon">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1>Mes Éliminations</h1>
              <p>Consultez votre statut par module</p>
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
          <div className="elim-stat-card">
            <div className="elim-stat-icon safe">
              <ShieldCheck size={20} />
            </div>
            <div className="elim-stat-info">
              <span className="elim-stat-value">{myEliminations.filter(e => e.status === 'safe').length}</span>
              <span className="elim-stat-label">Sécurisé 🟢</span>
            </div>
          </div>
        </div>

        {myEliminations.length > 0 ? (
          <div className="elim-table-wrapper">
            <div className="elim-table-header">
              <h3>Résultats par module</h3>
              <span className="elim-count">{myEliminations.length} résultat(s)</span>
            </div>
            <div className="elim-table-container">
              <table className="elim-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Taux de présence</th>
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
                        <span className="grade-badge" style={{ backgroundColor: getPresenceColor(elim.presenceRate !== undefined ? elim.presenceRate : elim.grade), color: 'white' }}>
                          {elim.presenceRate !== undefined ? elim.presenceRate : elim.grade}%
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
            <h4>Aucune élimination publiée</h4>
            <p>Vous n'avez été éliminé d'aucun module pour le moment.</p>
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
            <p>Gérez les éliminations selon le taux de présence (🔴 0-33.33% | 🟡 33.34-66.66% | 🟢 66.67-100%)</p>
          </div>
        </div>
        {isAdmin && (
          <div className="elim-hero-actions">
            <button className="elim-add-btn" onClick={handleAdd}>
              <Plus size={18} />
              Nouvelle élimination
            </button>
            {visibleEliminations.some(e => !e.published) && (
              <button className="elim-publish-all-btn" onClick={async () => {
                const drafts = visibleEliminations.filter(e => !e.published);
                for (const d of drafts) {
                  await publishElimination(d.id);
                }
                toast.success(`${drafts.length} élimination(s) publiée(s)`);
              }}>
                <SendHorizontal size={18} />
                Publier tout
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="elim-stats-grid">
        <div className="elim-stat-card">
          <div className="elim-stat-icon total">
            <AlertTriangle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{visibleEliminations.length}</span>
            <span className="elim-stat-label">Total</span>
          </div>
        </div>
        <div className="elim-stat-card">
          <div className="elim-stat-icon disqualified">
            <XCircle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{visibleDisqualified.length}</span>
            <span className="elim-stat-label">Éliminés 🔴</span>
          </div>
        </div>
        <div className="elim-stat-card">
          <div className="elim-stat-icon at-risk">
            <AlertCircle size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{visibleAtRisk.length}</span>
            <span className="elim-stat-label">À risque 🟡</span>
          </div>
        </div>
        <div className="elim-stat-card">
          <div className="elim-stat-icon safe">
            <ShieldCheck size={20} />
          </div>
          <div className="elim-stat-info">
            <span className="elim-stat-value">{visibleSafe.length}</span>
            <span className="elim-stat-label">Sécurisé 🟢</span>
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
            <option value="safe">Sécurisé 🟢</option>
          </select>
        </div>
      </div>

      {/* Eliminations Table */}
      <div className="elim-table-wrapper">
        <div className="elim-table-header">
          <h3>Liste des éliminations</h3>
          <span className="elim-count">{visibleEliminations.length} élimination(s)</span>
        </div>
        <div className="elim-table-container">
          <table className="elim-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Étudiant</th>
                <th>Taux de présence</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Publié par</th>
                <th>État</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleEliminations.map((elim) => (
                <tr key={elim.id} className={`elim-row ${elim.status}`}>
                  <td className="exam-name">{elim.examName}</td>
                  <td>{elim.studentName}</td>
                  <td>
                    <span className="grade-badge" style={{ backgroundColor: getPresenceColor(elim.presenceRate !== undefined ? elim.presenceRate : elim.grade), color: 'white' }}>
                      {elim.presenceRate !== undefined ? elim.presenceRate : elim.grade}%
                    </span>
                  </td>
                  <td>
                    <span className={`elim-status ${getStatusClass(elim.status)}`}>
                      {getStatusIcon(elim.status)}
                      {getStatusLabel(elim.status)}
                    </span>
                  </td>
                  <td>{elim.date}</td>
                  <td>{elim.publishedBy}</td>
                  <td>
                    <span className={`publish-badge ${elim.published ? 'published' : 'draft'}`}>
                      {elim.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="actions-cell">
                      <div className="elim-actions">
                        {!elim.published && (
                          <button className="elim-action-btn publish" onClick={() => handlePublish(elim.id)} title="Publier">
                            <SendHorizontal size={16} />
                          </button>
                        )}
                        <button className="elim-action-btn edit" onClick={() => handleEdit(elim)} title="Modifier">
                          <Edit size={16} />
                        </button>
                        {deleteConfirmId === elim.id ? (
                          <div className="delete-confirm">
                            <button className="elim-action-btn confirm-yes" onClick={() => handleDelete(elim.id)} title="Confirmer">
                              <CheckCircle size={16} />
                            </button>
                            <button className="elim-action-btn confirm-no" onClick={() => setDeleteConfirmId(null)} title="Annuler">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button className="elim-action-btn delete" onClick={() => setDeleteConfirmId(elim.id)} title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        )}
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
                <label>Module (Examen) *</label>
                <select 
                  value={formData.examId}
                  onChange={(e) => setFormData({...formData, examId: e.target.value})}
                >
                  <option value="">Sélectionner un module</option>
                  {(isAdmin ? exams : teacherExams)?.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.subject} ({exam.className})</option>
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
                    <option key={student.id} value={student.id}>{student.name} ({student.className})</option>
                  ))}
                </select>
              </div>
              <div className="elim-form-group">
                <label>Taux de présence (%) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.presenceRate}
                  onChange={(e) => setFormData({...formData, presenceRate: e.target.value})}
                  placeholder="Sélectionnez un module et un étudiant pour calculer automatiquement"
                />
                <small className="form-hint">
                  🔴 0-33.33% = Élimination | 🟡 33.34-66.66% = Risque d'élimination | 🟢 66.67-100% = Sécurisé
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
              {!editingElimination && (
                <button className="btn-primary btn-draft" onClick={() => handleSubmit(false)}>
                  <Plus size={16} />
                  Ajouter
                </button>
              )}
              <button className="btn-primary btn-publish" onClick={() => handleSubmit(true)}>
                <SendHorizontal size={16} />
                {editingElimination ? 'Publier les modifications' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EliminationPage;

