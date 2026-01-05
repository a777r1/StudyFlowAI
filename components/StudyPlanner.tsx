
import React, { useState } from 'react';
import { StudySession } from '../types';

interface Props {
  sessions: StudySession[];
  onAddSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
}

const StudyPlanner: React.FC<Props> = ({ sessions, onAddSession, onDeleteSession }) => {
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !startTime) return;

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject,
      startTime: new Date(startTime),
      durationMinutes: parseInt(duration),
    };

    onAddSession(newSession);
    setSubject('');
    setStartTime('');
  };

  const formatToICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICS = (sessionsToExport: StudySession[]) => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyFlow AI//Study Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    sessionsToExport.forEach(session => {
      const end = new Date(session.startTime.getTime() + session.durationMinutes * 60000);
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${session.id}@studyflow.ai`,
        `DTSTAMP:${formatToICSDate(new Date())}`,
        `DTSTART:${formatToICSDate(session.startTime)}`,
        `DTEND:${formatToICSDate(end)}`,
        `SUMMARY:Study: ${session.subject}`,
        'DESCRIPTION:Focused study session scheduled via StudyFlow AI.',
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  const downloadICS = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllSessions = () => {
    if (sessions.length === 0) return;
    const content = generateICS(sessions);
    downloadICS(content, 'study-flow-sessions.ics');
  };

  const exportSingleSession = (session: StudySession) => {
    const content = generateICS([session]);
    downloadICS(content, `study-${session.subject.toLowerCase().replace(/\s+/g, '-')}.ics`);
  };

  const sortedSessions = [...sessions].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Schedule Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
        <h3 className="text-xl font-bold mb-6 text-indigo-100 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Schedule New Session
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Subject / Topic</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Quantum Physics"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-gray-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-white [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Duration</label>
            <div className="flex space-x-2">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-white"
              >
                <option value="15" className="bg-[#0f111a]">15 min</option>
                <option value="30" className="bg-[#0f111a]">30 min</option>
                <option value="45" className="bg-[#0f111a]">45 min</option>
                <option value="60" className="bg-[#0f111a]">1 hour</option>
                <option value="90" className="bg-[#0f111a]">1.5 hours</option>
                <option value="120" className="bg-[#0f111a]">2 hours</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-semibold text-gray-400 flex items-center">
            <span>Upcoming Sessions</span>
            <span className="ml-3 text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">{sessions.length} Scheduled</span>
          </h3>
          {sessions.length > 0 && (
            <button 
              onClick={exportAllSessions}
              className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 hover:bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Export All to Calendar</span>
            </button>
          )}
        </div>
        
        {sortedSessions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl text-gray-500">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-400">Your roadmap is clear!</p>
            <p className="text-sm">Plan your first session above to stay organized.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedSessions.map((session) => (
              <div key={session.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors truncate max-w-[150px]">{session.subject}</h4>
                      <p className="text-xs text-gray-500">{session.durationMinutes} Minutes</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => exportSingleSession(session)}
                      title="Add to calendar"
                      className="text-gray-600 hover:text-indigo-400 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDeleteSession(session.id)}
                      title="Delete session"
                      className="text-gray-600 hover:text-red-400 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-indigo-300 bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20 relative z-10">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {session.startTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    <span className="mx-2 opacity-50">|</span>
                    {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
