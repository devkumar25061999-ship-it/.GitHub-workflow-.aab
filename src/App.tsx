import React, { useState, useEffect, useMemo } from 'react';
import { Note } from './types';
import { 
  loadNotes, 
  saveNotes
} from './utils/storage';
import NotepadHeader from './components/NotepadHeader';
import NotepadFooter from './components/NotepadFooter';
import NotepadEditor from './components/NotepadEditor';
import QuizEditor from './components/QuizEditor';
import NotepadListView from './components/NotepadListView';
import AppIconModal from './components/AppIconModal';
import { Plus, Check, FileText, Sparkles, X, Bell, Volume2 } from 'lucide-react';
import { LanguageCode, getTranslation } from './utils/translations';
import { initNotifications, triggerTestNotification, scheduleHourlyAlerts } from './utils/notifications';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    const initialNotes = loadNotes();
    return initialNotes.length > 0 ? initialNotes[0].id : '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Language state (persists across sessions)
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('notepad_language');
    if (saved === 'hi' || saved === 'pa' || saved === 'ur' || saved === 'sa' || saved === 'en') {
      return saved as LanguageCode;
    }
    return 'hi'; // Default friendly language
  });

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  // Theme state: persists across sessions
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('notepad_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Default to 'list' view so saved notes are always shown on screen, or 'editor' when clicking a note
  const [viewMode, setViewMode] = useState<'editor' | 'list'>('list');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Speed dial menu state (like Google Keep)
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Sync to localStorage immediately
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Sync language to localStorage
  useEffect(() => {
    localStorage.setItem('notepad_language', language);
  }, [language]);

  // Initialize offline local notifications on startup
  useEffect(() => {
    initNotifications();
  }, []);

  // Sync theme to localStorage and documentElement
  useEffect(() => {
    localStorage.setItem('notepad_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      showToast(next ? 'Dark Theme' : 'Light Theme');
      return next;
    });
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    showToast(
      newLang === 'hi' ? 'भाषा: हिन्दी' :
      newLang === 'pa' ? 'ਭਾਸ਼ਾ: ਪੰਜਾਬੀ' :
      newLang === 'ur' ? 'زبان: اردو' :
      newLang === 'sa' ? 'भाषा: संस्कृतम्' :
      'Language: English'
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Create a new simple Keep-style text note
  const handleCreateTextNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      type: 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false
    };

    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setViewMode('editor');
    setIsFabOpen(false);
    setSearchQuery('');
    showToast(getTranslation(language, 'toastNoteCreated'));
  };

  // Create a new 100 MCQ Quiz note
  const handleCreateQuizNote = () => {
    const newQuiz: Note = {
      id: `quiz-${Date.now()}`,
      title: '',
      content: '',
      type: 'quiz',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          question: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: '',
          explanation: ''
        }
      ]
    };

    setNotes(prev => [newQuiz, ...prev]);
    setActiveNoteId(newQuiz.id);
    setViewMode('editor');
    setIsFabOpen(false);
    setSearchQuery('');
    showToast(getTranslation(language, 'toastQuizCreated'));
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => {
      const remaining = prev.filter(n => n.id !== id);
      if (activeNoteId === id) {
        if (remaining.length > 0) {
          setActiveNoteId(remaining[0].id);
        } else {
          setActiveNoteId('');
        }
      }
      return remaining;
    });
    showToast(getTranslation(language, 'toastDeleted'));
  };

  const handleTogglePin = (id: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        const nextPin = !n.isPinned;
        showToast(nextPin ? getTranslation(language, 'pin') : getTranslation(language, 'unpin'));
        return { ...n, isPinned: nextPin, updatedAt: new Date().toISOString() };
      }
      return n;
    }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (viewMode === 'editor' && query.trim().length > 0) {
      setViewMode('list');
    }
  };

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.questions?.some(item => 
          item.question.toLowerCase().includes(q) ||
          item.optionA.toLowerCase().includes(q) ||
          item.optionB.toLowerCase().includes(q) ||
          item.optionC.toLowerCase().includes(q) ||
          item.optionD.toLowerCase().includes(q) ||
          item.explanation.toLowerCase().includes(q)
        )
      );
    }

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [notes, searchQuery]);

  return (
    <div className={`min-h-screen flex flex-col antialiased relative transition-colors duration-200 ${
      darkMode 
        ? 'bg-neutral-950 text-white selection:bg-white selection:text-black' 
        : 'bg-white text-black selection:bg-black selection:text-white'
    }`}>
      
      {/* Top Header: App Icon, App Name, Language Switcher, Search Bar, and Theme Toggle */}
      <NotepadHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenIconModal={() => setIsIconModalOpen(true)}
        onTitleClick={() => {
          setViewMode('list');
          setSearchQuery('');
        }}
      />

      {/* Main Area: Saved Notes List, Text Note Editor, or Quiz Editor */}
      <main className="flex-1 w-full mx-auto">
        {viewMode === 'editor' && activeNote && !searchQuery ? (
          activeNote.type === 'quiz' ? (
            <QuizEditor
              note={activeNote}
              darkMode={darkMode}
              language={language}
              onUpdateNote={handleUpdateNote}
              onBack={() => setViewMode('list')}
              onDeleteNote={handleDeleteNote}
              onTogglePin={(id) => handleTogglePin(id)}
            />
          ) : (
            <NotepadEditor
              note={activeNote}
              darkMode={darkMode}
              language={language}
              onUpdateNote={handleUpdateNote}
              onBack={() => setViewMode('list')}
              onDeleteNote={handleDeleteNote}
              onTogglePin={(id) => handleTogglePin(id)}
            />
          )
        ) : (
          <NotepadListView
            notes={filteredNotes}
            searchQuery={searchQuery}
            activeNoteId={activeNoteId}
            darkMode={darkMode}
            language={language}
            onSelectNote={(selected) => {
              setActiveNoteId(selected.id);
              setViewMode('editor');
              setSearchQuery('');
            }}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onClearSearch={() => {
              setSearchQuery('');
              setViewMode('list');
            }}
          />
        )}
      </main>

      {/* Subtle Light/Dark Footer */}
      <NotepadFooter
        darkMode={darkMode}
        language={language}
      />

      {/* App Icon Modal (Preview & Download B&W Icon for Google Play / Android) */}
      <AppIconModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        darkMode={darkMode}
      />

      {/* Backdrop when Speed Dial FAB is open */}
      {isFabOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* Google Keep Style Expandable Floating Action Button (FAB) */}
      <div className="fixed safe-bottom-btn right-4 sm:right-6 md:right-8 z-40 flex flex-col items-end space-y-3">
        {/* Expanded Options */}
        {isFabOpen && (
          <div className="flex flex-col items-end space-y-2.5 mb-1 animate-in slide-in-from-bottom-3 fade-in duration-200">
            {/* Option 1: MCQ Quiz Maker (100 Qs + PDF) */}
            <button
              onClick={handleCreateQuizNote}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl shadow-xl active:scale-95 transition-all cursor-pointer border group ${
                darkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                  : 'bg-white border-neutral-200 text-black hover:bg-neutral-50'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold">{getTranslation(language, 'newQuiz')}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                darkMode ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
            </button>

            {/* Option 2: Standard Notepad Note */}
            <button
              onClick={handleCreateTextNote}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl shadow-xl active:scale-95 transition-all cursor-pointer border group ${
                darkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                  : 'bg-white border-neutral-200 text-black hover:bg-neutral-50'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold">{getTranslation(language, 'newNote')}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                darkMode ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        {/* Primary Toggle (+) Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none ${
            darkMode 
              ? (isFabOpen ? 'bg-neutral-800 text-white rotate-45' : 'bg-white text-black ring-4 ring-neutral-800')
              : (isFabOpen ? 'bg-neutral-900 text-white rotate-45' : 'bg-black text-white ring-4 ring-neutral-200')
          }`}
          title={isFabOpen ? 'Close Menu' : 'Create Note or Quiz (+)'}
          aria-label="Create New"
        >
          {isFabOpen ? (
            <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          ) : (
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed safe-bottom-btn left-4 sm:left-6 z-50 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150 border ${
          darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-black border-neutral-900 text-white'
        }`}>
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
