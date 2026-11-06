import React, { useState, useEffect } from 'react';
import { 
  ListTodo, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Tag, 
  FileText, 
  Pin, 
  Search, 
  Filter, 
  Check, 
  AlertCircle,
  Sparkles,
  Save,
  CheckSquare
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { crmApi, subscribeCrmEvents } from '../services/api';

export default function ToDoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active view: 'todos' or 'notes'
  const [activeTab, setActiveTab] = useState('todos');

  // New ToDo form
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Advisory');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().slice(0, 10));

  // Filters
  const [todoFilter, setTodoFilter] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');

  // New Note state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#eff6ff');

  useEffect(() => {
    loadData();

    const unsubscribe = subscribeCrmEvents((event) => {
      if (event.module === 'ToDo' || event.type === 'DATA_CHANGED') {
        loadData();
      }
    });

    return () => unsubscribe();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [todosData, notesData] = await Promise.all([
        crmApi.call('getToDos', { userEmail: user?.email }),
        crmApi.call('getPersonalNotes', { userEmail: user?.email })
      ]);
      if (Array.isArray(todosData)) setTodos(todosData);
      if (Array.isArray(notesData)) setNotes(notesData);
    } catch (e) {
      console.warn('Failed to load ToDos/Notes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      Title: newTitle.trim(),
      Priority: newPriority,
      Category: newCategory,
      DueDate: newDueDate,
      IsCompleted: false,
      UserEmail: user?.email || 'admin@srinvestments.com',
      userEmail: user?.email
    };

    try {
      await crmApi.call('saveToDo', payload);
      setNewTitle('');
      loadData();
    } catch (err) {
      alert('Failed to add To-Do.');
    }
  };

  const handleToggleComplete = async (todo) => {
    const updated = {
      ...todo,
      IsCompleted: !todo.IsCompleted,
      userEmail: user?.email
    };

    // Optimistic update
    setTodos(prev => prev.map(t => t.TodoId === todo.TodoId ? updated : t));

    try {
      await crmApi.call('saveToDo', updated);
    } catch (err) {
      loadData();
    }
  };

  const handleDeleteToDo = async (todoId) => {
    try {
      await crmApi.call('deleteToDo', { todoId, userEmail: user?.email });
      setTodos(prev => prev.filter(t => t.TodoId !== todoId));
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const handleSaveNewNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const newNote = {
      id: 'note_' + Date.now(),
      userEmail: user?.email,
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
      color: noteColor,
      pinned: false,
      updatedAt: new Date().toISOString()
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setIsAddingNote(false);
    setNoteTitle('');
    setNoteContent('');

    try {
      await crmApi.call('savePersonalNotes', { notes: updated });
    } catch (err) {}
  };

  const handleDeleteNote = async (noteId) => {
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    try {
      await crmApi.call('savePersonalNotes', { notes: updated });
    } catch (err) {}
  };

  const handleTogglePinNote = async (noteId) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n);
    setNotes(updated);
    try {
      await crmApi.call('savePersonalNotes', { notes: updated });
    } catch (err) {}
  };

  // Filtered ToDos
  const filteredTodos = todos.filter(t => {
    if (todoFilter === 'pending' && t.IsCompleted) return false;
    if (todoFilter === 'completed' && !t.IsCompleted) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.Title?.toLowerCase().includes(q);
      const matchCat = t.Category?.toLowerCase().includes(q);
      const matchNotes = t.Notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchNotes) return false;
    }
    return true;
  });

  const completedCount = todos.filter(t => t.IsCompleted).length;
  const progressPercent = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Personal Workspace: To-Do & Daily Notes" 
        subtitle="Manage your daily checklists, investor follow-ups & operational reminders"
        onRefresh={loadData}
        refreshing={loading}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem 2rem', overflowY: 'auto' }}>
        {/* Workspace Mode Tabs & Progress */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('todos')}
              style={{
                padding: '0.65rem 1.15rem',
                border: 'none',
                background: 'transparent',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: activeTab === 'todos' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'todos' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <CheckSquare size={16} /> Daily Task Checklist ({todos.length})
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              style={{
                padding: '0.65rem 1.15rem',
                border: 'none',
                background: 'transparent',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: activeTab === 'notes' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'notes' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <FileText size={16} /> Scratchpad & Notes ({notes.length})
            </button>
          </div>

          {/* Daily Progress Tracker */}
          {activeTab === 'todos' && todos.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                Completed {completedCount} of {todos.length} ({progressPercent}%)
              </span>
              <div style={{ width: '120px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: DAILY TO-DO LIST */}
        {activeTab === 'todos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px' }}>
            {/* Quick Add Bar */}
            <form onSubmit={handleAddToDo} style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                placeholder="Add a new to-do task (e.g. Call client for SIP renewal, verify CKYC...)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.875rem',
                  padding: '0.35rem 0.5rem'
                }}
              />

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.775rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.775rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc'
                }}
              >
                <option value="Advisory">Advisory</option>
                <option value="KYC Verification">KYC</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Compliance">Compliance</option>
                <option value="Operations">Operations</option>
              </select>

              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.775rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc'
                }}
              />

              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={14} /> Add
              </button>
            </form>

            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['all', 'pending', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTodoFilter(f)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: todoFilter === f ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: todoFilter === f ? '#eff6ff' : '#ffffff',
                      color: todoFilter === f ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.35rem 0.6rem 0.35rem 1.8rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredTodos.length === 0 ? (
                <div style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  color: '#94a3b8'
                }}>
                  <ListTodo size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>No tasks found in this view.</p>
                </div>
              ) : (
                filteredTodos.map((t) => (
                  <div
                    key={t.TodoId}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <button
                        onClick={() => handleToggleComplete(t)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: t.IsCompleted ? '#10b981' : '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {t.IsCompleted ? <CheckCircle2 size={20} color="#10b981" /> : <Circle size={20} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: t.IsCompleted ? '#94a3b8' : '#0f172a',
                          textDecoration: t.IsCompleted ? 'line-through' : 'none'
                        }}>
                          {t.Title}
                        </div>
                        {t.Notes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {t.Notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{
                        fontSize: '0.675rem',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe'
                      }}>
                        {t.Category}
                      </span>

                      <span style={{
                        fontSize: '0.675rem',
                        fontWeight: '600',
                        color: t.Priority === 'Urgent' ? '#b91c1c' : (t.Priority === 'High' ? '#c2410c' : '#64748b')
                      }}>
                        {t.Priority}
                      </span>

                      {t.DueDate && (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> {t.DueDate}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteToDo(t.TodoId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SCRATCHPAD & NOTES */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Keep your scratch notes, compliance checklists, phone call summaries, and private thoughts here.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddingNote(!isAddingNote)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} /> Add Note
              </button>
            </div>

            {/* Note Composer */}
            {isAddingNote && (
              <form onSubmit={handleSaveNewNote} style={{
                backgroundColor: noteColor,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxWidth: '600px'
              }}>
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    padding: '0.35rem 0',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />

                <textarea
                  rows={4}
                  placeholder="Type your notes or bullet points..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {['#eff6ff', '#f0fdf4', '#fefce8', '#fdf2f8'].map((c) => (
                      <span
                        key={c}
                        onClick={() => setNoteColor(c)}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: noteColor === c ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingNote(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save Note
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Notes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    backgroundColor: n.color || '#eff6ff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                        {n.title}
                      </span>
                      <button
                        onClick={() => handleTogglePinNote(n.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: n.pinned ? '#2563eb' : '#94a3b8', padding: 0 }}
                        title={n.pinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                      {n.content}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                      {new Date(n.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
