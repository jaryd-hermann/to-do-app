export interface Task {
  id: string;
  user_id: string;
  date: string; // ISO date string
  title: string;
  is_completed: boolean;
  principle_id: string;
  goal_id?: string | null;
  position: number; // 0-3
  created_at: string;
  completed_at?: string | null;
}

export interface Principle {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  position: number;
  is_system_template: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  principle_id: string;
  status: 'active' | 'inactive' | 'achieved';
  position: number;
  created_at: string;
  achieved_at?: string | null;
}

export interface User {
  id: string;
  email: string;
  subscription_status: 'trial' | 'active' | 'expired';
  trial_started_at?: string | null;
}

export interface SystemHabit {
  id: string;
  title: string;
  created_at: string;
}

export interface UserHabit {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface SelectedHabit {
  id: string;
  user_id: string;
  habit_id: string;
  habit_type: 'system' | 'custom';
  created_at: string;
  // Joined data
  title?: string;
}

export interface DailyHabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  habit_type: 'system' | 'custom';
  date: string; // ISO date string
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}
