
import React, { useState, useEffect, useRef } from 'react';

const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  // Fix: Replaced NodeJS.Timeout with any to avoid 'Cannot find namespace NodeJS' error in browser environments
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      alert('Focus session complete! Take a break.');
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      alert('Break over! Time to focus.');
      setMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((mode === 'focus' ? 25 * 60 : 5 * 60) - timeLeft) / (mode === 'focus' ? 25 * 60 : 5 * 60) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-indigo-900/20 rounded-3xl border border-indigo-500/30 animate-fade-in">
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={754}
            strokeDashoffset={754 - (754 * progress) / 100}
            className="text-indigo-500 transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="text-center">
          <span className="text-sm font-medium text-indigo-400 uppercase tracking-widest">{mode}</span>
          <h2 className="text-6xl font-bold mt-1">{formatTime(timeLeft)}</h2>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-full font-semibold transition-all ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 font-semibold transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
