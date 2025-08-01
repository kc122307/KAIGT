
import { useState } from "react";
import { useGoalStore } from "../store/goalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListChecks } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "../hooks/useGSAP";

const TasksPage = () => {
  const goals = useGoalStore((state) => state.goals);
  const updateGoalProgress = useGoalStore((state) => state.updateGoalProgress);
  const [filterValue, setFilterValue] = useState<string>("all");
  const { containerRef } = useGSAP();

  // Group goals by category as "tasks"
  const tasksByCategory = goals.reduce((acc, goal) => {
    if (goal.status === "Completed" && filterValue !== "all" && filterValue !== "completed") {
      return acc;
    }
    if (goal.status !== "Completed" && filterValue === "completed") {
      return acc;
    }

    const category = goal.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(goal);
    return acc;
  }, {} as Record<string, typeof goals>);

  const handleProgressChange = (goalId: string, isCompleted: boolean) => {
    updateGoalProgress(goalId, isCompleted ? 100 : 0);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 scroll-fade">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Tasks Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage and track your goals as tasks</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hover:scale-105 transition-transform duration-200">
                Filter
                {filterValue !== "all" && (
                  <Badge variant="secondary" className="ml-2 animate-pulse">
                    {filterValue}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filterValue}
                onValueChange={setFilterValue}
              >
                <DropdownMenuRadioItem value="all">
                  All Tasks
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="in-progress">
                  In Progress
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">
                  Completed
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {Object.keys(tasksByCategory).length === 0 ? (
        <Card className="text-center py-12 scroll-fade animate-fade-in">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <ListChecks className="h-16 w-16 text-muted-foreground animate-bounce" />
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-purple-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                No tasks found
              </h3>
              <p className="text-muted-foreground max-w-md">
                {filterValue === "all"
                  ? "Transform your goals into actionable tasks. Create your first task to get started on your journey!"
                  : `No ${filterValue} tasks found. Try adjusting your filter or create new tasks.`}
              </p>
              <Button 
                variant="outline" 
                className="mt-4 hover:scale-105 transition-all duration-200 border-purple-200 hover:border-purple-300"
              >
                Create Your First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByCategory).map(([category, tasks], categoryIndex) => (
            <Card 
              key={category} 
              className="scroll-fade hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:border-l-blue-500" 
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <CardHeader className="py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
                  {category}
                  <Badge variant="outline" className="ml-auto">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 group"
                    style={{ animationDelay: `${(categoryIndex * 0.1) + (taskIndex * 0.05)}s` }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative">
                        <Checkbox
                          checked={task.progress === 100}
                          onCheckedChange={(checked) =>
                            handleProgressChange(task.id, checked as boolean)
                          }
                          className="transition-all duration-200 group-hover:scale-110"
                        />
                        {task.progress === 100 && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-all duration-200 ${
                          task.progress === 100 
                            ? "line-through text-muted-foreground" 
                            : "group-hover:text-purple-600 dark:group-hover:text-purple-400"
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <Badge
                        variant={
                          task.status === "Completed"
                            ? "default"
                            : task.status === "In-Progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="transition-all duration-200 group-hover:scale-105"
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
