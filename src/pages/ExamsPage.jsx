import React, { useContext, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, X, Users, UserCheck, UserX } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

const ExamsPage = () => {
  const { exams, setExams, setGrades, assignments, user, users } = useContext(AppContext);
  const canEdit = user?.role === 'Admin' || user?.role === 'Teacher';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [attendanceDraft, setAttendanceDraft] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [formData, setFormData] = useState({ id: null, subject: '', className: '', date: '', duration: '' });

  const visibleExams = user?.role === 'Teacher'
    ? exams.filter(exam => 
        String(exam.createdBy || '') === String(user.id) || assignments.some(a => a.examId === exam.id && a.supervisorId === user.id)
      )
    : exams;
  const emptyColSpan = 4 + (user?.role === 'Teacher' ? 1 : 0) + (canEdit ? 1 : 0);

  const getExamStudents = (exam) => users
    .filter(student => student.role === 'Student' && String(student.className || '').trim() === String(exam.className || '').trim())
    .sort((a, b) => a.name.localeCompare(b.name));

  const attendanceStats = useMemo(() => {
    const presentCount = attendanceDraft.filter(entry => entry.present).length;
    return {
      presentCount,
      absentCount: attendanceDraft.length - presentCount
    };
  }, [attendanceDraft]);

  const openModal = (exam = null) => {
    if (exam) setFormData({ ...exam, className: exam.className || '' });
    else setFormData({ id: null, subject: '', className: '', date: '', duration: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openAttendanceModal = (exam) => {
    const students = getExamStudents(exam);
    const savedAttendance = new Map((exam.attendance || []).map(entry => [String(entry.studentId), Boolean(entry.present)]));
    setSelectedExam(exam);
    setAttendanceDraft(students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      present: savedAttendance.has(student.id) ? savedAttendance.get(student.id) : true
    })));
    setAttendanceModalOpen(true);
  };

  const closeAttendanceModal = () => {
    setAttendanceModalOpen(false);
    setSelectedExam(null);
    setAttendanceDraft([]);
  };

  const toggleAttendance = (studentId) => {
    setAttendanceDraft(current => current.map(entry => (
      entry.studentId === studentId ? { ...entry, present: !entry.present } : entry
    )));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      subject: formData.subject.trim(),
      className: formData.className.trim(),
      date: formData.date,
      duration: formData.duration.trim()
    };

    if (formData.id) {
      const updated = await api.put(`/exams/${formData.id}`, payload);
      setExams(exams.map(ex => ex.id === formData.id ? { ...updated, className: updated.className || payload.className } : ex));
    } else {
      await api.post('/exams', payload);
      const refreshedExams = await api.get('/exams');
      setExams(refreshedExams);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter(ex => ex.id !== id));
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedExam) return;

    try {
      setSavingAttendance(true);
      const response = await api.put(`/exams/${selectedExam.id}/attendance`, {
        attendance: attendanceDraft.map(entry => ({
          studentId: entry.studentId,
          present: entry.present
        }))
      });

      const refreshedExams = await api.get('/exams');
      setExams(refreshedExams);
      if (Array.isArray(response.grades)) {
        setGrades(response.grades);
      } else {
        const refreshedGrades = await api.get('/grades');
        setGrades(refreshedGrades);
      }
      toast.success('Présence enregistrée avec succès');
      closeAttendanceModal();
    } catch (err) {
      console.error(err);
      toast.error('Impossible d\'enregistrer la présence');
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Examens</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Planifier Examen
          </button>
        )}
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th>Classe</th>
              <th>Date</th>
              <th>Durée</th>
              {user?.role === 'Teacher' && <th>Présence</th>}
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleExams.map(exam => (
              <tr key={exam.id}>
                <td style={{ fontWeight: 500 }}>{exam.subject}</td>
                <td>{exam.className || 'Non définie'}</td>
                <td>{exam.date}</td>
                <td>{exam.duration}</td>
                {user?.role === 'Teacher' && (
                  <td>
                    <button className="btn btn-ghost" onClick={() => openAttendanceModal(exam)} style={{ padding: '0.4rem 0.8rem' }}>
                      <Users size={16} /> Générer la présence
                    </button>
                  </td>
                )}
                {canEdit && (
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-icon btn-ghost" onClick={() => openModal(exam)}><Edit2 size={16} /></button>
                      <button className="btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(exam.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {visibleExams.length === 0 && (
              <tr>
                <td colSpan={emptyColSpan} style={{ textAlign: 'center', padding: '2rem' }}>Aucun examen planifié.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? "Modifier" : "Planifier"} Examen</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Matière</label>
                <input type="text" className="form-input" required
                  value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Classe concernée</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ex: L1 INFO A"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required
                  value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Durée (ex: 2h)</label>
                <input type="text" className="form-input" required
                  value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {attendanceModalOpen && selectedExam && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 'min(900px, 95vw)' }}>
            <div className="modal-header">
              <h2 className="modal-title">Présence - {selectedExam.subject}</h2>
              <button className="modal-close" onClick={closeAttendanceModal}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Classe : {selectedExam.className || 'Non définie'}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ width: 'fit-content' }}>
                  <UserCheck size={12} /> {attendanceStats.presentCount} présent(s)
                </span>
                <span className="badge badge-warning" style={{ width: 'fit-content' }}>
                  <UserX size={12} /> {attendanceStats.absentCount} absent(s)
                </span>
              </div>
            </div>

            <div className="table-container" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Email</th>
                    <th>Présent</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDraft.map((entry) => (
                    <tr key={entry.studentId}>
                      <td style={{ fontWeight: 500 }}>{entry.studentName}</td>
                      <td>{entry.studentEmail}</td>
                      <td>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={entry.present}
                            onChange={() => toggleAttendance(entry.studentId)}
                          />
                          {entry.present ? 'Présent' : 'Absent'}
                        </label>
                      </td>
                    </tr>
                  ))}
                  {attendanceDraft.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucun étudiant trouvé pour cette classe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeAttendanceModal}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveAttendance} disabled={savingAttendance}>
                Enregistrer la présence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;

