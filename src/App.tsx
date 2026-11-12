import { useState, useEffect, useRef, useTransition } from 'react';
import { 
  FilterState, 
  Project, 
  Task, 
  TaskPriority, 
  TaskStatus, 
  ViewMode 
} from './types/task';
import { 
  exportTasksToCsv, 
  exportTasksToJson, 
  filterTasks, 
  loadProjects, 
  loadTasks, 
  saveProjects, 
  saveTasks 
} from './utils/storage';
import { soundService } from './utils/audio';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { Confetti } from './components/Confetti';
import { ListView } from './components/views/ListView';
import { KanbanView } from './components/views/KanbanView';
import { EisenhowerView } from './components/views/EisenhowerView';
import { CalendarView } from './components/views/CalendarView';
import { PomodoroView } from './components/views/PomodoroView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { Menu, FileSpreadsheet, FileJson, RotateCcw } from 'lucide-react';
import { INITIAL_TASKS } from './data/initialTasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskflow_theme_v1');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    projectId: 'all',
    priority: 'all',
    status: 'all',
    tag: 'all',
    quickFilter: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>('medium');
  const [defaultDate, setDefaultDate] = useState<string>('');
  const [activePomodoroTask, setActivePomodoroTask] = useState<Task | null>(null);

  // Celebratory confetti trigger
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  // Mobile sidebar open/close
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Hidden file input for importing JSON backup
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Export menu modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Synchronize darkMode with document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskflow_theme_v1', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskflow_theme_v1', 'light');
    }
  }, [darkMode]);

  // Persist tasks on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Persist projects on change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Keyboard shortcut: Press 'N' to create new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'SELECT';
      if (!isInput && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleOpenCreateModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCreateModal = (status?: TaskStatus, priority?: TaskPriority, dateStr?: string) => {
    setTaskToEdit(null);
    setDefaultStatus(status || 'todo');
    setDefaultPriority(priority || 'medium');
    setDefaultDate(dateStr || '');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskData.id) {
            const updated = { ...t, ...taskData } as Task;
            if (updated.status === 'done' && t.status !== 'done') {
              updated.completedAt = new Date().toISOString();
              soundService.playTaskComplete();
              setConfettiTrigger(true);
            }
            return updated;
          }
          return t;
        })
      );
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        projectId: taskData.projectId || projects[0]?.id || 'proj-work',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        dueTime: taskData.dueTime,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
        estimatedPomodoros: taskData.estimatedPomodoros || 2,
        completedPomodoros: 0,
        createdAt: new Date().toISOString(),
        pinned: taskData.pinned || false,
      };

      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activePomodoroTask?.id === id) {
      setActivePomodoroTask(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
          if (nextStatus === 'done') {
            soundService.playTaskComplete();
            setConfettiTrigger(true);
          }
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleMoveStatus = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (newStatus === 'done' && t.status !== 'done') {
            soundService.playTaskComplete();
            setConfettiTrigger(true);
          }
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleQuickCreateTask = (title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: filter.projectId !== 'all' ? filter.projectId : projects[0]?.id || 'proj-work',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '18:00',
      subtasks: [],
      tags: ['Nhiệm vụ mới'],
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleBulkDelete = (ids: string[]) => {
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  const handleBulkSetStatus = (ids: string[], status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (ids.includes(t.id)) {
          return {
            ...t,
            status,
            completedAt: status === 'done' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
    if (status === 'done') {
      soundService.playTaskComplete();
      setConfettiTrigger(true);
    }
  };

  const handleAddProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...newProjectData,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const handleIncrementTaskPomodoro = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            completedPomodoros: (t.completedPomodoros || 0) + 1,
          };
        }
        return t;
      })
    );
  };

  const handleStartPomodoro = (task: Task) => {
    setActivePomodoroTask(task);
    setCurrentView('pomodoro');
  };

  // Handle JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
          if (Array.isArray(parsed.projects)) {
            setProjects(parsed.projects);
          }
          alert('Đã nhập dữ liệu thành công!');
        } else if (Array.isArray(parsed)) {
          setTasks(parsed);
          alert('Đã nhập dữ liệu công việc thành công!');
        }
      } catch (err) {
        alert('File không hợp lệ hoặc sai định dạng JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSampleData = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại dữ liệu mẫu ban đầu? Các công việc hiện tại sẽ được thay thế.')) {
      setTasks(INITIAL_TASKS);
      saveTasks(INITIAL_TASKS);
    }
  };

  // Filtered tasks passed to active view
  const visibleTasks = filterTasks(tasks, filter);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Particle Confetti for achievements */}
      <Confetti trigger={confettiTrigger} onFinish={() => setConfettiTrigger(false)} />

      {/* Hidden File Input for Data Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />

      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onOpenNewTaskModal={() => handleOpenCreateModal()}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onExport={() => setShowExportModal(true)}
        onImportTrigger={() => fileInputRef.current?.click()}
      />

      {/* Mobile Top Sub-bar with Drawer Toggle & Filter summary */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSidebarOpenMobile(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600"
        >
          <Menu className="w-4 h-4" />
          <span>Bộ lọc & Nhóm việc ({visibleTasks.length})</span>
        </button>

        <button
          onClick={() => handleOpenCreateModal()}
          className="text-xs font-bold text-blue-600 dark:text-blue-400"
        >
          + Thêm việc
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          tasks={tasks}
          projects={projects}
          filter={filter}
          onFilterChange={(newF) => setFilter((prev) => ({ ...prev, ...newF }))}
          onAddProject={handleAddProject}
          isOpenMobile={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-slate-950">
          {currentView === 'kanban' && (
            <KanbanView
              tasks={visibleTasks}
              projects={projects}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onMoveStatus={handleMoveStatus}
              onStartPomodoro={handleStartPomodoro}
              onQuickAdd={(status) => handleOpenCreateModal(status)}
            />
          )}

          {currentView === 'list' && (
            <ListView
              tasks={visibleTasks}
              projects={projects}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onMoveStatus={handleMoveStatus}
              onStartPomodoro={handleStartPomodoro}
              onQuickCreateTask={handleQuickCreateTask}
              onBulkDelete={handleBulkDelete}
              onBulkSetStatus={handleBulkSetStatus}
            />
          )}

          {currentView === 'eisenhower' && (
            <EisenhowerView
              tasks={visibleTasks}
              projects={projects}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onStartPomodoro={handleStartPomodoro}
              onQuickAddPriority={(priority) => handleOpenCreateModal(undefined, priority)}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={visibleTasks}
              projects={projects}
              onEditTask={handleOpenEditModal}
              onAddTaskOnDate={(dateStr) => handleOpenCreateModal('todo', 'medium', dateStr)}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {currentView === 'pomodoro' && (
            <PomodoroView
              tasks={tasks}
              projects={projects}
              activeTask={activePomodoroTask}
              onSelectTask={setActivePomodoroTask}
              onIncrementTaskPomodoro={handleIncrementTaskPomodoro}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              tasks={tasks}
              projects={projects}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        projects={projects}
        defaultStatus={defaultStatus}
        defaultPriority={defaultPriority}
        defaultDate={defaultDate}
      />

      {/* Data Export / Backup Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Xuất & Sao Lưu Dữ Liệu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tải toàn bộ công việc và cấu hình dự án về máy tính của bạn để lưu trữ an toàn hoặc mở trong Excel.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  exportTasksToCsv(tasks, projects);
                  setShowExportModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Xuất file Excel / CSV</span>
                </div>
                <span className="text-slate-400">.csv</span>
              </button>

              <button
                onClick={() => {
                  exportTasksToJson(tasks, projects);
                  setShowExportModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <FileJson className="w-4 h-4 text-blue-600" />
                  <span>Xuất file Backup đầy đủ (JSON)</span>
                </div>
                <span className="text-slate-400">.json</span>
              </button>

              <button
                onClick={() => {
                  handleResetSampleData();
                  setShowExportModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors text-slate-600 dark:text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>Nạp lại dữ liệu mẫu ban đầu</span>
                </div>
                <span className="text-[10px] text-slate-400">Reset</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
