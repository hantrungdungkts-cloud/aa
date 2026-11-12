import React, { useState } from 'react';
import { Project, Task, TaskPriority, TaskStatus } from '../../types/task';
import { formatVietnameseDate, isOverdue, isToday } from '../../utils/storage';
import { 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowUpDown, 
  MoreHorizontal,
  Bookmark,
  CheckSquare,
  Timer
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onMoveStatus: (id: string, newStatus: TaskStatus) => void;
  onStartPomodoro: (task: Task) => void;
  onQuickCreateTask: (title: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkSetStatus: (ids: string[], status: TaskStatus) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onStartPomodoro,
  onQuickCreateTask,
  onBulkDelete,
  onBulkSetStatus,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickCreateTask(quickInput.trim());
    setQuickInput('');
  };

  const handleSelectAll = () => {
    if (selectedIds.length === tasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tasks.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const priorityLabels: Record<TaskPriority, { text: string; className: string }> = {
    urgent: { text: 'Khẩn cấp', className: 'text-rose-600 dark:text-rose-400 font-semibold' },
    high: { text: 'Cao', className: 'text-amber-600 dark:text-amber-400 font-medium' },
    medium: { text: 'Trung bình', className: 'text-blue-600 dark:text-blue-400' },
    low: { text: 'Thấp', className: 'text-slate-500 dark:text-slate-400' },
  };

  const statusLabels: Record<TaskStatus, { text: string; dot: string }> = {
    todo: { text: 'Cần làm', dot: 'bg-slate-400' },
    in_progress: { text: 'Đang làm', dot: 'bg-blue-500' },
    in_review: { text: 'Chờ duyệt', dot: 'bg-amber-500' },
    done: { text: 'Đã xong', dot: 'bg-emerald-500' },
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="relative flex items-center">
        <input
          type="text"
          placeholder="Thêm nhanh công việc mới (ví dụ: Soát hợp đồng trước 15:00) rồi nhấn Enter..."
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          className="w-full pl-11 pr-28 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <Plus className="w-5 h-5 absolute left-3.5 text-blue-600 dark:text-blue-400" />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-lg transition-all"
        >
          Thêm nhanh
        </button>
      </form>

      {/* Bulk Action Bar (Visible when tasks are selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-medium">
            <span>Đã chọn <strong className="font-mono tabular-nums">{selectedIds.length}</strong> công việc</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBulkSetStatus(selectedIds, 'done');
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đánh dấu hoàn thành
            </button>
            <button
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa đã chọn
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* High-density Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={tasks.length > 0 && selectedIds.length === tasks.length}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-10 text-center">Xong</th>
                <th className="py-3 px-4 min-w-[280px]">Tên Công Việc</th>
                <th className="py-3 px-4 min-w-[140px]">Dự Án</th>
                <th className="py-3 px-4 min-w-[110px]">Trạng Thái</th>
                <th className="py-3 px-4 min-w-[100px]">Ưu Tiên</th>
                <th className="py-3 px-4 min-w-[120px] font-mono">Hạn Chót</th>
                <th className="py-3 px-4 min-w-[80px] font-mono text-center">Pomodoro</th>
                <th className="py-3 px-4 w-14 text-center">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Chưa có công việc nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const project = projectMap.get(task.projectId);
                  const isSelected = selectedIds.includes(task.id);
                  const overdue = isOverdue(task.dueDate, task.status);
                  const dueToday = isToday(task.dueDate);
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={`h-11 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/50 dark:bg-blue-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Checkbox select */}
                      <td className="py-2 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(task.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Status complete toggle */}
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors mx-auto border ${
                            task.status === 'done'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {task.status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Title & Subtasks info */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          {task.pinned && (
                            <Bookmark className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />
                          )}
                          <span
                            className={`font-medium ${
                              task.status === 'done'
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.subtasks.length > 0 && (
                            <span className="text-[11px] text-slate-400 font-mono tabular-nums flex items-center gap-0.5 shrink-0">
                              <CheckSquare className="w-3 h-3" />
                              {completedSubtasks}/{task.subtasks.length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: project?.color || '#94a3b8' }}
                          />
                          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                            {project?.name || 'Chung'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-4">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {statusLabels[task.status]?.text}
                        </span>
                      </td>

                      {/* Priority unboxed text */}
                      <td className="py-2 px-4">
                        <span className={priorityLabels[task.priority]?.className}>
                          {priorityLabels[task.priority]?.text}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-2 px-4 font-mono tabular-nums">
                        <span
                          className={`${
                            overdue
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : dueToday
                              ? 'text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {formatVietnameseDate(task.dueDate)}
                        </span>
                      </td>

                      {/* Pomodoros */}
                      <td className="py-2 px-4 text-center font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {task.completedPomodoros}/{task.estimatedPomodoros}
                      </td>

                      {/* Row actions */}
                      <td className="py-2 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onStartPomodoro(task)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Bắt đầu Pomodoro cho việc này"
                          >
                            <Timer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
