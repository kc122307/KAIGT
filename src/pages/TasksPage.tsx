
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

const TasksPage = () => {
  const goals = useGoalStore((state) => state.goals);
  const updateGoalProgress = useGoalStore((state) => state.updateGoalProgress);
  const [filterValue, setFilterValue] = useState<string>("all");

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filter
                {filterValue !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {filterValue}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {Object.keys(tasksByCategory).length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <ListChecks className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No tasks found</h3>
              <p className="text-muted-foreground">
                {filterValue === "all"
                  ? "You have no tasks yet. Create a new task to get started."
                  : `No ${filterValue} tasks found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(tasksByCategory).map(([category, tasks]) => (
          <Card key={category}>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={task.progress === 100}
                      onCheckedChange={(checked) =>
                        handleProgressChange(task.id, checked as boolean)
                      }
                    />
                    <div>
                      <p className={task.progress === 100 ? "line-through text-muted-foreground" : ""}>{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === "Completed"
                        ? "default"
                        : task.status === "In-Progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default TasksPage;
