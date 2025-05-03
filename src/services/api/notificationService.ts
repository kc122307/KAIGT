
import { Notification } from '../../types';
import { generateId } from '../utils';

// In-memory storage (simulates a database)
let notifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Goal Deadline Approaching',
    message: 'Your goal "Complete React Project" is due in 7 days',
    isRead: false,
    timestamp: new Date('2025-05-23T08:00:00'),
    type: 'deadline',
    goalId: '1',
  },
  {
    id: '2',
    userId: '1',
    title: 'Achievement Unlocked',
    message: 'Congratulations! You completed "Read 12 Books"',
    isRead: true,
    timestamp: new Date('2025-04-15T14:30:00'),
    type: 'achievement',
    goalId: '5',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all notifications for a user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(300); // Simulate API call
  return notifications.filter(notification => notification.userId === userId);
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  await delay(200);
  return notifications.filter(notification => notification.userId === userId && !notification.isRead).length;
};

// Add a new notification
export const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<Notification> => {
  await delay(300);
  
  const newNotification: Notification = {
    id: generateId(),
    ...notificationData,
    timestamp: new Date(),
    isRead: false
  };
  
  notifications = [...notifications, newNotification];
  
  return newNotification;
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  await delay(200);
  
  const notificationIndex = notifications.findIndex(notification => notification.id === notificationId);
  if (notificationIndex === -1) {
    throw new Error("Notification not found");
  }
  
  const updatedNotification = { ...notifications[notificationIndex], isRead: true };
  
  notifications = [
    ...notifications.slice(0, notificationIndex),
    updatedNotification,
    ...notifications.slice(notificationIndex + 1)
  ];
  
  return updatedNotification;
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  await delay(400);
  
  notifications = notifications.map(notification => 
    notification.userId === userId 
      ? { ...notification, isRead: true } 
      : notification
  );
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await delay(300);
  
  notifications = notifications.filter(notification => notification.id !== notificationId);
};
