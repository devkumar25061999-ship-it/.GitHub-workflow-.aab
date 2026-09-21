import React from 'react';
import { Note, QuizQuestion } from '../types';
import { ArrowLeft, Trash2, Pin, Download, Plus, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { downloadQuizAsPdf } from '../utils/pdfExport';

interface QuizEditorProps {
  note: Note;
  darkMode?: boolean;
  onUpdateNote: (updated: Note) => void;
  onBack: () => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export default function QuizEditor({
  note,
  darkMode = false,
  onUpdateNote,
  onBack,
  onDeleteNote,
  onTogglePin
}: QuizEditorProps) {
  const questions: QuizQuestion[] = note.questions && note.questions.length > 0 ? note.questions : [
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
  ];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNote({
      ...note,
      title: e.target.value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateQuestion = (index: number, updatedFields: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updatedFields };
    onUpdateNote({
      ...note,
      questions: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddQuestion = () => {
    if (questions.length >= 100) {
      alert('Maximum 100 questions per quiz reached.');
      return;
    }
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: ''
    };
    onUpdateNote({
      ...note,
      questions: [...questions, newQ],
      updatedAt: new Date().toISOString()
    });
  };

  const handleBulkAddQuestions = (count: number) => {
    const remaining = 100 - questions.length;
    const toAdd = Math.min(count, remaining);
    if (toAdd <= 0) return;

    const newItems: QuizQuestion[] = [];
    for (let i = 0; i < toAdd; i++) {
      newItems.push({
        id: `q-${Date.now()}-${questions.length + i + 1}`,
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        explanation: ''
      });
    }

    onUpdateNote({
      ...note,
      questions: [...questions, ...newItems],
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      handleUpdateQuestion(0, {
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        explanation: ''
      });
      return;
    }
    const filtered = questions.filter((_, i) => i !== index);
    onUpdateNote({
      ...note,
      questions: filtered,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDownloadPdf = () => {
    downloadQuizAsPdf(note.title, questions);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-8 md:px-12 safe-bottom-pad">
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b ${
        darkMode ? 'border-neutral-800' : 'border-neutral-200'
      }`}>
        <button
          onClick={onBack}
          className={`min-h-[44px] -ml-2 px-3 rounded-lg flex items-center space-x-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
            darkMode 
              ? 'text-neutral-300 hover:text-white hover:bg-neutral-800 active:bg-neutral-700' 
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100 active:bg-neutral-200'
          }`}
          title="Back to All Notes"
          aria-label="Back to All Notes"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Saved Notes</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className={`min-h-[40px] px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md active:scale-95 transition cursor-pointer ${
              darkMode ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
            }`}
            title="Download 2-Column A4 PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* Pin Toggle Button */}
          <button
            onClick={() => onTogglePin(note.id)}
            className={`min-h-[40px] px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              note.isPinned 
                ? (darkMode ? 'bg-neutral-700 text-white font-bold' : 'bg-neutral-200 text-black font-bold')
                : (darkMode ? 'bg-neutral-850 text-neutral-300 hover:text-white hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-700 hover:text-black hover:bg-neutral-200')
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? (darkMode ? 'fill-white' : 'fill-black') : ''}`} />
            <span className="hidden sm:inline">{note.isPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (window.confirm('Delete this quiz?')) {
                onDeleteNote(note.id);
              }
            }}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              darkMode ? 'hover:bg-neutral-800 text-neutral-400 hover:text-red-400' : 'hover:bg-neutral-100 text-neutral-400 hover:text-red-600'
            }`}
            title="Delete Quiz"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quiz Title & Header Banner */}
      <div className={`space-y-2 pb-4 mb-4 border-b ${darkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider ${
            darkMode ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            <Sparkles className="w-3 h-3" />
            <span>MCQ Quiz Format</span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-neutral-400">
            {questions.length} / 100 Questions
          </span>
        </div>

        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Quiz / Test Paper Title (e.g. 100 Science Mock Test)"
          className={`w-full bg-transparent font-black text-2xl sm:text-3xl md:text-4xl focus:outline-none tracking-tight pt-1 ${
            darkMode ? 'text-white placeholder-neutral-600' : 'text-black placeholder-neutral-300'
          }`}
          autoFocus
        />
      </div>

      {/* Questions List (Up to 100 questions) */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div 
            key={q.id || `q-${qIndex}`}
            className={`border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 transition ${
              darkMode ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {/* 1. Question Text */}
            <div className="flex items-start justify-between gap-3">
              <span className={`font-black text-base sm:text-lg shrink-0 pt-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                Q.{qIndex + 1}
              </span>
              
              <textarea
                value={q.question}
                onChange={(e) => handleUpdateQuestion(qIndex, { question: e.target.value })}
                placeholder="Enter question text..."
                rows={2}
                className={`flex-1 border rounded-xl px-3.5 py-2 text-sm sm:text-base font-semibold focus:outline-none transition resize-none ${
                  darkMode 
                    ? 'bg-neutral-800/80 border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:ring-1.5 focus:ring-white' 
                    : 'bg-neutral-50 border-neutral-200 text-black placeholder-neutral-400 focus:bg-white focus:ring-1.5 focus:ring-black'
                }`}
              />

              <button
                onClick={() => handleDeleteQuestion(qIndex)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  darkMode ? 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800' : 'text-neutral-300 hover:text-red-600 hover:bg-neutral-100'
                }`}
                title={`Delete Question ${qIndex + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Options A, B, C, D */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Options
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option A */}
                <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 ${
                  darkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-neutral-200'
                }`}>
                  <span className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    A
                  </span>
                  <input
                    type="text"
                    value={q.optionA}
                    onChange={(e) => handleUpdateQuestion(qIndex, { optionA: e.target.value })}
                    placeholder="Option A"
                    className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none ${
                      darkMode ? 'text-white placeholder-neutral-500' : 'text-black placeholder-neutral-400'
                    }`}
                  />
                </div>

                {/* Option B */}
                <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 ${
                  darkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-neutral-200'
                }`}>
                  <span className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    B
                  </span>
                  <input
                    type="text"
                    value={q.optionB}
                    onChange={(e) => handleUpdateQuestion(qIndex, { optionB: e.target.value })}
                    placeholder="Option B"
                    className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none ${
                      darkMode ? 'text-white placeholder-neutral-500' : 'text-black placeholder-neutral-400'
                    }`}
                  />
                </div>

                {/* Option C */}
                <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 ${
                  darkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-neutral-200'
                }`}>
                  <span className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    C
                  </span>
                  <input
                    type="text"
                    value={q.optionC}
                    onChange={(e) => handleUpdateQuestion(qIndex, { optionC: e.target.value })}
                    placeholder="Option C"
                    className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none ${
                      darkMode ? 'text-white placeholder-neutral-500' : 'text-black placeholder-neutral-400'
                    }`}
                  />
                </div>

                {/* Option D */}
                <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 ${
                  darkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-neutral-200'
                }`}>
                  <span className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    D
                  </span>
                  <input
                    type="text"
                    value={q.optionD}
                    onChange={(e) => handleUpdateQuestion(qIndex, { optionD: e.target.value })}
                    placeholder="Option D"
                    className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none ${
                      darkMode ? 'text-white placeholder-neutral-500' : 'text-black placeholder-neutral-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 3. Correct Answer */}
            <div className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
              darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${darkMode ? 'text-neutral-400' : 'text-neutral-700'}`} />
                <span className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                  Correct Answer:
                </span>
                {q.correctAnswer ? (
                  <span className="text-xs font-black text-green-500 bg-green-950/60 px-2 py-0.5 rounded border border-green-800">
                    Option ({q.correctAnswer})
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500 italic">Select correct option</span>
                )}
              </div>

              {/* One-click Correct Option Selector: A, B, C, D */}
              <div className="flex items-center space-x-1.5">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleUpdateQuestion(qIndex, { correctAnswer: q.correctAnswer === opt ? '' : opt })}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      q.correctAnswer === opt
                        ? (darkMode ? 'bg-white text-black shadow-xs' : 'bg-black text-white shadow-xs')
                        : (darkMode ? 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-200')
                    }`}
                    title={`Mark Option ${opt} as Correct Answer`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Explanation */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Explanation
              </span>
              <textarea
                value={q.explanation}
                onChange={(e) => handleUpdateQuestion(qIndex, { explanation: e.target.value })}
                placeholder="Write explanation here (optional)..."
                rows={2}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none transition resize-none ${
                  darkMode 
                    ? 'bg-neutral-800/80 border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:bg-neutral-800 focus:ring-1.5 focus:ring-white' 
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:bg-white focus:ring-1.5 focus:ring-black'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Controls */}
      <div className={`mt-8 space-y-4 pt-4 border-t ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleAddQuestion}
            disabled={questions.length >= 100}
            className={`w-full sm:w-auto min-h-[48px] px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition cursor-pointer ${
              darkMode 
                ? 'bg-white hover:bg-neutral-200 text-black disabled:bg-neutral-800 disabled:text-neutral-600' 
                : 'bg-black hover:bg-neutral-800 text-white disabled:bg-neutral-300'
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Question {questions.length + 1} (Max 100)</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleBulkAddQuestions(5)}
              disabled={questions.length >= 100}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                darkMode ? 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              +5 Questions
            </button>
            <button
              onClick={() => handleBulkAddQuestions(10)}
              disabled={questions.length >= 100}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                darkMode ? 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              +10 Questions
            </button>
          </div>
        </div>

        {/* Big Bottom PDF Export Banner */}
        <div className={`rounded-2xl p-4 sm:p-6 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              darkMode ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-black'}`}>A4 Full-Page 2-Column PDF</h4>
              <p className="text-xs text-neutral-400">
                Left & Right columns optimize space so maximum questions fit on each A4 page.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            className={`w-full sm:w-auto min-h-[44px] px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md active:scale-95 transition cursor-pointer ${
              darkMode ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
