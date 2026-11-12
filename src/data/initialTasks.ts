import { Project, Task } from '../types/task';

// Generate dynamic dates around current date
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-work',
    name: 'Công Việc & Doanh Nghiệp',
    color: '#2563EB', // Blue
    description: 'Nhiệm vụ trọng tâm cơ quan, dự án chính và báo cáo',
  },
  {
    id: 'proj-uiux',
    name: 'Phát Triển Sản Phẩm (UI/UX)',
    color: '#8B5CF6', // Purple
    description: 'Thiết kế giao diện, nghiên cứu người dùng và trải nghiệm',
  },
  {
    id: 'proj-study',
    name: 'Học Tập & Kỹ Năng',
    color: '#D97706', // Amber
    description: 'Nâng cao chuyên môn, đọc sách và ngoại ngữ',
  },
  {
    id: 'proj-personal',
    name: 'Cá Nhân & Sức Khỏe',
    color: '#059669', // Emerald
    description: 'Thói quen lành mạnh, gia đình và tài chính cá nhân',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Hoàn thiện slide thuyết trình báo cáo quý IV và kế hoạch 2027',
    description: 'Chuẩn bị dữ liệu doanh thu, chi phí vận hành và KPI các phòng ban để trình bày cho ban giám đốc.',
    status: 'in_progress',
    priority: 'urgent',
    projectId: 'proj-work',
    dueDate: getRelativeDate(0), // Today
    dueTime: '16:30',
    tags: ['Báo cáo', 'Ban giám đốc', 'Chiến lược'],
    estimatedPomodoros: 4,
    completedPomodoros: 2,
    createdAt: new Date().toISOString(),
    pinned: true,
    subtasks: [
      { id: 'sub-1-1', title: 'Tổng hợp số liệu tài chính từ kế toán', completed: true },
      { id: 'sub-1-2', title: 'Thiết kế biểu đồ tăng trưởng doanh số', completed: true },
      { id: 'sub-1-3', title: 'Viết đề xuất ngân sách tiếp thị năm mới', completed: false },
      { id: 'sub-1-4', title: 'Soát lại nội dung thuyết trình và ghi chú', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Nghiên cứu & thiết kế Design System cho ứng dụng Mobile mới',
    description: 'Định nghĩa bảng màu, kiểu chữ (typography), icon set và bộ quy chuẩn responsive components trên Figma.',
    status: 'in_progress',
    priority: 'high',
    projectId: 'proj-uiux',
    dueDate: getRelativeDate(2),
    dueTime: '18:00',
    tags: ['Figma', 'UI/UX', 'Design System'],
    estimatedPomodoros: 6,
    completedPomodoros: 3,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-2-1', title: 'Xây dựng bảng màu chính & trạng thái accessibility', completed: true },
      { id: 'sub-2-2', title: 'Thiết kế bộ Button và Input field variants', completed: true },
      { id: 'sub-2-3', title: 'Tạo thư viện Modal, Drawer và Dropdowns', completed: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Gặp gỡ và trao đổi hợp đồng đối tác công nghệ VinTech Solution',
    description: 'Họp trực tuyến qua Google Meet để thảo luận điều khoản tích hợp API cổng thanh toán.',
    status: 'todo',
    priority: 'high',
    projectId: 'proj-work',
    dueDate: getRelativeDate(1),
    dueTime: '10:00',
    tags: ['Khách hàng', 'Đối tác', 'Hợp đồng'],
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    pinned: true,
    subtasks: [
      { id: 'sub-3-1', title: 'Chuẩn bị tài liệu mô tả đặc tả kỹ thuật API', completed: true },
      { id: 'sub-3-2', title: 'Gửi link Google Meet và lịch trình cuộc họp', completed: false },
    ],
  },
  {
    id: 'task-4',
    title: 'Ôn luyện 30 từ vựng tiếng Anh chuyên ngành công nghệ phần mềm',
    description: 'Sử dụng flashcard Anki ôn các thuật ngữ microservices, distributed systems và cloud architecture.',
    status: 'todo',
    priority: 'medium',
    projectId: 'proj-study',
    dueDate: getRelativeDate(0), // Today
    dueTime: '21:00',
    tags: ['Ngoại ngữ', 'Từ vựng', 'Kỹ năng'],
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-4-1', title: 'Học 15 từ vựng mới', completed: false },
      { id: 'sub-4-2', title: 'Luyện nghe & phát âm chuẩn IPA', completed: false },
    ],
  },
  {
    id: 'task-5',
    title: 'Kiểm tra sao lưu dữ liệu tự động và rà soát tường lửa máy chủ',
    description: 'Thực hiện kiểm thử phục hồi backup (disaster recovery drill) định kỳ hàng tháng cho database.',
    status: 'todo',
    priority: 'urgent',
    projectId: 'proj-work',
    dueDate: getRelativeDate(-1), // Overdue yesterday
    dueTime: '09:00',
    tags: ['DevOps', 'Bảo mật', 'Backup'],
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-5-1', title: 'Sao lưu snapshot máy chủ cơ sở dữ liệu', completed: true },
      { id: 'sub-5-2', title: 'Kiểm tra tính toàn vẹn file nén bản sao lưu', completed: false },
    ],
  },
  {
    id: 'task-6',
    title: 'Chạy bộ 5km công viên và tập giãn cơ buổi sáng',
    description: 'Duy trì nhịp tim vùng Zone 2 để rèn luyện sức bền tim mạch và tái tạo năng lượng.',
    status: 'done',
    priority: 'medium',
    projectId: 'proj-personal',
    dueDate: getRelativeDate(0),
    dueTime: '06:30',
    tags: ['Thể thao', 'Sức khỏe', 'Buổi sáng'],
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-6-1', title: 'Khởi động khớp 5 phút', completed: true },
      { id: 'sub-6-2', title: 'Chạy 5km tốc độ 6:15 min/km', completed: true },
      { id: 'sub-6-3', title: 'Giãn cơ bắp chân & hông', completed: true },
    ],
  },
  {
    id: 'task-7',
    title: 'Đọc 2 chương cuốn sách "Atomic Habits - Thay đổi tí hon"',
    description: 'Ghi chép lại 3 ý tưởng cốt lõi về việc xây dựng hệ thống thói quen thay vì chỉ tập trung vào mục tiêu.',
    status: 'done',
    priority: 'low',
    projectId: 'proj-study',
    dueDate: getRelativeDate(-2),
    tags: ['Đọc sách', 'Phát triển bản thân'],
    estimatedPomodoros: 2,
    completedPomodoros: 2,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-7-1', title: 'Đọc chương 4 & 5', completed: true },
      { id: 'sub-7-2', title: 'Take notes vào sổ tay', completed: true },
    ],
  },
  {
    id: 'task-8',
    title: 'Kiểm tra và cân đối ngân sách chi tiêu gia đình tháng này',
    description: 'Rà soát các khoản chi cố định, hóa đơn điện nước và quỹ đầu tư tích lũy.',
    status: 'in_review',
    priority: 'low',
    projectId: 'proj-personal',
    dueDate: getRelativeDate(4),
    tags: ['Tài chính', 'Gia đình'],
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-8-1', title: 'Cập nhật bảng thu chi Excel', completed: true },
      { id: 'sub-8-2', title: 'Thanh toán tiền điện & Internet', completed: true },
    ],
  },
];
