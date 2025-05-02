
import { useState } from "react";
import { useGoalStore } from "../store/goalStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "../components/ThemeProvider";
import { 
  UserCircle, 
  Bell, 
  Shield, 
  Palette,
  Save, 
  Mail,
  Clock
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const { currentUser, isDarkMode, toggleDarkMode } = useGoalStore();
  const { isDarkMode: themeIsDarkMode, toggleDarkMode: themeToggleDarkMode } = useTheme();
  
  const [profile, setProfile] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    deadline: true,
    inactivity: false,
    achievements: true,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileSave = () => {
    // In a real app, this would update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleNotificationSave = () => {
    // In a real app, this would update the notification settings
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 md:w-fit">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="John Doe" 
                  value={profile.name} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="john@example.com" 
                  value={profile.email} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="pt-2">
                <Button onClick={handleProfileSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                Change your password here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="pt-2">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium">Email Notifications</span>
                  <span className="text-sm text-muted-foreground">Receive notifications via email</span>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={() => handleNotificationChange('email')} 
                />
              </div>
              
              <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium">Push Notifications</span>
                  <span className="text-sm text-muted-foreground">Receive push notifications</span>
                </div>
                <Switch 
                  checked={notifications.push} 
                  onCheckedChange={() => handleNotificationChange('push')} 
                />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Notification Types
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">Goal Deadlines</span>
                      <span className="text-sm text-muted-foreground">Get reminded about upcoming deadlines</span>
                    </div>
                    <Switch 
                      checked={notifications.deadline} 
                      onCheckedChange={() => handleNotificationChange('deadline')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">Inactivity Alerts</span>
                      <span className="text-sm text-muted-foreground">Get reminded if you haven't updated goals</span>
                    </div>
                    <Switch 
                      checked={notifications.inactivity} 
                      onCheckedChange={() => handleNotificationChange('inactivity')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">Achievements</span>
                      <span className="text-sm text-muted-foreground">Get notified when you reach milestones</span>
                    </div>
                    <Switch 
                      checked={notifications.achievements} 
                      onCheckedChange={() => handleNotificationChange('achievements')} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={handleNotificationSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium">Dark Mode</span>
                  <span className="text-sm text-muted-foreground">Toggle between light and dark themes</span>
                </div>
                <Switch 
                  checked={themeIsDarkMode} 
                  onCheckedChange={themeToggleDarkMode} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Manage your privacy preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium">Public Profile</span>
                  <span className="text-sm text-muted-foreground">Make your profile visible to other users</span>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium">Show Progress</span>
                  <span className="text-sm text-muted-foreground">Allow others to see your goal progress</span>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium">Show on Leaderboard</span>
                  <span className="text-sm text-muted-foreground">Allow your name on the leaderboard</span>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
