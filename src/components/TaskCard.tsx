import React from 'react';
import { Project, Task, TaskStatus } from '../types/task';
import { formatVietnameseDate, isOverdue, isToday } from '../utils/storage';
import { 
  Check, 
  Calendar, 
  Clock, 
  Bookmark, 
  CheckSquare, 
  Timer, 
  MoreVertical, 
  Trash2, 
  Edit3,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onMoveStatus?: (id: string, newStatus: TaskStatus) => void;
  onStartPomodoro?: (task: Task) => void;
  showMoveButtons?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveStatus,
  onStartPomodoro,
  showMoveButtons = false,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  const overdue = isOverdue(task.dueDate, task.status);
  const dueToday = isToday(task.dueDate);

  // Priority metadata text and style
  const priorityInfo = {
    urgent: { label: 'Khẩn cấp', color: 'text-rose-600 dark:text-rose-400 font-semibold' },
    high: { label: 'Ưu tiên cao', color: 'text-amber-600 dark:text-amber-400 font-medium' },
    medium: { label: 'Trung bình', color: 'text-blue-600 dark:text-blue-400' },
    low: { label: 'Thấp', color: 'text-slate-500 dark:text-slate-400' },
  }[task.priority];

  const statusNext: Record<TaskStatus, TaskStatus | null> = {
    todo: 'in_progress',
    in_progress: 'in_review',
    in_review: 'done',
    done: null,
  };

  const statusPrev: Record<TaskStatus, TaskStatus | null> = {
    todo: null,
    in_progress: 'todo',
    in_review: 'in_progress',
    done: 'in_review',
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className={`group relative p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all cursor-pointer shadow-2xs hover:shadow-md ${
        task.status === 'done'
          ? 'border-slate-200/80 dark:border-slate-800/80 opacity-75'
          : overdue
          ? 'border-rose-300 dark:border-rose-900/60'
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
      }`}
    >
      {/* Top row: Project indicator & Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {project && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
              title={project.name}
            />
          )}
          <span className="text-slate-500 dark:text-slate-400 truncate font-medium">
            {project?.name || 'Chung'}
          </span>
          {task.pinned && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <Bookmark className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />
            </>
          )}
        </div>

        {/* Priority unboxed text (anti-pill rule §1.A) */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] ${priorityInfo.color}`}>
            {priorityInfo.label}
          </span>

          {/* Card dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-6 z-30 w-36 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
                {onStartPomodoro && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onStartPomodoro(task);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Timer className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hẹn giờ Pomodoro</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa việc</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title & Complete Checkbox */}
      <div className="flex items-start gap-2.5 mb-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(task.id);
          }}
          className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 transition-colors border ${
            task.status === 'done'
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400'
          }`}
          title={task.status === 'done' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
        >
          {task.status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <h4
          className={`text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 ${
            task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }`}
        >
          {task.title}
        </h4>
      </div>

      {/* Description excerpt */}
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar (if any) */}
      {totalSubtasks > 0 && (
        <div className="mb-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span>Việc con</span>
            </span>
            <span>
              {completedSubtasks}/{totalSubtasks} ({subtaskPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                subtaskPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${subtaskPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Date & Metadata with clean unboxed typographic separators */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 font-mono text-[11px] tabular-nums ${
                overdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : dueToday
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : ''
              }`}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{formatVietnameseDate(task.dueDate)}</span>
              {task.dueTime && <span>{task.dueTime}</span>}
            </span>
          )}

          {task.estimatedPomodoros > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5 text-[11px] font-mono tabular-nums">
                <Timer className="w-3 h-3 text-slate-400" />
                <span>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
              </span>
            </>
          )}

          {task.tags.length > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="text-[11px] text-slate-400 truncate max-w-[100px]">
                #{task.tags[0]}
                {task.tags.length > 1 && ` +${task.tags.length - 1}`}
              </span>
            </>
          )}
        </div>

        {/* Move step buttons if requested (e.g. in Kanban or touch view) */}
        {showMoveButtons && onMoveStatus && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {statusPrev[task.status] && (
              <button
                onClick={() => onMoveStatus(task.id, statusPrev[task.status]!)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Lùi trạng thái"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            {statusNext[task.status] && (
              <button
                onClick={() => onMoveStatus(task.id, statusNext[task.status]!)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Chuyển tiếp trạng thái"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
