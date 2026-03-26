import React, { useContext, useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ReportsPage = () => {
  const { exams, assignments, users, rooms } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Demande de génération du document PDF confirmée.");
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rapports & Documents</h1>
        <div className="flex gap-4">
          <button className="btn btn-ghost" onClick={handlePrint}>
            <Printer size={18} /> Imprimer
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={loading}>
            <Download size={18} /> {loading ? 'Génération...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      <div className="glass-card mb-6" style={{ background: 'var(--surface)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText color="var(--primary)" />
            Planning Officiel des Examens
          </h2>
          <span className="badge badge-info flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
            Année Universitaire 2025/2026
          </span>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
          <table>
            <thead>
              <tr>
                <th>Matière</th>
                <th>Date Prévue</th>
                <th>Durée</th>
                <th>Salle</th>
                <th>Surveillant</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => {
                const assign = assignments.find(a => a.examId === exam.id);
                const roomName = assign ? rooms.find(r => r.id === assign.roomId)?.name : 'Non assignée';
                const supervisorName = assign ? users.find(u => u.id === assign.supervisorId)?.name : 'Non assigné';

                return (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 600 }}>{exam.subject}</td>
                    <td>{exam.date}</td>
                    <td>{exam.duration}</td>
                    <td>{roomName || 'En attente'}</td>
                    <td>{supervisorName || 'En attente'}</td>
                  </tr>
                );
              })}
              {exams.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aucun examen à afficher au planning.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

