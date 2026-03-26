import React, { useContext, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const UsersPage = () => {
  const { users, setUsers } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', role: 'Student' });

  const openModal = (user = null) => {
    if (user) setFormData(user);
    else setFormData({ id: null, name: '', email: '', role: 'Student' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      setUsers(users.map(u => u.id === formData.id ? formData : u));
    } else {
      setUsers([...users, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Utilisateurs</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Ajouter Utilisateur
        </button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge \${user.role === 'Teacher' ? 'badge-info' : 'badge-warning'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-icon btn-ghost" onClick={() => openModal(user)}><Edit2 size={16} /></button>
                    <button className="btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(user.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Aucun utilisateur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? "Modifier" : "Ajouter"} Utilisateur</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input type="text" className="form-input" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select className="form-select" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Student">Étudiant</option>
                  <option value="Teacher">Enseignant</option>
                </select>
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

export default UsersPage;

