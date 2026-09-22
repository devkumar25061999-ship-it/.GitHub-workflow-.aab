import React, { useRef, useEffect, useState } from 'react';
import { Note, QuizQuestion } from '../types';
import { ArrowLeft, Trash2, Pin, Download, Plus, CheckCircle2, FileText, Sparkles, Languages } from 'lucide-react';
import { downloadQuizAsPdf } from '../utils/pdfExport';
import { LanguageCode, getTranslation, offlineTransliterate } from '../utils/translations';

interface QuizRichInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  darkMode: boolean;
  className: string;
  minHeightClass?: string;
}

function QuizRichInput({
  value,
  onChange,
  placeholder,
  darkMode,
  className,
  minHeightClass = 'min-h-[56px]'
}: QuizRichInputProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Sync initial content to contentEditable without resetting cursor positioning
  useEffect(() => {
    if (inputRef.current && inputRef.current.innerHTML !== value) {
      inputRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (inputRef.current) {
      onChange(inputRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, argValue: string | undefined = undefined) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    document.execCommand(command, false, argValue);
    handleInput();
  };

  const colors = darkMode ? [
    { name: 'White', value: '#ffffff' },
    { name: 'Gray', value: '#d1d5db' },
    { name: 'Red', value: '#f87171' },
    { name: 'Blue', value: '#60a5fa' },
    { name: 'Green', value: '#4ade80' },
    { name: 'Yellow', value: '#fde047' }
  ] : [
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#4b5563' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Orange', value: '#ea580c' }
  ];

  return (
    <div className={`relative group w-full flex flex-col border rounded-xl overflow-hidden transition ${
      isFocused 
        ? (darkMode ? 'border-neutral-500 ring-1 ring-neutral-500 bg-neutral-800' : 'border-neutral-900 ring-1 ring-neutral-900 bg-white')
        : (darkMode ? 'bg-neutral-800/80 border-neutral-700' : 'bg-neutral-50 border-neutral-200')
    }`}>
      {/* Inline formatting toolbar positioned as a clean header */}
      {isFocused && (
        <div 
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 border-b select-none ${
            darkMode ? 'bg-neutral-850 border-neutral-700' : 'bg-neutral-100 border-neutral-200'
          }`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Bold Button */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg font-black hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs cursor-pointer ${
              darkMode ? 'text-white' : 'text-neutral-800'
            }`}
            title="Bold"
          >
            B
          </button>

          {/* Italic Button */}
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg italic hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs cursor-pointer ${
              darkMode ? 'text-white' : 'text-neutral-800'
            }`}
            title="Italic"
          >
            I
          </button>

          {/* Text Color Swatches Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs flex-col cursor-pointer ${
                darkMode ? 'text-white' : 'text-neutral-800'
              }`}
              title="Text Color"
            >
              <span className="font-bold underline" style={{ textDecorationColor: 'red' }}>A</span>
            </button>

            {showColorPicker && (
              <div 
                className={`absolute left-0 top-8 z-30 flex items-center space-x-1 p-1.5 rounded-lg shadow-xl border ${
                  darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-150'
                }`}
                onMouseDown={(e) => e.preventDefault()}
              >
                {colors.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => {
                      executeCommand('foreColor', col.value);
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-neutral-300 hover:scale-110 active:scale-95 transition cursor-pointer"
                    style={{ backgroundColor: col.value }}
                    title={col.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* The rich-text editable surface */}
      <div className="relative w-full">
        <div
          ref={inputRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setShowColorPicker(false);
            }, 150);
          }}
          className={`w-full outline-none transition px-3.5 py-2 text-sm sm:text-base font-semibold cursor-text bg-transparent ${minHeightClass} ${className}`}
        />

        {/* Styled Placeholder (only visible when value is empty) */}
        {!value && !isFocused && (
          <div className="absolute top-2 left-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none text-xs sm:text-sm font-medium">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

interface QuizEditorProps {
  note: Note;
  darkMode?: boolean;
  language?: LanguageCode;
  onUpdateNote: (updated: Note) => void;
  onBack: () => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export default function QuizEditor({
  note,
  darkMode = false,
  language = 'hi',
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
      alert(getTranslation(language, 'maxQuestionsReached'));
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

  // 100% Offline Script Transliterate Quiz Questions
  const handleOfflineTranslateQuiz = () => {
    if (language === 'hi' || language === 'en') return;

    const convertedTitle = offlineTransliterate(note.title, language);
    const convertedQuestions = questions.map(q => ({
      ...q,
      question: offlineTransliterate(q.question, language),
      optionA: offlineTransliterate(q.optionA, language),
      optionB: offlineTransliterate(q.optionB, language),
      optionC: offlineTransliterate(q.optionC, language),
      optionD: offlineTransliterate(q.optionD, language),
      explanation: offlineTransliterate(q.explanation, language),
    }));

    onUpdateNote({
      ...note,
      title: convertedTitle,
      questions: convertedQuestions,
      updatedAt: new Date().toISOString()
    });
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadQuizAsPdf(note.title, questions);
    } catch (err) {
      console.error('[Quiz PDF Download Error]', err);
    } finally {
      setIsDownloading(false);
    }
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
          title={getTranslation(language, 'back')}
          aria-label={getTranslation(language, 'back')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation(language, 'allSavedNotes')}</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Offline Script Transliterate Button */}
          {(language === 'pa' || language === 'ur' || language === 'sa') && (
            <button
              onClick={handleOfflineTranslateQuiz}
              className={`min-h-[40px] px-3 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer border ${
                darkMode 
                  ? 'bg-sky-950/60 text-sky-300 hover:bg-sky-900 border-sky-800' 
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200'
              }`}
              title={getTranslation(language, 'offlineTranslate')}
            >
              <Languages className="w-4 h-4 text-sky-500" />
              <span className="hidden sm:inline">{getTranslation(language, 'translateContent')}</span>
            </button>
          )}

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className={`min-h-[40px] px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed transition cursor-pointer ${
              darkMode ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
            }`}
            title={isDownloading ? getTranslation(language, 'downloading') : getTranslation(language, 'downloadPdf')}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
            <span>{isDownloading ? getTranslation(language, 'downloading') : getTranslation(language, 'downloadPdf')}</span>
          </button>

          {/* Pin Toggle Button */}
          <button
            onClick={() => onTogglePin(note.id)}
            className={`min-h-[40px] px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              note.isPinned 
                ? (darkMode ? 'bg-neutral-700 text-white font-bold' : 'bg-neutral-200 text-black font-bold')
                : (darkMode ? 'bg-neutral-850 text-neutral-300 hover:text-white hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-700 hover:text-black hover:bg-neutral-200')
            }`}
            title={note.isPinned ? getTranslation(language, 'unpin') : getTranslation(language, 'pin')}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? (darkMode ? 'fill-white' : 'fill-black') : ''}`} />
            <span className="hidden sm:inline">{note.isPinned ? getTranslation(language, 'pinnedLabel') : getTranslation(language, 'pin')}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (window.confirm(getTranslation(language, 'deleteConfirmQuiz'))) {
                onDeleteNote(note.id);
              }
            }}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              darkMode ? 'hover:bg-neutral-800 text-neutral-400 hover:text-red-400' : 'hover:bg-neutral-100 text-neutral-400 hover:text-red-600'
            }`}
            title={getTranslation(language, 'deleteQuiz')}
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
            {questions.length} / 100 {getTranslation(language, 'questions')}
          </span>
        </div>

        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder={getTranslation(language, 'quizTitlePlaceholder')}
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
              
              <QuizRichInput
                value={q.question}
                onChange={(val) => handleUpdateQuestion(qIndex, { question: val })}
                placeholder={getTranslation(language, 'enterQuestionPlaceholder')}
                darkMode={darkMode}
                className={darkMode ? 'text-white' : 'text-black'}
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
                {getTranslation(language, 'options')}
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
                    placeholder={getTranslation(language, 'optionA')}
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
                    placeholder={getTranslation(language, 'optionB')}
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
                    placeholder={getTranslation(language, 'optionC')}
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
                    placeholder={getTranslation(language, 'optionD')}
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
                  {getTranslation(language, 'correctAnswer')}
                </span>
                {q.correctAnswer ? (
                  <span className="text-xs font-black text-green-500 bg-green-950/60 px-2 py-0.5 rounded border border-green-800">
                    Option ({q.correctAnswer})
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500 italic">{getTranslation(language, 'selectCorrectOption')}</span>
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
                    title={`${getTranslation(language, 'markCorrect')} (${opt})`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Explanation */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {getTranslation(language, 'explanation')}
              </span>
              <QuizRichInput
                value={q.explanation}
                onChange={(val) => handleUpdateQuestion(qIndex, { explanation: val })}
                placeholder={getTranslation(language, 'explanationPlaceholder')}
                darkMode={darkMode}
                className={darkMode ? 'text-neutral-200' : 'text-neutral-800'}
                minHeightClass="min-h-[48px]"
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
            <span>{getTranslation(language, 'addQuestion')} ({questions.length + 1})</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleBulkAddQuestions(5)}
              disabled={questions.length >= 100}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                darkMode ? 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              {getTranslation(language, 'bulkAdd5')}
            </button>
            <button
              onClick={() => handleBulkAddQuestions(10)}
              disabled={questions.length >= 100}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                darkMode ? 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              {getTranslation(language, 'bulkAdd10')}
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
              <h4 className={`font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-black'}`}>
                {getTranslation(language, 'a4TwoColPdf')}
              </h4>
              <p className="text-xs text-neutral-400">
                {getTranslation(language, 'a4TwoColDesc')}
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
            <span>{getTranslation(language, 'downloadPdf')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
