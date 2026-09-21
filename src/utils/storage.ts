import { Note } from '../types';

const NOTES_STORAGE_KEY = 'simple_notepad_notes_v4';

export const DEFAULT_INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '',
    content: '',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return DEFAULT_INITIAL_NOTES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INITIAL_NOTES;
  } catch (err) {
    console.error('Failed to load notes', err);
    return DEFAULT_INITIAL_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes', err);
  }
}

export function downloadSingleNoteAsTxt(note: Note): void {
  let text = `${note.title || 'Untitled Note'}\n`;
  text += `Date: ${new Date(note.updatedAt).toLocaleString()}\n`;
  text += `${'='.repeat(35)}\n\n`;
  text += `${note.content}\n\n`;

  if (note.checklists && note.checklists.length > 0) {
    text += `Checklist:\n`;
    note.checklists.forEach(item => {
      text += `[${item.done ? 'X' : ' '}] ${item.text}\n`;
    });
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (note.title || 'notepad_note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.download = `${safeTitle}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportNotesBackup(notes: Note[]): void {
  const data = {
    app: 'Simple Notepad',
    exportedAt: new Date().toISOString(),
    notes
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notepad_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
