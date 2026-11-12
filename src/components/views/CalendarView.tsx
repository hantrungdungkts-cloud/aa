import React, { useState } from 'react';
import { Project, Task } from '../../types/task';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onAddTaskOnDate: (dateString: string) => void;
  onToggleStatus: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onAddTaskOnDate,
  onToggleStatus,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Monday-start (Monday = 0, Sunday = 6)
  const mondayFirstDay = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Build grid cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = mondayFirstDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    // Format YYYY-MM-DD safely
    const yStr = year.toString();
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete grid (up to multiple of 7)
  const totalSlots = Math.ceil(calendarCells.length / 7) * 7;
  const remaining = totalSlots - calendarCells.length;
  for (let n = 1; n <= remaining; n++) {
    const nextMonthDate = new Date(year, month + 1, n);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    calendarCells.push({
      dateStr,
      dayNum: n,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  const weekDayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Calendar Header Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {monthNamesVi[month]} năm {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Hôm nay
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {weekDayHeaders.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-amber-600 dark:text-amber-400' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {calendarCells.map((cell, idx) => {
            const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 flex flex-col transition-colors group relative ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                    : 'bg-white dark:bg-slate-900'
                } ${cell.isToday ? 'ring-2 ring-inset ring-blue-500' : ''}`}
              >
                {/* Cell Header: Day Number + Add button */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold tabular-nums w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.isToday
                        ? 'bg-blue-600 text-white'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  <button
                    onClick={() => onAddTaskOnDate(cell.dateStr)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-all"
                    title={`Thêm việc vào ngày ${cell.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task pills inside day */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[110px]">
                  {dayTasks.map((t) => {
                    const proj = projectMap.get(t.projectId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => onEditTask(t)}
                        className={`px-2 py-1 rounded text-[11px] truncate cursor-pointer transition-all border flex items-center gap-1.5 ${
                          t.status === 'done'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-400 dark:text-slate-500 line-through'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                        }`}
                        title={`${t.title} (${t.dueTime || 'Cả ngày'})`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj?.color || '#3b82f6' }}
                        />
                        <span className="truncate flex-1">{t.title}</span>
                        {t.dueTime && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {t.dueTime}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
