import React, { useContext, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const RoomsPage = () => {
  const { rooms, setRooms } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', capacity: '' });

  const openModal = (room = null) => {
    if (room) setFormData(room);
    else setFormData({ id: null, name: '', capacity: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      setRooms(rooms.map(r => r.id === formData.id ? formData : r));
    } else {
      setRooms([...rooms, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Confirmer la suppression de cette salle ?")) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Salles</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Ajouter Salle
        </button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Nom de la salle</th>
              <th>Capacité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td style={{ fontWeight: 500 }}>{room.name}</td>
                <td>{room.capacity} places</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-icon btn-ghost" onClick={() => openModal(room)}><Edit2 size={16} /></button>
                    <button className="btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(room.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>Aucune salle configurée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? "Modifier" : "Ajouter"} Salle</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom de la salle</label>
                <input type="text" className="form-input" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Capacité (nombre d'étudiants)</label>
                <input type="number" className="form-input" required
                  value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
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

export default RoomsPage;

