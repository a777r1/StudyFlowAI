
import React, { useState, useEffect, useRef } from 'react';
import { Message, Flashcard, ViewType, StudySession } from './types';
import { chatWithLumina, generateFlashcards } from './services/gemini';
import FocusTimer from './components/FocusTimer';
import FlashcardViewer from './components/FlashcardViewer';
import StudyPlanner from './components/StudyPlanner';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi, I'm Lumina! 👋 Your dedicated AI study buddy. I can help explain tricky concepts, generate flashcards, or scan your notes. What are we studying today?",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: selectedImage ? [selectedImage] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithLumina(userMessage.content, history, userMessage.attachments?.[0]?.split(',')[1]);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "I'm sorry, I couldn't process that.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Simple heuristic: If user asks for flashcards, auto-generate them
      if (input.toLowerCase().includes('flashcards')) {
        const cards = await generateFlashcards(input.replace(/generate|flashcards/gi, '').trim() || "the last discussed topic");
        setFlashcards(cards);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wrong while thinking. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSession = (session: StudySession) => {
    setSessions(prev => [...prev, session]);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#0a0b10] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 md:w-64 border-r border-white/5 flex flex-col bg-[#0f111a] z-10">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="hidden md:block font-bold text-xl tracking-tight">StudyFlow</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<ChatIcon />} label="Study Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
          <NavItem icon={<PlannerIcon />} label="Study Planner" active={currentView === 'planner'} onClick={() => setCurrentView('planner')} />
          <NavItem icon={<FlashcardIcon />} label="Flashcards" active={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')} />
          <NavItem icon={<TimerIcon />} label="Focus Timer" active={currentView === 'timer'} onClick={() => setCurrentView('timer')} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-indigo-600/10 rounded-2xl p-4 md:block hidden">
            <p className="text-xs font-semibold text-indigo-400 uppercase mb-1">Upcoming Session</p>
            <p className="text-sm truncate">
              {sessions.length > 0 ? sessions[0].subject : 'None scheduled'}
            </p>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-500 h-full w-[65%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0f111a]/50 backdrop-blur-md">
          <h2 className="font-semibold text-lg text-indigo-100">
            {currentView === 'chat' && 'Assistant Lumina'}
            {currentView === 'flashcards' && 'Active Recall'}
            {currentView === 'timer' && 'Pomodoro Focus'}
            {currentView === 'planner' && 'Study Roadmap'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-sm text-green-400">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span>AI Online</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {currentView === 'chat' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] rounded-3xl px-6 py-4 ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                      : 'bg-white/5 border border-white/10 text-gray-200'
                  }`}>
                    {m.attachments?.map((att, idx) => (
                      <img key={idx} src={att} alt="Attachment" className="max-w-full rounded-xl mb-3 border border-white/10" />
                    ))}
                    <div className="whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                      {m.content}
                    </div>
                    <p className="text-[10px] mt-2 opacity-50 text-right">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {currentView === 'flashcards' && <FlashcardViewer cards={flashcards} />}
          {currentView === 'timer' && <FocusTimer />}
          {currentView === 'planner' && (
            <StudyPlanner 
              sessions={sessions} 
              onAddSession={addSession} 
              onDeleteSession={deleteSession} 
            />
          )}
        </div>

        {/* Input Bar - Only show in chat view */}
        {currentView === 'chat' && (
          <div className="p-6 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10] to-transparent">
            <div className="max-w-3xl mx-auto">
              {selectedImage && (
                <div className="mb-3 p-2 bg-white/5 border border-white/10 rounded-xl inline-flex items-center space-x-2 animate-fade-in">
                  <img src={selectedImage} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="text-sm text-gray-400">Scan ready</span>
                  <button onClick={() => setSelectedImage(null)} className="p-1 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question or type 'create flashcards for...'"
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-16 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-gray-100 placeholder:text-gray-500"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <label className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors inline-flex items-center justify-center">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <svg className="w-6 h-6 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() && !selectedImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-600 rounded-full transition-all shadow-lg shadow-indigo-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`}
  >
    {icon}
    <span className="hidden md:block font-medium">{label}</span>
  </button>
);

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const PlannerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FlashcardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const TimerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default App;
