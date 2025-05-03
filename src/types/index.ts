
export type GoalCategory = 'Personal' | 'Work' | 'Health' | 'Education' | 'Finance' | 'Social';

export type GoalStatus = 'Completed' | 'In-Progress' | 'Pending';

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  deadline: Date;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  is_public: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streakCount: number;
  completedGoals: number;
};

export type Activity = {
  id: string;
  user_id: string;
  goal_id: string;
  action_type: 'created' | 'updated' | 'completed' | 'deleted';
  details: string;
  timestamp: Date;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  timestamp: Date;
  type: 'deadline' | 'inactivity' | 'achievement' | 'collaboration';
  goal_id?: string;
};
