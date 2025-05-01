
import { useGoalStore } from "../store/goalStore";
import { format } from "date-fns";
import { Bell, Calendar, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotificationsPage = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useGoalStore();
  
  const sortedNotifications = [...notifications]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-5 w-5" />;
      case 'inactivity':
        return <Clock className="h-5 w-5" />;
      case 'achievement':
        return <Trophy className="h-5 w-5" />;
      case 'collaboration':
        return <Users className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={clearAllNotifications}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No notifications to display.</p>
          </Card>
        ) : (
          sortedNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`p-4 ${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex gap-4">
                <div className={`p-2 rounded-full ${
                  notification.type === 'deadline' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                  notification.type === 'achievement' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                  notification.type === 'inactivity' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
