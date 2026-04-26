import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';
import toast from 'react-hot-toast';

const EliminationContext = createContext();

export const EliminationProvider = ({ children }) => {
  const { user, users, exams, grades } = useContext(AppContext);
  const [eliminations, setEliminations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to determine elimination status based on presence rate
  const getEliminationStatus = (presenceRate) => {
    if (presenceRate === null || presenceRate === undefined) return null;
    if (presenceRate <= 33.33) return 'disqualified'; // 🔴 Exam disqualification
    if (presenceRate <= 66.66) return 'at_risk'; // 🟡 Risk of disqualification
    return 'safe'; // 🟢 Safe zone
  };

  // Helper function to get elimination message
  const getEliminationMessage = (status, presenceRate) => {
    if (status === 'disqualified') {
      return `Taux de présence: ${presenceRate}% - Élimination définitive de l'examen`;
    }
    if (status === 'at_risk') {
      return `Taux de présence: ${presenceRate}% - Risque d'élimination. Une session de rattrapage est recommandée.`;
    }
    return null;
  };

  // Auto-generate eliminations from grades (legacy - now based on presence)
  const generateEliminationsFromGrades = () => {
    if (!grades || !exams) return [];
    
    const newEliminations = [];
    
    grades.forEach(grade => {
      const exam = exams.find(e => e.id === grade.examId);
      const status = getEliminationStatus(grade.grade);
      
      if (status === 'disqualified' || status === 'at_risk') {
        const exists = localEliminations.some(e => 
          e.examId === grade.examId && e.studentId === grade.studentId
        );
        
        if (!exists) {
          newEliminations.push({
            id: Date.now() + Math.random(),
            examId: grade.examId,
            examName: exam?.subject || 'Inconnu',
            studentId: grade.studentId,
            studentName: grade.studentName || `Étudiant ${grade.studentId}`,
            presenceRate: grade.grade,
            status: status,
            reason: status === 'disqualified' 
              ? 'Taux de présence inférieur au seuil d\'élimination (0-33.33%)' 
              : 'Taux de présence dans la zone à risque (33.34-66.66%)',
            message: getEliminationMessage(status, grade.grade),
            date: new Date().toISOString().split('T')[0],
            publishedBy: 'System (Automatique)',
            published: true,
            teacherNote: status === 'disqualified' 
              ? 'Élimination automatique basée sur le taux de présence' 
              : 'Surveillance recommandée pour les prochains examens'
          });
        }
      }
    });
    
    return newEliminations;
  };

  // Mock elimination data
  const [localEliminations, setLocalEliminations] = useState(() => {
    const saved = localStorage.getItem('eliminations');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data: rename grade to presenceRate if needed
      return parsed.map(e => ({
        ...e,
        presenceRate: e.presenceRate !== undefined ? e.presenceRate : e.grade,
        published: e.published !== undefined ? e.published : true
      }));
    }
    return [
      {
        id: 1,
        examId: 1,
        examName: 'Mathématiques',
        studentId: 4,
        studentName: 'Ahmed Mansouri',
        presenceRate: 28.5,
        status: 'disqualified',
        reason: 'Taux de présence inférieur au seuil d\'élimination (0-33.33%)',
        message: 'Taux de présence: 28.5% - Élimination définitive de l\'examen',
        date: '2026-05-20',
        publishedBy: 'System (Automatique)',
        published: true,
        teacherNote: 'Doit repasser l\'examen'
      },
      {
        id: 2,
        examId: 1,
        examName: 'Mathématiques',
        studentId: 5,
        studentName: 'Leila Trabelsi',
        presenceRate: 45.0,
        status: 'at_risk',
        reason: 'Taux de présence dans la zone à risque (33.34-66.66%)',
        message: 'Taux de présence: 45% - Risque d\'élimination. Une session de rattrapage est recommandée.',
        date: '2026-05-20',
        publishedBy: 'System (Automatique)',
        published: true,
        teacherNote: 'Peut passer en rattrapage'
      },
      {
        id: 3,
        examId: 2,
        examName: 'Physique',
        studentId: 4,
        studentName: 'Ahmed Mansouri',
        presenceRate: 52.0,
        status: 'at_risk',
        reason: 'Taux de présence dans la zone à risque (33.34-66.66%)',
        message: 'Taux de présence: 52% - Risque d\'élimination. Une session de rattrapage est recommandée.',
        date: '2026-05-21',
        publishedBy: 'System (Automatique)',
        published: true,
        teacherNote: 'Avertissement'
      }
    ];
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('eliminations', JSON.stringify(localEliminations));
    }
  }, [localEliminations, loading]);

  // Auto-check grades and generate eliminations
  const checkAndGenerateEliminations = (newGrade) => {
    if (!newGrade) return;
    
    const exam = exams?.find(e => e.id === newGrade.examId);
    const status = getEliminationStatus(newGrade.grade);
    
    if (status === 'disqualified' || status === 'at_risk') {
      const exists = localEliminations.some(e => 
        e.examId === newGrade.examId && e.studentId === newGrade.studentId
      );
      
      if (!exists) {
        const newElimination = {
          id: Date.now(),
          examId: newGrade.examId,
          examName: exam?.subject || 'Inconnu',
          studentId: newGrade.studentId,
          studentName: newGrade.studentName || `Étudiant ${newGrade.studentId}`,
          presenceRate: newGrade.grade,
          status: status,
          reason: status === 'disqualified' 
            ? 'Taux de présence inférieur au seuil d\'élimination (0-33.33%)' 
            : 'Taux de présence dans la zone à risque (33.34-66.66%)',
          message: getEliminationMessage(status, newGrade.grade),
          date: new Date().toISOString().split('T')[0],
          publishedBy: user?.name || 'System',
          published: true,
          teacherNote: status === 'disqualified' ? 'Élimination automatique' : 'À surveiller'
        };
        
        setLocalEliminations(prev => [...prev, newElimination]);
        toast.warning(`Élimination générée pour ${newGrade.studentName} - ${exam?.subject}`);
        return true;
      }
    }
    return false;
  };

  // Get eliminations by student ID
  const getStudentEliminations = (studentId) => {
    return localEliminations.filter(e => e.studentId === studentId);
  };

  // Get eliminations by exam ID (for teachers)
  const getExamEliminations = (examId) => {
    return localEliminations.filter(e => e.examId === examId);
  };

  // Get disqualified students (🔴)
  const getDisqualifiedStudents = () => {
    return localEliminations.filter(e => e.status === 'disqualified');
  };

  // Get at-risk students (🟡)
  const getAtRiskStudents = () => {
    return localEliminations.filter(e => e.status === 'at_risk');
  };

  // Get all eliminations
  const getAllEliminations = () => {
    return localEliminations;
  };

  // Add manual elimination
  const addElimination = async (eliminationData) => {
    try {
      const presenceRate = parseFloat(eliminationData.presenceRate || eliminationData.grade);
      const status = getEliminationStatus(presenceRate);
      const newElimination = {
        id: Date.now(),
        ...eliminationData,
        presenceRate: presenceRate,
        grade: presenceRate, // backward compatibility
        status: status,
        date: new Date().toISOString().split('T')[0],
        publishedBy: user?.name || user?.role,
        published: eliminationData.published === true,
        reason: status === 'disqualified' 
          ? 'Taux de présence inférieur au seuil d\'élimination (0-33.33%)' 
          : 'Taux de présence dans la zone à risque (33.34-66.66%)',
        message: getEliminationMessage(status, presenceRate)
      };
      setLocalEliminations([...localEliminations, newElimination]);
      toast.success(eliminationData.published ? 'Élimination publiée avec succès' : 'Élimination ajoutée (brouillon)');
      return true;
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
      return false;
    }
  };

  // Publish elimination
  const publishElimination = async (id) => {
    try {
      setLocalEliminations(localEliminations.map(e => 
        e.id === id ? { ...e, published: true } : e
      ));
      toast.success('Élimination publiée');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la publication');
      return false;
    }
  };

  // Delete elimination
  const deleteElimination = async (id) => {
    try {
      setLocalEliminations(localEliminations.filter(e => e.id !== id));
      toast.success('Élimination supprimée');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  // Update elimination
  const updateElimination = async (id, data) => {
    try {
      const presenceRate = data.presenceRate !== undefined 
        ? parseFloat(data.presenceRate) 
        : data.grade !== undefined 
          ? parseFloat(data.grade) 
          : undefined;
      
      const updates = { ...data };
      if (presenceRate !== undefined) {
        updates.presenceRate = presenceRate;
        updates.grade = presenceRate;
        updates.status = getEliminationStatus(presenceRate);
        updates.reason = updates.status === 'disqualified' 
          ? 'Taux de présence inférieur au seuil d\'élimination (0-33.33%)' 
          : 'Taux de présence dans la zone à risque (33.34-66.66%)';
        updates.message = getEliminationMessage(updates.status, presenceRate);
      }

      setLocalEliminations(localEliminations.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ));
      toast.success('Élimination mise à jour');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  };

  const value = {
    eliminations: localEliminations,
    loading,
    getStudentEliminations,
    getExamEliminations,
    getDisqualifiedStudents,
    getAtRiskStudents,
    getAllEliminations,
    addElimination,
    publishElimination,
    deleteElimination,
    updateElimination,
    checkAndGenerateEliminations,
    getEliminationStatus,
  };

  return (
    <EliminationContext.Provider value={value}>
      {children}
    </EliminationContext.Provider>
  );
};

export const useElimination = () => {
  const context = useContext(EliminationContext);
  if (!context) {
    throw new Error('useElimination must be used within EliminationProvider');
  }
  return context;
};

