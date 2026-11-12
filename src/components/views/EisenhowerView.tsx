import React from 'react';
import { Project, Task, TaskPriority } from '../../types/task';
import { TaskCard } from '../TaskCard';
import { Plus, Flame, Target, Users, Coffee } from 'lucide-react';

interface EisenhowerViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onQuickAddPriority: (priority: TaskPriority) => void;
}

export const EisenhowerView: React.FC<EisenhowerViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onStartPomodoro,
  onQuickAddPriority,
}) => {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Active tasks only (done tasks can be viewed or toggled)
  const activeTasks = tasks.filter((t) => t.status !== 'done');

  const quadrants: {
    id: TaskPriority;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ReactNode;
    colorClasses: {
      border: string;
      headerBg: string;
      badgeText: string;
      iconColor: string;
    };
  }[] = [
    {
      id: 'urgent',
      title: 'Khẩn Cấp & Quan Trọng',
      subtitle: 'Tác động sống còn, khủng hoảng cần xử lý ngay lập tức.',
      badge: 'LÀM NGAY (DO FIRST)',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      colorClasses: {
        border: 'border-rose-200 dark:border-rose-900/60',
        headerBg: 'bg-rose-50/60 dark:bg-rose-950/20',
        badgeText: 'text-rose-700 dark:text-rose-300',
        iconColor: 'text-rose-600',
      },
    },
    {
      id: 'high',
      title: 'Quan Trọng Nhưng Không Gấp',
      subtitle: 'Chiến lược dài hạn, học tập, xây dựng thói quen và phòng ngừa rủi ro.',
      badge: 'LÊN KẾ HOẠCH (SCHEDULE)',
      icon: <Target className="w-5 h-5 text-blue-500" />,
      colorClasses: {
        border: 'border-blue-200 dark:border-blue-900/60',
        headerBg: 'bg-blue-50/60 dark:bg-blue-950/20',
        badgeText: 'text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-600',
      },
    },
    {
      id: 'medium',
      title: 'Khẩn Cấp Nhưng Không Quan Trọng',
      subtitle: 'Cuộc gọi ngắt quãng, yêu cầu gấp từ người khác, việc giấy tờ phát sinh.',
      badge: 'ỦY QUYỀN / GỌN NHẸ (DELEGATE)',
      icon: <Users className="w-5 h-5 text-amber-500" />,
      colorClasses: {
        border: 'border-amber-200 dark:border-amber-900/60',
        headerBg: 'bg-amber-50/60 dark:bg-amber-950/20',
        badgeText: 'text-amber-700 dark:text-amber-300',
        iconColor: 'text-amber-600',
      },
    },
    {
      id: 'low',
      title: 'Không Khẩn Cấp & Không Quan Trọng',
      subtitle: 'Hoạt động giải trí nhẹ, công việc ngoài lề có thể hoãn hoặc giản lược.',
      badge: 'LOẠI BỎ / THƯ THẢ (ELIMINATE)',
      icon: <Coffee className="w-5 h-5 text-slate-500" />,
      colorClasses: {
        border: 'border-slate-200 dark:border-slate-800',
        headerBg: 'bg-slate-50 dark:bg-slate-800/40',
        badgeText: 'text-slate-700 dark:text-slate-300',
        iconColor: 'text-slate-500',
      },
    },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Ma Trận Eisenhower (Eisenhower Decision Matrix)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Phân loại công việc theo tính khẩn cấp và mức độ quan trọng để tối ưu hóa năng suất và giảm thiểu stress.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500">
          Đang hiển thị <strong>{activeTasks.length}</strong> việc chưa hoàn thành
        </div>
      </div>

      {/* 2x2 Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {quadrants.map((q) => {
          const qTasks = activeTasks.filter((t) => t.priority === q.id);

          return (
            <div
              key={q.id}
              className={`flex flex-col rounded-xl border bg-white dark:bg-slate-900/90 shadow-2xs overflow-hidden ${q.colorClasses.border}`}
            >
              {/* Quadrant Header */}
              <div className={`p-4 border-b border-slate-200/80 dark:border-slate-800 ${q.colorClasses.headerBg}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {q.icon}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {q.title}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold tracking-wider ${q.colorClasses.badgeText}`}>
                    {q.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <p className="line-clamp-1">{q.subtitle}</p>
                  <button
                    onClick={() => onQuickAddPriority(q.id)}
                    className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

              {/* Tasks in Quadrant */}
              <div className="flex-1 p-3 space-y-3 min-h-[220px] max-h-[420px] overflow-y-auto bg-slate-50/40 dark:bg-slate-900/30">
                {qTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-xs mb-2">Chưa có nhiệm vụ trong góc này.</p>
                    <button
                      onClick={() => onQuickAddPriority(q.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Giao việc mới vào góc này
                    </button>
                  </div>
                ) : (
                  qTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      project={projectMap.get(task.projectId)}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleStatus={onToggleStatus}
                      onStartPomodoro={onStartPomodoro}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
