import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../../types/task';
import { TaskCard } from '../TaskCard';
import { Plus, CheckCircle2, Clock, PlayCircle, Eye } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onMoveStatus: (id: string, newStatus: TaskStatus) => void;
  onStartPomodoro: (task: Task) => void;
  onQuickAdd: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  description: string;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onMoveStatus,
  onStartPomodoro,
  onQuickAdd,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const columns: ColumnConfig[] = [
    {
      id: 'todo',
      title: 'Cần Làm',
      icon: <Clock className="w-4 h-4 text-slate-500" />,
      accentColor: 'border-t-slate-400',
      description: 'Nhiệm vụ chuẩn bị thực hiện',
    },
    {
      id: 'in_progress',
      title: 'Đang Thực Hiện',
      icon: <PlayCircle className="w-4 h-4 text-blue-500" />,
      accentColor: 'border-t-blue-500',
      description: 'Đang chủ động tập trung xử lý',
    },
    {
      id: 'in_review',
      title: 'Chờ Duyệt / Đánh Giá',
      icon: <Eye className="w-4 h-4 text-amber-500" />,
      accentColor: 'border-t-amber-500',
      description: 'Chờ phản hồi hoặc kiểm tra kết quả',
    },
    {
      id: 'done',
      title: 'Đã Hoàn Thành',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      accentColor: 'border-t-emerald-500',
      description: 'Công việc đã hoàn tất mỹ mãn',
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 lg:p-6 overflow-x-auto min-w-[320px]">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border transition-colors max-h-[calc(100vh-140px)] ${
              isOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {col.title}
                </h3>
                <span className="text-xs font-mono font-semibold tabular-nums text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => onQuickAdd(col.id)}
                className="p-1 rounded-md text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title={`Thêm công việc vào mục ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Task List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colTasks.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                    {col.id === 'done' ? 'Chưa có việc nào hoàn thành' : 'Chưa có công việc ở cột này'}
                  </p>
                  <button
                    onClick={() => onQuickAdd(col.id)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm việc mới
                  </button>
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing transition-transform active:scale-[0.98]"
                  >
                    <TaskCard
                      task={task}
                      project={projectMap.get(task.projectId)}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleStatus={onToggleStatus}
                      onMoveStatus={onMoveStatus}
                      onStartPomodoro={onStartPomodoro}
                      showMoveButtons={true}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
