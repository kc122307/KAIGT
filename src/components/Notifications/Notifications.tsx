
import { useState } from "react";
import { useGoalStore } from "../../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, X, Calendar, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { Notification } from "../../types";

export const Notifications = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useGoalStore();
  
  // Sort notifications by timestamp (newest first) and filter unread
  const sortedNotifications = [...notifications]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const unreadNotifications = sortedNotifications.filter(n => !n.is_read);
  const hasUnread = unreadNotifications.length > 0;
  
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      case 'inactivity':
        return <Clock className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {hasUnread && (
            <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadNotifications.length}
            </span>
          )}
        </CardTitle>
        {hasUnread && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7"
            onClick={clearAllNotifications}
          >
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {sortedNotifications.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No notifications.
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-auto">
            {sortedNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex gap-3 p-2 rounded-md ${
                  notification.is_read ? "opacity-75" : "bg-muted/60"
                }`}
              >
                <div className={`p-1 rounded-md ${
                  notification.type === 'deadline' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                  notification.type === 'achievement' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                  notification.type === 'inactivity' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.is_read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
