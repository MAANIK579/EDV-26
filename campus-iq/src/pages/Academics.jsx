import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const courses = [
    { code: 'CS301', name: 'Data Structures & Algorithms', prof: 'Prof. Mehra', credits: 4, grade: 88, letter: 'A', color: '#00d4ff', assignments: [{ name: 'Trees Implementation', due: 'Mar 2', soon: true }, { name: 'Graph Algorithms', due: 'Mar 10', soon: false }] },
    { code: 'CS405', name: 'Machine Learning', prof: 'Dr. Kapoor', credits: 4, grade: 92, letter: 'A+', color: '#7c3aed', assignments: [{ name: 'Neural Network Lab', due: 'Mar 4', soon: true }, { name: 'SVM Report', due: 'Mar 15', soon: false }] },
    { code: 'CS310', name: 'Operating Systems', prof: 'Prof. Singh', credits: 3, grade: 79, letter: 'B+', color: '#f472b6', assignments: [{ name: 'Process Scheduling', due: 'Mar 1', soon: true }] },
    { code: 'CS420', name: 'Computer Networks', prof: 'Dr. Das', credits: 3, grade: 85, letter: 'A', color: '#fbbf24', assignments: [{ name: 'Socket Programming', due: 'Mar 8', soon: false }] },
    { code: 'MA201', name: 'Probability & Statistics', prof: 'Prof. Roy', credits: 3, grade: 91, letter: 'A+', color: '#34d399', assignments: [{ name: 'Hypothesis Testing', due: 'Mar 12', soon: false }] },
    { code: 'HS102', name: 'Professional Ethics', prof: 'Dr. Jain', credits: 2, grade: 95, letter: 'A+', color: '#f97316', assignments: [{ name: 'Case Study Report', due: 'Mar 6', soon: true }] },
];

const gradeDistribution = courses.map(c => ({ name: c.code, grade: c.grade, fill: c.color }));

const semesterProgress = [
    { label: 'Weeks Completed', value: 10, max: 16 },
    { label: 'Credits Earned', value: 86, max: 120 },
    { label: 'Assignments Done', value: 18, max: 24 },
];

export default function Academics() {
    const { completedAssignments, toggleAssignment } = useApp();

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-book-open"></i> Academics</h1>
                <p className="subtitle">Your courses, grades, and academic progress</p>
            </div>

            {/* Grade Distribution Chart */}
            <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3><i className="fas fa-chart-bar" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                        <Bar dataKey="grade" radius={[4, 4, 0, 0]}>
                            {gradeDistribution.map((entry, i) => (
                                <rect key={i} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Course Cards */}
            <div className="grid-3" style={{ marginBottom: 32 }}>
                {courses.map((course, i) => (
                    <div key={course.code} className="course-card" style={{ '--accent': course.color, animationDelay: `${i * 0.06}s` }}>
                        <div className="course-header">
                            <span className="course-code" style={{ color: course.color }}>{course.code}</span>
                            <span className="course-credits">{course.credits} Credits</span>
                        </div>
                        <h3>{course.name}</h3>
                        <p className="course-prof"><i className="fas fa-user-tie"></i> {course.prof}</p>

                        <div className="grade-bar">
                            <div className="grade-fill" style={{ width: `${course.grade}%`, background: course.color }}>
                                <span>{course.letter} · {course.grade}%</span>
                            </div>
                        </div>

                        <div>
                            {course.assignments.map(a => {
                                const key = `${course.code}: ${a.name}`;
                                const isDone = !!completedAssignments[key];
                                return (
                                    <div
                                        key={a.name}
                                        className={`assign-item ${isDone ? 'completed' : ''}`}
                                        onClick={() => toggleAssignment(key)}
                                    >
                                        <div className="assign-check"><i className="fas fa-check"></i></div>
                                        <span className="assign-label">{a.name}</span>
                                        <span className={`assign-due ${a.soon ? 'soon' : ''}`}>{a.due}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Semester Progress */}
            <div className="glass-card">
                <h3><i className="fas fa-tasks" style={{ color: 'var(--green)', marginRight: 8 }}></i>Semester Progress</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
                    {semesterProgress.map(p => (
                        <div key={p.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                <span>{p.label}</span>
                                <span>{p.value}/{p.max}</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${(p.value / p.max) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
