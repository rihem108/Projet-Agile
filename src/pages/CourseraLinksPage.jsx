import React, { useContext, useState } from 'react';
import { BookOpen, ExternalLink, Plus, Save, Trash2, X, FileText } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CourseraLinksPage = () => {
  const { users, user, resourceLinks, addResourceLink, deleteResourceLink } = useContext(AppContext);
  const isStaff = user?.role === 'Teacher' || user?.role === 'Admin';

  // Modal state for adding resource links
  const [showModal, setShowModal] = useState(false);
  const [modalLink, setModalLink] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');

  const handleAddLinkClick = () => {
    setShowModal(true);
    setModalLink('');
    setModalTitle('');
    setModalDescription('');
    setModalStudentId('');
  };

  const handleModalSubmit = async () => {
    if (!modalLink.trim()) {
      toast.error('Veuillez entrer un lien valide');
      return;
    }
    if (!modalStudentId) {
      toast.error('Veuillez sélectionner un étudiant');
      return;
    }
    try {
      await addResourceLink({
        studentId: modalStudentId,
        link: modalLink.trim(),
        title: modalTitle.trim(),
        description: modalDescription.trim()
      });
      setShowModal(false);
      setModalLink('');
      setModalTitle('');
      setModalDescription('');
      setModalStudentId('');
    } catch (err) {
      console.error(err);
      toast.error('Impossible d\'assigner le lien');
    }
  };

  const handleDeleteResourceLink = async (id) => {
    if (!window.confirm('Supprimer ce lien de cours ?')) return;
    await deleteResourceLink(id);
  };

  // Filter resource links
  let displayedResourceLinks = resourceLinks;
  if (user?.role === 'Student') {
    displayedResourceLinks = resourceLinks.filter(l => {
      const sid = l.studentId?.id || l.studentId?._id || l.studentId;
      return String(sid) === String(user.id);
    });
  }

  const students = users.filter(u => u.role === 'Student');

  return (
    <div className="coursera-links-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(249, 115, 22, 0.06))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', flexShrink: 0 }}>
            <BookOpen size={26} />
          </div>
          <h1 className="page-title">Ressources</h1>
        </div>
        {isStaff && (
          <button className="coursera-btn add" onClick={handleAddLinkClick} style={{ padding: '10px 20px', fontSize: '14px' }}>
            <Plus size={16} /> Ajouter un lien de cours
          </button>
        )}
      </div>

      {/* Resource Links Section */}
      <div className="coursera-table-card">
        <div className="coursera-table-header">
          <h3><FileText size={18} /> Liens de cours assignés</h3>
          <span className="coursera-table-count">{displayedResourceLinks.length} entrée(s)</span>
        </div>
        <div className="coursera-table-container">
          <table className="coursera-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Lien</th>
                {isStaff && <th>Étudiant</th>}
                <th>Description</th>
                <th>Date</th>
                {isStaff && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayedResourceLinks.map(link => (
                <tr key={link.id}>
                  <td className="coursera-student-cell">{link.title || 'Sans titre'}</td>
                  <td>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="coursera-link-text"
                      title={link.link}
                    >
                      <ExternalLink size={12} /> {link.link}
                    </a>
                  </td>
                  {isStaff && (
                    <td className="coursera-subject-cell">
                      {link.studentId?.name || 'Inconnu'}
                      {link.studentId?.className && <span style={{ display: 'block', fontSize: '12px', color: '#94A3B8' }}>{link.studentId.className}</span>}
                    </td>
                  )}
                  <td className="coursera-subject-cell">{link.description || '-'}</td>
                  <td className="coursera-text-muted">{link.createdAt ? new Date(link.createdAt).toLocaleDateString('fr-FR') : '-'}</td>
                  {isStaff && (
                    <td>
                      <button
                        className="coursera-btn cancel"
                        onClick={() => handleDeleteResourceLink(link.id)}
                        title="Supprimer le lien"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {displayedResourceLinks.length === 0 && (
                <tr>
                  <td colSpan={isStaff ? 6 : 4} className="coursera-empty">
                    <h4>Aucun lien de cours assigné</h4>
                    <p>{user?.role === 'Student' ? 'Vous n\'avez aucun lien de cours assigné pour le moment.' : 'Aucun lien de cours n\'a été assigné.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={18} /> Ajouter un lien de cours</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-form-group">
                <label>Étudiant *</label>
                <select
                  value={modalStudentId}
                  onChange={(e) => setModalStudentId(e.target.value)}
                  className="coursera-input"
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="">Sélectionner un étudiant...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.className ? `(${student.className})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-form-group">
                <label>Lien du cours *</label>
                <input
                  type="url"
                  placeholder="https://coursera.org/..."
                  value={modalLink}
                  onChange={(e) => setModalLink(e.target.value)}
                  className="coursera-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="modal-form-group">
                <label>Titre (optionnel)</label>
                <input
                  type="text"
                  placeholder="Titre du cours..."
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="coursera-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="modal-form-group">
                <label>Description (optionnel)</label>
                <textarea
                  placeholder="Description du cours..."
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="coursera-input"
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="coursera-btn cancel" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="coursera-btn save" onClick={handleModalSubmit}>
                <Save size={14} /> Assigner le lien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseraLinksPage;

