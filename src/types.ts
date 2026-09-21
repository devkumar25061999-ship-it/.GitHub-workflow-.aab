export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D' | '';
  explanation: string;
}

export type NoteType = 'text' | 'quiz';

export interface Note {
  id: string;
  type?: NoteType; // 'text' (standard notepad) or 'quiz' (MCQ quiz paper)
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  checklists?: NoteChecklistItem[];
  questions?: QuizQuestion[];
}

export type SortOption = 'updated_desc' | 'created_desc' | 'title_asc';
