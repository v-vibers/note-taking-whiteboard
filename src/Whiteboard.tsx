import { useState, useRef, useEffect } from 'react';
import './Whiteboard.css';

interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#ffd54f', '#81c784', '#64b5f6', '#e57373', '#ba68c8', '#ffb74d'];
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

function Whiteboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

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

  const handleZoom = (delta: number) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom + delta;
      return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      handleZoom(delta);
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoom(ZOOM_STEP);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoom(-ZOOM_STEP);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="whiteboard"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      ref={boardRef}
    >
      <div className="toolbar">
        <h1>Whiteboard Notes</h1>
        <div className="toolbar-controls">
          <div className="zoom-controls">
            <button
              onClick={() => handleZoom(-ZOOM_STEP)}
              className="zoom-btn"
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              title="Zoom out (Ctrl + -)"
            >
              −
            </button>
            <span className="zoom-level" title="Current zoom level">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(ZOOM_STEP)}
              className="zoom-btn"
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              title="Zoom in (Ctrl + +)"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="zoom-reset-btn"
              aria-label="Reset zoom"
              title="Reset zoom (Ctrl + 0)"
            >
              Reset
            </button>
          </div>
          <button onClick={addNote} className="add-note-btn">
            + Add Note
          </button>
        </div>
      </div>

      <div
        className="board-content"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
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
    </div>
  );
}

export default Whiteboard;