
import { useGoalStore } from "../../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award } from "lucide-react";

export const Leaderboard = () => {
  const { users } = useGoalStore();
  
  // Sort users by streak count (descending)
  const sortedUsers = [...users].sort((a, b) => b.streakCount - a.streakCount);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {sortedUsers.map((user, index) => (
          <div 
            key={user.id} 
            className={`flex items-center justify-between py-2 ${
              index !== sortedUsers.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                {index === 0 && (
                  <span className="absolute -top-1 -right-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.completedGoals} goals completed</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{user.streakCount}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
