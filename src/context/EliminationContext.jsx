// src/context/EliminationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';
import toast from 'react-hot-toast';

const EliminationContext = createContext();

export const EliminationProvider = ({ children }) => {
  const { user, users, exams, grades } = useContext(AppContext);
  const [eliminations, setEliminations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to determine elimination status based on grade
  const getEliminationStatus = (grade) => {
    if (grade === null || grade === undefined) return null;
    if (grade <= 33.33) return 'disqualified'; // 🔴 Exam disqualification
    if (grade <= 66.66) return 'at_risk'; // 🟡 Risk of disqualification
    return 'passed'; // ✅ Passed
  };

  // Helper function to get elimination message
  const getEliminationMessage = (status, grade) => {
    if (status === 'disqualified') {
      return `Note: ${grade}% - Élimination définitive de l'examen`;
    }
    if (status === 'at_risk') {
      return `Note: ${grade}% - Risque d'élimination. Une session de rattrapage est recommandée.`;
    }
    return null;
  };

  // Auto-generate eliminations from grades
  const generateEliminationsFromGrades = () => {
    if (!grades || !exams) return [];
    
    const newEliminations = [];
    
    grades.forEach(grade => {
      const exam = exams.find(e => e.id === grade.examId);
      const status = getEliminationStatus(grade.grade);
      
      if (status === 'disqualified' || status === 'at_risk') {
        // Check if elimination already exists
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
            grade: grade.grade,
            status: status,
            reason: status === 'disqualified' ? 'Note inférieure au seuil d\'élimination (0-33.33%)' : 'Note dans la zone à risque (33.34-66.66%)',
            message: getEliminationMessage(status, grade.grade),
            date: new Date().toISOString().split('T')[0],
            publishedBy: 'System (Automatique)',
            teacherNote: status === 'disqualified' ? 'Élimination automatique basée sur la note' : 'Surveillance recommandée pour les prochains examens'
          });
        }
      }
    });
    
    return newEliminations;
  };

  // Mock elimination data
  const [localEliminations, setLocalEliminations] = useState([
    {
      id: 1,
      examId: 1,
      examName: 'Mathématiques',
      studentId: 4,
      studentName: 'Ahmed Mansouri',
      grade: 28.5,
      status: 'disqualified',
      reason: 'Note inférieure au seuil d\'élimination (0-33.33%)',
      message: 'Note: 28.5% - Élimination définitive de l\'examen',
      date: '2026-05-20',
      publishedBy: 'System (Automatique)',
      teacherNote: 'Doit repasser l\'examen'
    },
    {
      id: 2,
      examId: 1,
      examName: 'Mathématiques',
      studentId: 5,
      studentName: 'Leila Trabelsi',
      grade: 45.0,
      status: 'at_risk',
      reason: 'Note dans la zone à risque (33.34-66.66%)',
      message: 'Note: 45% - Risque d\'élimination. Une session de rattrapage est recommandée.',
      date: '2026-05-20',
      publishedBy: 'System (Automatique)',
      teacherNote: 'Peut passer en rattrapage'
    },
    {
      id: 3,
      examId: 2,
      examName: 'Physique',
      studentId: 4,
      studentName: 'Ahmed Mansouri',
      grade: 52.0,
      status: 'at_risk',
      reason: 'Note dans la zone à risque (33.34-66.66%)',
      message: 'Note: 52% - Risque d\'élimination. Une session de rattrapage est recommandée.',
      date: '2026-05-21',
      publishedBy: 'System (Automatique)',
      teacherNote: 'Avertissement'
    }
  ]);

  useEffect(() => {
    // Load eliminations from localStorage
    const saved = localStorage.getItem('eliminations');
    if (saved) {
      setLocalEliminations(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Save eliminations to localStorage
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
          grade: newGrade.grade,
          status: status,
          reason: status === 'disqualified' 
            ? 'Note inférieure au seuil d\'élimination (0-33.33%)' 
            : 'Note dans la zone à risque (33.34-66.66%)',
          message: getEliminationMessage(status, newGrade.grade),
          date: new Date().toISOString().split('T')[0],
          publishedBy: user?.name || 'System',
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
      const newElimination = {
        id: Date.now(),
        ...eliminationData,
        date: new Date().toISOString().split('T')[0],
        publishedBy: user?.name || user?.role,
        status: eliminationData.grade <= 33.33 ? 'disqualified' : 'at_risk'
      };
      setLocalEliminations([...localEliminations, newElimination]);
      toast.success('Élimination ajoutée avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
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
      setLocalEliminations(localEliminations.map(e => 
        e.id === id ? { ...e, ...data } : e
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