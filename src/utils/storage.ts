import { FilterState, Project, Task } from '../types/task';
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v1',
  PROJECTS: 'taskflow_projects_v1',
  THEME: 'taskflow_theme_v1',
  VIEW: 'taskflow_last_view_v1',
  POMODORO_SETTINGS: 'taskflow_pomodoro_settings_v1',
};

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
};

export const loadProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load projects from localStorage', err);
    return INITIAL_PROJECTS;
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
};

// Date utilities for filtering
export const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

export const isOverdue = (dateString: string, status: string): boolean => {
  if (!dateString || status === 'done') return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};

export const isUpcoming = (dateString: string): boolean => {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString > today;
};

export const formatVietnameseDate = (dateString: string): string => {
  if (!dateString) return 'Chưa định ngày';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Filter tasks function
export const filterTasks = (tasks: Task[], filter: FilterState): Task[] => {
  return tasks
    .filter((task) => {
      // 1. Search query
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description.toLowerCase().includes(query);
        const matchTags = task.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      // 2. Project filter
      if (filter.projectId !== 'all' && task.projectId !== filter.projectId) {
        return false;
      }

      // 3. Priority filter
      if (filter.priority !== 'all' && task.priority !== filter.priority) {
        return false;
      }

      // 4. Status filter
      if (filter.status !== 'all' && task.status !== filter.status) {
        return false;
      }

      // 5. Tag filter
      if (filter.tag !== 'all' && !task.tags.includes(filter.tag)) {
        return false;
      }

      // 6. Quick filter
      if (filter.quickFilter === 'today') {
        if (!isToday(task.dueDate)) return false;
      } else if (filter.quickFilter === 'upcoming') {
        if (!isUpcoming(task.dueDate)) return false;
      } else if (filter.quickFilter === 'overdue') {
        if (!isOverdue(task.dueDate, task.status)) return false;
      } else if (filter.quickFilter === 'important') {
        if (task.priority !== 'urgent' && task.priority !== 'high' && !task.pinned) return false;
      } else if (filter.quickFilter === 'completed') {
        if (task.status !== 'done') return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Pinned tasks first if both in same status
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (filter.sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const compare = a.dueDate.localeCompare(b.dueDate);
        return filter.sortOrder === 'asc' ? compare : -compare;
      }

      if (filter.sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        return filter.sortOrder === 'asc' ? -diff : diff;
      }

      if (filter.sortBy === 'title') {
        const compare = a.title.localeCompare(b.title);
        return filter.sortOrder === 'asc' ? compare : -compare;
      }

      // Default: createdAt
      const compare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return filter.sortOrder === 'asc' ? -compare : compare;
    });
};

// Export to JSON
export const exportTasksToJson = (tasks: Task[], projects: Project[]): void => {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    projects,
    tasks,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export to CSV
export const exportTasksToCsv = (tasks: Task[], projects: Project[]): void => {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const headers = ['Mã công việc', 'Tiêu đề', 'Mô tả', 'Trạng thái', 'Mức ưu tiên', 'Dự án', 'Hạn chót', 'Giờ', 'Nhãn', 'Ngày tạo'];
  
  const statusMap: Record<string, string> = {
    todo: 'Cần làm',
    in_progress: 'Đang làm',
    in_review: 'Chờ duyệt',
    done: 'Đã hoàn thành',
  };

  const priorityMap: Record<string, string> = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  };

  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${statusMap[t.status] || t.status}"`,
    `"${priorityMap[t.priority] || t.priority}"`,
    `"${projectMap.get(t.projectId) || 'Khác'}"`,
    `"${t.dueDate || ''}"`,
    `"${t.dueTime || ''}"`,
    `"${t.tags.join(', ')}"`,
    `"${t.createdAt}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `danh-sach-cong-viec-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
