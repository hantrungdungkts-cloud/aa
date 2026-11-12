import React, { useState, useEffect, useRef } from 'react';
import { Project, Task } from '../../types/task';
import { soundService } from '../../utils/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Flame, 
  Timer,
  Coffee,
  Sparkles
} from 'lucide-react';

interface PomodoroViewProps {
  tasks: Task[];
  projects: Project[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onIncrementTaskPomodoro: (taskId: string) => void;
  onToggleStatus: (id: string) => void;
}

type PomodoroMode = 'work' | 'short_break' | 'long_break';

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  tasks,
  projects,
  activeTask,
  onSelectTask,
  onIncrementTaskPomodoro,
  onToggleStatus,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientActive, setAmbientActive] = useState<boolean>(false);
  const [completedSessionsToday, setCompletedSessionsToday] = useState<number>(3);

  const timerRef = useRef<number | null>(null);

  const durations: Record<PomodoroMode, number> = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Switch mode
  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  // Timer countdown tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, activeTask]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    soundService.playTimerDone();

    if (mode === 'work') {
      setCompletedSessionsToday((c) => c + 1);
      if (activeTask) {
        onIncrementTaskPomodoro(activeTask.id);
      }
      // Alternate to short break
      setMode('short_break');
      setTimeLeft(durations.short_break);
    } else {
      // After break, back to work
      setMode('work');
      setTimeLeft(durations.work);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const toggleAmbient = () => {
    const next = !ambientActive;
    setAmbientActive(next);
    soundService.toggleAmbientSound(next, 0.04);
  };

  // Clean up ambient audio on unmount
  useEffect(() => {
    return () => {
      soundService.toggleAmbientSound(false);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalDuration = durations[mode];
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  const activeProject = activeTask ? projectMap.get(activeTask.projectId) : null;
  const pendingTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Không Gian Tập Trung Sâu (Deep Focus)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kỹ thuật Pomodoro: 25 phút làm việc miệt mài, ngắt bỏ mọi phiền nhiễu, nghỉ ngơi phục hồi năng lượng não bộ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xs">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
            <button
              onClick={() => switchMode('work')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'work'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              25p Tập Trung
            </button>
            <button
              onClick={() => switchMode('short_break')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'short_break'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              5p Nghỉ Ngắn
            </button>
            <button
              onClick={() => switchMode('long_break')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'long_break'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              15p Nghỉ Dài
            </button>
          </div>

          {/* Big Circular Dial / Timer readout */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-500 ${
                  mode === 'work'
                    ? 'stroke-blue-600'
                    : mode === 'short_break'
                    ? 'stroke-emerald-500'
                    : 'stroke-indigo-500'
                }`}
                strokeWidth="6"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Time numbers inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs uppercase font-semibold tracking-widest text-slate-400 mt-2">
                {mode === 'work' ? 'Đang Tập Trung' : 'Thời Gian Nghỉ'}
              </span>
            </div>
          </div>

          {/* Controls: Play/Pause, Reset, Skip */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={resetTimer}
              className="p-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Đặt lại phiên"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-md flex items-center gap-2 transition-transform active:scale-95 ${
                mode === 'work'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Tạm Dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Bắt Đầu Phiên</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleTimerComplete()}
              className="p-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Bỏ qua / Kết thúc phiên"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Ambient Sound generator toggle */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <button
              onClick={toggleAmbient}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                ambientActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {ambientActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Tiếng mưa trắng khử tiếng ồn (White Noise)</span>
            </button>
          </div>
        </div>

        {/* Task Connection & Daily Stats Column */}
        <div className="space-y-4">
          {/* Active Target Task Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Nhiệm Vụ Đang Thực Hiện
              </span>
              {activeTask && (
                <button
                  onClick={() => onSelectTask(null)}
                  className="text-xs text-slate-400 hover:text-rose-500"
                >
                  Đổi việc
                </button>
              )}
            </div>

            {activeTask ? (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {activeProject && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeProject.color }}
                    />
                  )}
                  <span>{activeProject?.name || 'Chung'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {activeTask.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="font-mono tabular-nums">
                    Đã hoàn thành: <strong>{activeTask.completedPomodoros}</strong> / {activeTask.estimatedPomodoros} phiên
                  </span>
                  <button
                    onClick={() => onToggleStatus(activeTask.id)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xong việc
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                <p className="mb-2">Chưa chọn công việc cụ thể để gán phiên tập trung.</p>
                <p className="text-[11px] text-slate-500">Chọn một công việc bên dưới để bắt đầu bấm giờ.</p>
              </div>
            )}
          </div>

          {/* Quick Select Task from list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Chọn Việc Từ Danh Sách ({pendingTasks.length})
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {pendingTasks.map((task) => {
                const isCurrent = activeTask?.id === task.id;
                return (
                  <button
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 border ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 font-semibold text-blue-900 dark:text-blue-200'
                        : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate flex-1">{task.title}</span>
                    <span className="font-mono text-[10px] tabular-nums text-slate-400 shrink-0">
                      {task.completedPomodoros}/{task.estimatedPomodoros}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Streak & Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Tổng phiên hôm nay
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {completedSessionsToday} phiên ({completedSessionsToday * 25} phút)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
