
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface Props {
  cards: Flashcard[];
}

const FlashcardViewer: React.FC<Props> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="text-center p-12 text-gray-400">
        No flashcards generated yet. Ask Lumina to create some for you!
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-lg font-medium text-indigo-300">Flashcard Mastery</h3>
        <span className="text-sm bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-300">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div 
        className="relative w-full aspect-[16/10] cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 transition-all preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}>
          {/* Front */}
          <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center p-12 text-center text-2xl font-semibold backface-hidden shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
            {cards[currentIndex].question}
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/40 rounded-3xl flex items-center justify-center p-12 text-center text-xl backface-hidden rotate-y-180 shadow-indigo-500/10 shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            {cards[currentIndex].answer}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-6">
        <button onClick={handlePrev} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={handleNext} className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all shadow-lg shadow-indigo-500/20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      
      <p className="text-center text-sm text-gray-500">Click card to flip</p>
    </div>
  );
};

export default FlashcardViewer;
