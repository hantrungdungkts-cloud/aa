import React, { useState } from 'react';
import { FilterState, Project, QuickFilterType, Task } from '../types/task';
import { isOverdue, isToday, isUpcoming } from '../utils/storage';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Star, 
  CheckCircle2, 
  Plus, 
  Folder, 
  Search, 
  X,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarProps {
  tasks: Task[];
  projects: Project[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  projects,
  filter,
  onFilterChange,
  onAddProject,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#2563EB');

  // Compute live counts
  const totalCount = tasks.length;
  const todayCount = tasks.filter((t) => isToday(t.dueDate) && t.status !== 'done').length;
  const upcomingCount = tasks.filter((t) => isUpcoming(t.dueDate) && t.status !== 'done').length;
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
  const importantCount = tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high' || t.pinned) && t.status !== 'done').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;

  const quickFilterItems: { id: QuickFilterType; label: string; icon: React.ReactNode; count: number; alert?: boolean }[] = [
    { id: 'all', label: 'Tất Cả Công Việc', icon: <Inbox className="w-4 h-4" />, count: totalCount },
    { id: 'today', label: 'Hôm Nay', icon: <Clock className="w-4 h-4 text-blue-500" />, count: todayCount },
    { id: 'upcoming', label: 'Sắp Tới', icon: <Calendar className="w-4 h-4 text-emerald-500" />, count: upcomingCount },
    { id: 'overdue', label: 'Quá Hạn', icon: <AlertCircle className="w-4 h-4 text-rose-500" />, count: overdueCount, alert: overdueCount > 0 },
    { id: 'important', label: 'Quan Trọng & Ghim', icon: <Star className="w-4 h-4 text-amber-500" />, count: importantCount },
    { id: 'completed', label: 'Đã Hoàn Thành', icon: <CheckCircle2 className="w-4 h-4 text-slate-400" />, count: completedCount },
  ];

  // Collect all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags)));

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject({
      name: newProjectName.trim(),
      color: newProjectColor,
    });
    setNewProjectName('');
    setShowNewProjectForm(false);
  };

  const hasActiveFilter = 
    filter.search !== '' || 
    filter.projectId !== 'all' || 
    filter.priority !== 'all' || 
    filter.status !== 'all' || 
    filter.tag !== 'all' ||
    filter.quickFilter !== 'all';

  const resetAllFilters = () => {
    onFilterChange({
      search: '',
      projectId: 'all',
      priority: 'all',
      status: 'all',
      tag: 'all',
      quickFilter: 'all',
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc, nhãn..."
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {filter.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {hasActiveFilter && (
            <button
              onClick={resetAllFilters}
              className="mt-2 w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 py-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Xóa tất cả bộ lọc đang áp dụng</span>
            </button>
          )}
        </div>

        {/* Scrollable navigation groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Quick Filters */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1">
              Bộ Lọc Thông Minh
            </div>
            <div className="space-y-0.5">
              {quickFilterItems.map((item) => {
                const isActive = filter.quickFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onFilterChange({ quickFilter: item.id })}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                        item.alert
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Nhóm Dự Án
              </span>
              <button
                onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors"
                title="Tạo nhóm công việc mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline New Project Form */}
            {showNewProjectForm && (
              <form onSubmit={handleCreateProject} className="p-2 mb-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <input
                  type="text"
                  placeholder="Tên nhóm mới..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {['#2563EB', '#8B5CF6', '#059669', '#D97706', '#E11D48'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewProjectColor(c)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          newProjectColor === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNewProjectForm(false)}
                      className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-0.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-0.5">
              <button
                onClick={() => onFilterChange({ projectId: 'all' })}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter.projectId === 'all'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tất cả nhóm</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{tasks.length}</span>
              </button>

              {projects.map((proj) => {
                const isSelected = filter.projectId === proj.id;
                const count = tasks.filter((t) => t.projectId === proj.id && t.status !== 'done').length;
                return (
                  <button
                    key={proj.id}
                    onClick={() => onFilterChange({ projectId: proj.id })}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Cloud Filter */}
          {allTags.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                Nhãn Gắn Kèm
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {allTags.map((tag) => {
                  const isTagActive = filter.tag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => onFilterChange({ tag: isTagActive ? 'all' : tag })}
                      className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                        isTagActive
                          ? 'bg-blue-600 text-white font-medium shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          <span>TaskFlow · Tự động đồng bộ cục bộ</span>
        </div>
      </aside>
    </>
  );
};
