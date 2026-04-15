import React, { useContext, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

const AssignmentPage = () => {
    const { exams, rooms, users, assignments, setAssignments } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [draftAssignments, setDraftAssignments] = useState([]);

    const teachers = users.filter((u) => u.role === 'Teacher');

    useEffect(() => {
        const mapped = exams.map((exam) => {
            const existing = assignments.find((a) => a.examId === exam.id);
            return {
                examId: exam.id,
                roomId: existing?.roomId || '',
                supervisorId: existing?.supervisorId || ''
            };
        });
        setDraftAssignments(mapped);
    }, [exams, assignments]);

    const updateDraft = (examId, field, value) => {
        setDraftAssignments((current) =>
            current.map((item) => (item.examId === examId ? { ...item, [field]: value } : item))
        );
    };

    const parseDurationToMinutes = (duration) => {
        if (!duration) return 60;
        const value = String(duration).toLowerCase().replace(/\s+/g, '');
        const hours = value.match(/(\d+)h/);
        const mins = value.match(/(\d+)(min|m)/);

        if (hours || mins) {
            const h = hours ? Number(hours[1]) : 0;
            const m = mins ? Number(mins[1]) : 0;
            return h * 60 + m || 60;
        }

        const numeric = Number(value);
        return Number.isFinite(numeric) && numeric > 0 ? numeric : 60;
    };

    const getExamInterval = (examId) => {
        const exam = exams.find((e) => e.id === examId);
        if (!exam) return null;

        const date = new Date(exam.date);
        if (Number.isNaN(date.getTime())) {
            return { exam, start: null, end: null };
        }

        const durationMinutes = parseDurationToMinutes(exam.duration);
        const start = date.getTime();
        const end = start + durationMinutes * 60 * 1000;
        return { exam, start, end };
    };

    const intervalsOverlap = (a, b) => {
        if (!a || !b) return false;

        // If parsing fails, fallback to same-date conflict to stay safe.
        if (a.start === null || b.start === null) {
            return String(a?.exam?.date || '') === String(b?.exam?.date || '');
        }

        return a.start < b.end && b.start < a.end;
    };

    const getAvailableRooms = (currentExamId) => {
        const currentDraft = draftAssignments.find((a) => a.examId === currentExamId);
        const currentInterval = getExamInterval(currentExamId);

        const occupiedRoomIds = new Set(
            draftAssignments
                .filter((a) => a.examId !== currentExamId && a.roomId)
                .filter((a) => intervalsOverlap(currentInterval, getExamInterval(a.examId)))
                .map((a) => a.roomId)
        );

        return rooms.filter(
            (room) => !occupiedRoomIds.has(room.id) || room.id === currentDraft?.roomId
        );
    };

    const getAvailableTeachers = (currentExamId) => {
        const currentDraft = draftAssignments.find((a) => a.examId === currentExamId);
        const currentInterval = getExamInterval(currentExamId);

        const occupiedTeacherIds = new Set(
            draftAssignments
                .filter((a) => a.examId !== currentExamId && a.supervisorId)
                .filter((a) => intervalsOverlap(currentInterval, getExamInterval(a.examId)))
                .map((a) => a.supervisorId)
        );

        return teachers.filter(
            (teacher) => !occupiedTeacherIds.has(teacher.id) || teacher.id === currentDraft?.supervisorId
        );
    };

    const getExamSubject = (id) => exams.find((e) => e.id === id)?.subject || 'Inconnu';
    const getExamDate = (id) => exams.find((e) => e.id === id)?.date || '';

    const saveManualAssignments = async () => {
        setLoading(true);
        try {
            const validAssignments = draftAssignments.filter((a) => a.roomId && a.supervisorId);
            const savedAssignments = await api.post('/assignments/bulk', validAssignments);
            setAssignments(savedAssignments);
            toast.success('Affectations enregistrées');
        } catch (err) {
            console.error(err);
            toast.error("Impossible d'enregistrer les affectations");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Affectation Manuelle</h1>
                <button className="btn btn-primary" onClick={saveManualAssignments} disabled={loading}>
                    {loading ? 'Enregistrement...' : <><CheckCircle2 size={18} /> Enregistrer</>}
                </button>
            </div>

            <div className="glass-card mb-6">
                <h3>Configuration</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                    Choisissez une salle et un enseignant pour chaque examen, puis cliquez sur Enregistrer.
                </p>
            </div>

            <div className="glass-card table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Examen</th>
                            <th>Date</th>
                            <th>Salle</th>
                            <th>Surveillant</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {draftAssignments.length > 0 ? (
                            draftAssignments.map((assignment) => {
                                const complete = Boolean(assignment.roomId && assignment.supervisorId);
                                const availableRooms = getAvailableRooms(assignment.examId);
                                const availableTeachers = getAvailableTeachers(assignment.examId);
                                return (
                                    <tr key={assignment.examId}>
                                        <td style={{ fontWeight: 500 }}>{getExamSubject(assignment.examId)}</td>
                                        <td>{getExamDate(assignment.examId)}</td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={assignment.roomId}
                                                onChange={(e) => updateDraft(assignment.examId, 'roomId', e.target.value)}
                                            >
                                                <option value="">Choisir une salle</option>
                                                {availableRooms.map((room) => (
                                                    <option key={room.id} value={room.id}>{room.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={assignment.supervisorId}
                                                onChange={(e) => updateDraft(assignment.examId, 'supervisorId', e.target.value)}
                                            >
                                                <option value="">Choisir un enseignant</option>
                                                {availableTeachers.map((teacher) => (
                                                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            {complete ? (
                                                <span className="badge badge-success">Prêt</span>
                                            ) : (
                                                <span className="badge badge-warning">Incomplet</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Aucun examen disponible.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentPage;
