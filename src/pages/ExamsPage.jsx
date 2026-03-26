import React, { useContext, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ExamsPage = () => {
  const { exams, setExams } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, subject: '', date: '', duration: '' });

  const openModal = (exam = null) => {
    if (exam) setFormData(exam);
    else setFormData({ id: null, subject: '', date: '', duration: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      setExams(exams.map(ex => ex.id === formData.id ? formData : ex));
    } else {
      setExams([...exams, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      setExams(exams.filter(ex => ex.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Examens</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Planifier Examen
        </button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th>Date</th>
              <th>Durée</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}>
                <td style={{ fontWeight: 500 }}>{exam.subject}</td>
                <td>{exam.date}</td>
                <td>{exam.duration}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-icon btn-ghost" onClick={() => openModal(exam)}><Edit2 size={16} /></button>
                    <button className="btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(exam.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Aucun examen planifié.</td>
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
    </div>
  );
};

export default ExamsPage;

