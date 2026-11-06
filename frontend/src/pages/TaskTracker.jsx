import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MessageSquare, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Settings, 
  Send, 
  History,
  Shield,
  Layers,
  ArrowRight,
  MoreVertical,
  Check
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { crmApi, subscribeCrmEvents } from '../services/api';

export default function TaskTracker() {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.isSuperUser === true || user?.IsSuperUser === true || user?.email?.includes('admin');

  // Tasks & Columns State
  const [tasks, setTasks] = useState([]);
  const [stepConfig, setStepConfig] = useState([
    { index: 1, name: 'Step 1: NEW' },
    { index: 2, name: 'Step 2: IN PROGRESS' },
    { index: 3, name: 'Step 3: REVIEW / PENDING' },
    { index: 4, name: 'Step 4: VERIFICATION' },
    { index: 5, name: 'Step 5: COMPLETED' }
  ]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflowEditSteps, setWorkflowEditSteps] = useState([]);

  // Form State for Create/Edit
  const [taskForm, setTaskForm] = useState({
    TaskId: '',
    Title: '',
    Description: '',
    Priority: 'Medium',
    AssigneeEmail: '',
    AssigneeName: '',
    StepIndex: 1,
    DueDate: '',
    Tags: ''
  });

  // Comment input in Detail modal
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadAll();

    // Realtime sync across tabs/users without reload
    const unsubscribe = subscribeCrmEvents((event) => {
      if (event.module === 'Tasks' || event.type === 'DATA_CHANGED') {
        loadTasks();
        if (event.subType === 'CONFIG_CHANGED') {
          loadStepConfig();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTasks(), loadStepConfig(), loadEmployees()]);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await crmApi.call('getTasks');
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.warn('Failed to load tasks:', err);
    }
  };

  const loadStepConfig = async () => {
    try {
      const cfg = await crmApi.call('getTaskStepConfig');
      if (Array.isArray(cfg) && cfg.length === 5) {
        setStepConfig(cfg);
      }
    } catch (err) {
      console.warn('Failed to load task steps:', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const emps = await crmApi.call('getEmployees');
      if (Array.isArray(emps)) {
        setEmployees(emps);
      }
    } catch (err) {
      console.warn('Failed to load employees:', err);
    }
  };

  // Open Create Task Modal
  const handleOpenCreateModal = (stepIndex = 1) => {
    setTaskForm({
      TaskId: '',
      Title: '',
      Description: '',
      Priority: 'Medium',
      AssigneeEmail: user?.email || '',
      AssigneeName: user?.name || 'Self',
      StepIndex: stepIndex,
      DueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      Tags: 'Advisory, Followup'
    });
    setIsTaskModalOpen(true);
  };

  // Save Task
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.Title.trim()) return alert('Please enter a task title.');

    const stepObj = stepConfig.find(s => s.index === Number(taskForm.StepIndex)) || stepConfig[0];
    const assignee = employees.find(e => e.Email === taskForm.AssigneeEmail);

    const payload = {
      ...taskForm,
      StepName: stepObj.name,
      AssigneeName: assignee ? assignee.FullName : (taskForm.AssigneeEmail === user?.email ? user?.name : 'Staff Member'),
      ReporterEmail: user?.email || 'admin@srinvestments.com',
      ReporterName: user?.name || 'Administrator',
      userEmail: user?.email,
      userName: user?.name
    };

    try {
      await crmApi.call('saveTask', payload);
      setIsTaskModalOpen(false);
      loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to save task.');
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stepIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== stepIndex) {
      setDragOverColumn(stepIndex);
    }
  };

  const handleDragLeave = (e, stepIndex) => {
    if (dragOverColumn === stepIndex) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStepIndex) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find(t => t.TaskId === taskId);
    if (!task || task.StepIndex === targetStepIndex) return;

    const targetStep = stepConfig.find(s => s.index === targetStepIndex);
    if (!targetStep) return;

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.TaskId === taskId ? { ...t, StepIndex: targetStepIndex, StepName: targetStep.name } : t));

    try {
      await crmApi.call('updateTaskStatus', {
        taskId,
        stepIndex: targetStepIndex,
        stepName: targetStep.name,
        userEmail: user?.email,
        userName: user?.name
      });
      loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to transition task status.');
      loadTasks();
    }
  };

  // Open Task Detail Modal
  const handleViewTaskDetail = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    setNewComment('');
  };

  // Add Comment to Task
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    const comments = Array.isArray(selectedTask.Comments) ? [...selectedTask.Comments] : [];
    const commentObj = {
      id: 'comm_' + Date.now(),
      author: user?.name || user?.email || 'Staff',
      authorEmail: user?.email,
      timestamp: new Date().toISOString(),
      text: newComment.trim()
    };
    comments.push(commentObj);

    try {
      await crmApi.call('saveTask', {
        ...selectedTask,
        Comments: comments,
        userEmail: user?.email,
        userName: user?.name
      });
      setSelectedTask(prev => ({ ...prev, Comments: comments }));
      setNewComment('');
      loadTasks();
    } catch (err) {
      alert('Failed to post comment.');
    }
  };

  // Move Status from inside Detail modal
  const handleMoveStatusFromDetail = async (targetStepIndex) => {
    if (!selectedTask) return;
    const targetStep = stepConfig.find(s => s.index === targetStepIndex);
    if (!targetStep) return;

    try {
      await crmApi.call('updateTaskStatus', {
        taskId: selectedTask.TaskId,
        stepIndex: targetStepIndex,
        stepName: targetStep.name,
        userEmail: user?.email,
        userName: user?.name
      });
      setSelectedTask(prev => ({ ...prev, StepIndex: targetStepIndex, StepName: targetStep.name }));
      loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Soft Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!confirm(`Are you sure you want to soft-delete task ${taskId}? It will be preserved in compliance archives.`)) return;
    try {
      await crmApi.call('deleteTask', { taskId, userEmail: user?.email });
      setIsDetailModalOpen(false);
      loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  // Admin: Open Workflow Status Customizer
  const handleOpenWorkflowModal = () => {
    if (!isAdmin) {
      alert('Access Restricted: Only CRM Administrators or SuperUsers can customize the 5-step workflow labels.');
      return;
    }
    setWorkflowEditSteps([...stepConfig]);
    setIsWorkflowModalOpen(true);
  };

  // Admin: Save Customized Status Names
  const handleSaveWorkflowNames = async (e) => {
    e.preventDefault();
    try {
      await crmApi.call('saveTaskStepConfig', {
        steps: workflowEditSteps,
        userEmail: user?.email
      });
      setStepConfig([...workflowEditSteps]);
      setIsWorkflowModalOpen(false);
      alert('JIRA 5-step workflow statuses customized successfully!');
      loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to save workflow status labels.');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (assigneeFilter === 'me') {
      if (t.AssigneeEmail?.toLowerCase() !== user?.email?.toLowerCase()) return false;
    } else if (assigneeFilter !== 'all') {
      if (t.AssigneeEmail?.toLowerCase() !== assigneeFilter.toLowerCase()) return false;
    }

    if (priorityFilter !== 'all' && t.Priority !== priorityFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.Title?.toLowerCase().includes(q);
      const matchId = t.TaskId?.toLowerCase().includes(q);
      const matchDesc = t.Description?.toLowerCase().includes(q);
      const matchTags = t.Tags?.toLowerCase().includes(q);
      const matchAssignee = t.AssigneeName?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchDesc && !matchTags && !matchAssignee) return false;
    }

    return true;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
      case 'High':
        return { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' };
      case 'Medium':
        return { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
      case 'Low':
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Task Tracker (JIRA Kanban)" 
        subtitle="Agile task workflow, multi-staff assignment & audited progress trail" 
        onRefresh={loadAll}
        refreshing={loading}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem 2rem', overflow: 'hidden' }}>
        {/* Top Control Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '320px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search tasks, ID, tags, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.825rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
            >
              <option value="all">Assignee: All Staff</option>
              <option value="me">Assigned to Me ({user?.name || 'Self'})</option>
              {employees.map(e => (
                <option key={e.EmployeeId} value={e.Email}>
                  {e.FullName} ({e.EmployeeCode})
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.825rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
            >
              <option value="all">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isAdmin && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleOpenWorkflowModal}
                title="Customize names of the 5 fixed Kanban status steps (Admin Only)"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #cbd5e1' }}
              >
                <Settings size={14} color="#2563eb" />
                <span>Customize Status Names</span>
              </button>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenCreateModal(1)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* 5-Column JIRA Kanban Board */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          minHeight: '400px',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '0.5rem'
        }}>
          {stepConfig.map((col) => {
            const colTasks = filteredTasks.filter(t => t.StepIndex === col.index);
            const isHovered = dragOverColumn === col.index;

            return (
              <div
                key={col.index}
                onDragOver={(e) => handleDragOver(e, col.index)}
                onDragLeave={(e) => handleDragLeave(e, col.index)}
                onDrop={(e) => handleDrop(e, col.index)}
                style={{
                  backgroundColor: isHovered ? '#eff6ff' : '#f8fafc',
                  border: isHovered ? '2px dashed #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'background-color 0.15s ease, border 0.15s ease'
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '0.75rem 0.85rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: col.index === 5 ? '#10b981' : (col.index === 1 ? '#2563eb' : '#f59e0b')
                    }}></span>
                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0f172a' }}>
                      {col.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      border: '1px solid #bfdbfe'
                    }}>
                      {colTasks.length}
                    </span>
                    <button
                      onClick={() => handleOpenCreateModal(col.index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={`Add task in ${col.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div style={{
                  flex: 1,
                  padding: '0.75rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  {colTasks.length === 0 ? (
                    <div style={{
                      padding: '2rem 0.5rem',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '6px'
                    }}>
                      Drop task here
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const pStyle = getPriorityStyle(t.Priority);
                      const commentCount = Array.isArray(t.Comments) ? t.Comments.length : 0;
                      const isArchived = Boolean(t.IsDeleted);

                      return (
                        <div
                          key={t.TaskId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.TaskId)}
                          onClick={() => handleViewTaskDetail(t)}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: isArchived ? '1px dashed #fca5a5' : '1px solid #e2e8f0',
                            padding: '0.75rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            cursor: 'grab',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.45rem',
                            opacity: isArchived ? 0.7 : 1
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                        >
                          {/* Task ID & Priority */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>
                              {t.TaskId}
                            </span>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: '700',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: pStyle.bg,
                              color: pStyle.color,
                              border: `1px solid ${pStyle.border}`
                            }}>
                              {t.Priority}
                            </span>
                          </div>

                          {/* Title */}
                          <div style={{
                            fontSize: '0.825rem',
                            fontWeight: '600',
                            color: '#0f172a',
                            lineHeight: 1.35
                          }}>
                            {t.Title}
                          </div>

                          {/* Tags */}
                          {t.Tags && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {t.Tags.split(',').map((tg, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.625rem',
                                    color: '#475569',
                                    backgroundColor: '#f1f5f9',
                                    padding: '1px 5px',
                                    borderRadius: '3px'
                                  }}
                                >
                                  #{tg.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer: Assignee & Meta */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.35rem',
                            borderTop: '1px solid #f1f5f9',
                            marginTop: '2px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {(t.AssigneeName || 'S').slice(0, 1).toUpperCase()}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {t.AssigneeName || 'Unassigned'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.675rem', color: '#94a3b8' }}>
                              {commentCount > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <MessageSquare size={11} /> {commentCount}
                                </span>
                              )}
                              {t.DueDate && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <Clock size={11} /> {t.DueDate.slice(5)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          MODAL 1: CREATE / EDIT TASK
          ========================================== */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New CRM Task (JIRA)"
        maxWidth="600px"
      >
        <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Verify CKYC remediation for client"
              value={taskForm.Title}
              onChange={(e) => setTaskForm({ ...taskForm, Title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                Status Step
              </label>
              <select
                value={taskForm.StepIndex}
                onChange={(e) => setTaskForm({ ...taskForm, StepIndex: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              >
                {stepConfig.map(s => (
                  <option key={s.index} value={s.index}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                Priority
              </label>
              <select
                value={taskForm.Priority}
                onChange={(e) => setTaskForm({ ...taskForm, Priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                Assignee (Staff / Self)
              </label>
              <select
                value={taskForm.AssigneeEmail}
                onChange={(e) => setTaskForm({ ...taskForm, AssigneeEmail: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              >
                <option value={user?.email}>Assign to Me ({user?.name || 'Self'})</option>
                {employees.filter(e => e.Email !== user?.email).map(e => (
                  <option key={e.EmployeeId} value={e.Email}>
                    {e.FullName} ({e.EmployeeCode} - {e.Role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                Due Date
              </label>
              <input
                type="date"
                value={taskForm.DueDate}
                onChange={(e) => setTaskForm({ ...taskForm, DueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Tags / Category (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. KYC, AMFI, NRI, Customer Query"
              value={taskForm.Tags}
              onChange={(e) => setTaskForm({ ...taskForm, Tags: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Detailed Description & Requirements
            </label>
            <textarea
              rows={4}
              placeholder="Outline steps, folio details, document requirements..."
              value={taskForm.Description}
              onChange={(e) => setTaskForm({ ...taskForm, Description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* ==========================================
          MODAL 2: TASK DETAILS & COMMENTS & AUDIT TRAIL
          ========================================== */}
      {selectedTask && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Task: ${selectedTask.TaskId} - ${selectedTask.Title}`}
          maxWidth="750px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Status Bar */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Move Step:</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {stepConfig.map(s => {
                    const active = selectedTask.StepIndex === s.index;
                    return (
                      <button
                        key={s.index}
                        onClick={() => handleMoveStatusFromDetail(s.index)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          borderRadius: '4px',
                          border: active ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: active ? '#2563eb' : '#ffffff',
                          color: active ? '#ffffff' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  ...getPriorityStyle(selectedTask.Priority)
                }}>
                  {selectedTask.Priority}
                </span>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDeleteTask(selectedTask.TaskId)}
                  title="Soft delete task"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                Description
              </h4>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#334155',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {selectedTask.Description || 'No description provided.'}
              </div>
            </div>

            {/* Assignee & Dates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Assignee</span>
                <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#0f172a' }}>
                  {selectedTask.AssigneeName || 'Unassigned'}
                </span>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Reporter</span>
                <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#0f172a' }}>
                  {selectedTask.ReporterName || selectedTask.Created_By}
                </span>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Due Date</span>
                <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#0f172a' }}>
                  {selectedTask.DueDate || 'Not set'}
                </span>
              </div>
            </div>

            {/* Comments Thread */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MessageSquare size={14} color="#2563eb" /> Comments & Notes
              </h4>

              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                paddingRight: '4px'
              }}>
                {(!selectedTask.Comments || selectedTask.Comments.length === 0) ? (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>No comments yet.</p>
                ) : (
                  selectedTask.Comments.map((c, i) => (
                    <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e40af' }}>{c.author}</span>
                        <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                          {new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Write a comment or update for the team..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.825rem'
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Send size={13} /> Post
                </button>
              </form>
            </div>

            {/* Status History & Audit Trail */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <History size={14} color="#64748b" /> Activity & Status History
              </h4>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.5rem'
              }}>
                {(!selectedTask.History || selectedTask.History.length === 0) ? (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>No history logs recorded.</p>
                ) : (
                  selectedTask.History.slice().reverse().map((h, idx) => (
                    <div key={idx} style={{ fontSize: '0.725rem', color: '#475569', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>{h.author}</span>: {h.action}
                      <span style={{ color: '#94a3b8', marginLeft: '6px' }}>({new Date(h.timestamp).toLocaleTimeString()})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ==========================================
          MODAL 3: ADMIN WORKFLOW STATUS CUSTOMIZER
          ========================================== */}
      <Modal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        title="Customize JIRA 5-Step Status Workflow (Admin Only)"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveWorkflowNames} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            As per CRM policy, there are exactly 5 workflow columns. As an Administrator, you can customize the label for each step:
          </p>

          {workflowEditSteps.map((step, idx) => (
            <div key={step.index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontWeight: '700',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {step.index}
              </span>
              <input
                type="text"
                required
                value={step.name}
                onChange={(e) => {
                  const updated = [...workflowEditSteps];
                  updated[idx].name = e.target.value;
                  setWorkflowEditSteps(updated);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsWorkflowModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Workflow Labels
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
