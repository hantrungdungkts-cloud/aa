import React from 'react';
import { Project, Task } from '../../types/task';
import { isOverdue } from '../../utils/storage';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Timer, 
  BarChart3, 
  TrendingUp, 
  Folder,
  Award
} from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, projects }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPomodoros = tasks.reduce((sum, t) => sum + (t.completedPomodoros || 0), 0);

  // Priority breakdown
  const priorityCounts = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  const priorityLabels = [
    { key: 'urgent', label: 'Khẩn cấp', count: priorityCounts.urgent, barColor: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
    { key: 'high', label: 'Ưu tiên cao', count: priorityCounts.high, barColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
    { key: 'medium', label: 'Trung bình', count: priorityCounts.medium, barColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    { key: 'low', label: 'Thấp', count: priorityCounts.low, barColor: 'bg-slate-400', textColor: 'text-slate-600 dark:text-slate-400' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Báo Cáo Hiệu Suất & Tiến Độ Công Việc</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng hợp dữ liệu theo thời gian thực về khối lượng công việc và năng suất cá nhân.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-400">
          Cập nhật tức thời
        </div>
      </div>

      {/* 4 Primary KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Completion Rate */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Tỷ Lệ Hoàn Thành</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ({completedTasks}/{totalTasks} việc)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2: In Progress */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Đang Thực Hiện</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {inProgressTasks}
            </span>
            <span className="text-xs text-slate-400">nhiệm vụ active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Nhiệm vụ đang trực tiếp tiêu hao thời gian và năng lượng.
          </p>
        </div>

        {/* KPI 3: Overdue */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Nhiệm Vụ Quá Hạn</span>
            <AlertCircle className={`w-4 h-4 ${overdueTasks > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${overdueTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {overdueTasks}
            </span>
            <span className="text-xs text-slate-400">cần xử lý ngay</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {overdueTasks === 0 ? 'Tuyệt vời! Không có việc nào quá hạn.' : 'Cần ưu tiên sắp xếp lại thời hạn.'}
          </p>
        </div>

        {/* KPI 4: Pomodoro Focus */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Giờ Tập Trung Sâu</span>
            <Timer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {Math.round((totalPomodoros * 25) / 60 * 10) / 10}h
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ({totalPomodoros} phiên)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tổng thời gian tập trung ghi nhận qua đồng hồ Pomodoro.
          </p>
        </div>
      </div>

      {/* Two column visual distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Phân Bổ Theo Mức Độ Ưu Tiên
          </h3>

          <div className="space-y-3">
            {priorityLabels.map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {item.count} việc ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Workload breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Khối Lượng Theo Nhóm Dự Án
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const pCount = projTasks.length;
              const pDone = projTasks.filter((t) => t.status === 'done').length;
              const pPct = pCount > 0 ? Math.round((pDone / pCount) * 100) : 0;

              return (
                <div key={proj.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {proj.name}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {pDone}/{pCount} xong ({pPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pPct}%`,
                        backgroundColor: proj.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Productivity Advice Card */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-100 dark:border-slate-800 flex items-start gap-3.5">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-slate-900 dark:text-slate-100">
            Chiến Lược Tối Ưu Năng Suất (Gợi ý cho bạn)
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Áp dụng nguyên tắc &ldquo;Nuốt trọn con cóc&rdquo; (Eat That Frog): Giải quyết nhiệm vụ Khẩn Cấp &amp; Quan Trọng nhất vào buổi sáng đầu ngày khi năng lượng tinh thần cao nhất, sau đó dùng Pomodoro 25 phút để giữ nhịp độ bền vững.
          </p>
        </div>
      </div>
    </div>
  );
};
