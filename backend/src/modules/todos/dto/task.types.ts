export interface NormalizedTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  dueTime: string | null;
  completedAt: string | null;
  starred: boolean;
  userId: string;
  listId: string | null;
  list: { id: string; name: string } | null;
  tags: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStats {
  pending: number;
  completed: number;
  overdue: number;
  total: number;
}

export interface TodayStats {
  todayTotal: number;
  todayCompleted: number;
  todayRemaining: number;
  overdue: number;
}

export interface UpcomingGroup {
  tomorrow: NormalizedTask[];
  thisWeek: NormalizedTask[];
  nextWeek: NormalizedTask[];
  later: NormalizedTask[];
}

export interface UpcomingStats {
  tomorrow: number;
  thisWeek: number;
  nextWeek: number;
  later: number;
}
