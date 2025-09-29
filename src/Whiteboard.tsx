import { useState } from 'react';
import './Whiteboard.css';

interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#ffd54f', '#81c784', '#64b5f6', '#e57373', '#ba68c8', '#ffb74d'];

function Whiteboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      x: Math.random() * (window.innerWidth - 250),
      y: Math.random() * (window.innerHeight - 250),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const updateNoteContent = (id: string, content: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, content } : note))
    );
  };

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    setDraggedNote(noteId);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote) return;

    setNotes(
      notes.map((note) =>
        note.id === draggedNote
          ? {
              ...note,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y,
            }
          : note
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
  };

  return (
    <div
      className="whiteboard"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="toolbar">
        <h1>Whiteboard Notes</h1>
        <button onClick={addNote} className="add-note-btn">
          + Add Note
        </button>
      </div>

      {notes.map((note) => (
        <div
          key={note.id}
          className="note"
          style={{
            left: `${note.x}px`,
            top: `${note.y}px`,
            backgroundColor: note.color,
          }}
        >
          <div
            className="note-header"
            onMouseDown={(e) => handleMouseDown(e, note.id)}
          >
            <button
              onClick={() => deleteNote(note.id)}
              className="delete-btn"
              aria-label="Delete note"
            >
              ×
            </button>
          </div>
          <textarea
            value={note.content}
            onChange={(e) => updateNoteContent(note.id, e.target.value)}
            placeholder="Write your note here..."
            className="note-textarea"
          />
        </div>
      ))}

      {notes.length === 0 && (
        <div className="empty-state">
          <p>No notes yet. Click "Add Note" to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Whiteboard;