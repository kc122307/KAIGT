
export type GoalCategory = 'Personal' | 'Work' | 'Health' | 'Education' | 'Finance' | 'Social';

export type GoalStatus = 'Completed' | 'In-Progress' | 'Pending';

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  collaborators?: User[];
  isPublic: boolean;
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
  userId: string;
  goalId: string;
  actionType: 'created' | 'updated' | 'completed' | 'deleted';
  timestamp: Date;
  details: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  type: 'deadline' | 'inactivity' | 'achievement' | 'collaboration';
  goalId?: string;
};
