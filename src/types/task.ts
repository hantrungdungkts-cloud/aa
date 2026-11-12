export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  subtasks: SubTask[];
  tags: string[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: string;
  completedAt?: string;
  pinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string; // hex or tailwind-compatible color key
  description?: string;
}

export type QuickFilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'important' | 'completed';

export type ViewMode = 'kanban' | 'list' | 'eisenhower' | 'calendar' | 'pomodoro' | 'analytics';

export interface FilterState {
  search: string;
  projectId: string; // 'all' or specific id
  priority: string;  // 'all' or specific
  status: string;    // 'all' or specific
  tag: string;       // 'all' or specific
  quickFilter: QuickFilterType;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
