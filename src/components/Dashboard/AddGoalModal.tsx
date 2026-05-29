
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Goal, GoalCategory } from '../../types';
import { useForm } from 'react-hook-form';
import { useGoalStore } from '../../store/goalStore';

export interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoalFormValues {
  title: string;
  description: string;
  category: GoalCategory;
  deadline: Date;
  durationDays: number;
  isPublic: boolean;
}

export const AddGoalModal = ({ open, onOpenChange }: AddGoalModalProps) => {
  const { addGoal } = useGoalStore();
  
  const form = useForm<GoalFormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: 'Personal',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      durationDays: 30,
      isPublic: true
    }
  });
  
  const onSubmit = (values: GoalFormValues) => {
    addGoal({
      title: values.title,
      description: values.description,
      category: values.category,
      status: 'Pending',
      progress: 0,
      deadline: values.deadline,
      is_public: values.isPublic,
    });
    // Reset form after submission
    form.reset({
      title: '',
      description: '',
      category: 'Personal',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      durationDays: 30,
      isPublic: true
    });
    onOpenChange(false);
  };
  
  const categories: GoalCategory[] = [
    'Personal', 
    'Work', 
    'Health', 
    'Education', 
    'Finance', 
    'Social'
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter goal title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter goal description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="durationDays"
              rules={{ 
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 day" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complete In (Days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      placeholder="Enter number of days" 
                      {...field}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        field.onChange(val);
                        if (val > 0) {
                          const newDate = new Date();
                          newDate.setHours(0, 0, 0, 0);
                          newDate.setDate(newDate.getDate() + val);
                          form.setValue('deadline', newDate);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              rules={{ required: "Deadline is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          if (date) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const target = new Date(date);
                            target.setHours(0, 0, 0, 0);
                            const diffTime = target.getTime() - today.getTime();
                            const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
                            form.setValue('durationDays', diffDays);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public goal</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this goal visible to other users
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Goal</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
