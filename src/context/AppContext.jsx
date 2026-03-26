import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Fake Data
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Dupont', role: 'Teacher', email: 'alice@exam.com' },
    { id: 2, name: 'Bob Martin', role: 'Student', email: 'bob@exam.com' },
    { id: 3, name: 'Charlie Durand', role: 'Student', email: 'charlie@exam.com' },
  ]);

  const [exams, setExams] = useState([
    { id: 1, subject: 'Mathématiques', date: '2026-05-15', duration: '2h' },
    { id: 2, subject: 'Physique', date: '2026-05-16', duration: '1h30' },
  ]);

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Salle A101', capacity: 30 },
    { id: 2, name: 'Amphi B', capacity: 150 },
  ]);

  const [assignments, setAssignments] = useState([]);
  
  const [grades, setGrades] = useState([
    { id: 1, examId: 1, studentId: 2, grade: 14, validated: true },
    { id: 2, examId: 1, studentId: 3, grade: 8, validated: false },
  ]);

  const login = (email, password) => {
    // Fake login
    setIsAuthenticated(true);
    setUser({ email, role: 'ADMIN' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      users, setUsers,
      exams, setExams,
      rooms, setRooms,
      assignments, setAssignments,
      grades, setGrades
    }}>
      {children}
    </AppContext.Provider>
  );
};

