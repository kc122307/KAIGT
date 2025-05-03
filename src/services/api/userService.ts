
import { User } from '../../types';
import { generateId } from '../utils';

// In-memory storage (simulates a database)
let users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    streakCount: 7,
    completedGoals: 12,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    streakCount: 5,
    completedGoals: 8,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    streakCount: 10,
    completedGoals: 15,
  },
];

// Current logged in user
let currentUser: User | null = users[0]; // Default to first user for development

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all users
export const getUsers = async (): Promise<User[]> => {
  await delay(300); // Simulate API call
  return [...users];
};

// Get a specific user
export const getUserById = async (userId: string): Promise<User | undefined> => {
  await delay(200);
  return users.find(user => user.id === userId);
};

// Get current authenticated user
export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Login a user
export const login = async (email: string, password: string): Promise<User> => {
  await delay(800); // Longer delay to simulate authentication
  
  const user = users.find(user => user.email === email);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  // In a real app, we would validate the password here
  
  currentUser = user;
  return user;
};

// Register a new user
export const register = async (name: string, email: string, password: string): Promise<User> => {
  await delay(1000);
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    throw new Error("Email already registered");
  }
  
  const newUser: User = {
    id: generateId(),
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    streakCount: 0,
    completedGoals: 0,
  };
  
  users = [...users, newUser];
  currentUser = newUser;
  
  return newUser;
};

// Logout current user
export const logout = async (): Promise<void> => {
  await delay(300);
  currentUser = null;
};

// Update user streak count
export const updateUserStreakCount = async (userId: string, streakCount: number): Promise<User> => {
  await delay(300);
  
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  
  const updatedUser = { ...users[userIndex], streakCount };
  
  users = [
    ...users.slice(0, userIndex),
    updatedUser,
    ...users.slice(userIndex + 1)
  ];
  
  if (currentUser && currentUser.id === userId) {
    currentUser = updatedUser;
  }
  
  return updatedUser;
};

// Increment completed goals count
export const incrementCompletedGoals = async (userId: string): Promise<User> => {
  await delay(300);
  
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  
  const updatedUser = { 
    ...users[userIndex], 
    completedGoals: users[userIndex].completedGoals + 1 
  };
  
  users = [
    ...users.slice(0, userIndex),
    updatedUser,
    ...users.slice(userIndex + 1)
  ];
  
  if (currentUser && currentUser.id === userId) {
    currentUser = updatedUser;
  }
  
  return updatedUser;
};
