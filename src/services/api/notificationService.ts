
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '../../types';

// Get all notifications for a user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data.map(notification => ({
    ...notification,
    timestamp: new Date(notification.timestamp),
    type: notification.type as Notification['type']
  }));
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }

  return count || 0;
};

// Add a new notification
export const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'is_read'>): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notificationData,
      is_read: false
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding notification:', error);
    throw error;
  }

  return {
    ...data,
    timestamp: new Date(data.timestamp),
    type: data.type as Notification['type']
  };
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }

  return {
    ...data,
    timestamp: new Date(data.timestamp),
    type: data.type as Notification['type']
  };
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
