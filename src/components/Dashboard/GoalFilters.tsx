
import { GoalCategory, GoalStatus } from '../../types';
import { useGoalStore } from '../../store/goalStore';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface GoalFiltersProps {
  filterCategory: GoalCategory | 'All';
  filterStatus: GoalStatus | 'All';
  onCategoryChange: (category: GoalCategory | 'All') => void;
  onStatusChange: (status: GoalStatus | 'All') => void;
}

export const GoalFilters = ({ 
  filterCategory, 
  filterStatus, 
  onCategoryChange, 
  onStatusChange 
}: GoalFiltersProps) => {
  
  const categories: (GoalCategory | 'All')[] = [
    'All', 
    'Personal', 
    'Work', 
    'Health', 
    'Education', 
    'Finance', 
    'Social'
  ];
  
  const statuses: (GoalStatus | 'All')[] = [
    'All', 
    'Pending', 
    'In-Progress', 
    'Completed'
  ];
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Filter by Category</h3>
        <ToggleGroup 
          type="single" 
          value={filterCategory} 
          onValueChange={(value) => value && onCategoryChange(value as GoalCategory | 'All')}
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <ToggleGroupItem 
              key={category} 
              value={category}
              variant="outline"
              size="sm"
              className="rounded-full text-sm"
            >
              {category}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Filter by Status</h3>
        <ToggleGroup 
          type="single" 
          value={filterStatus} 
          onValueChange={(value) => value && onStatusChange(value as GoalStatus | 'All')}
          className="flex flex-wrap gap-2"
        >
          {statuses.map((status) => (
            <ToggleGroupItem 
              key={status} 
              value={status}
              variant="outline"
              size="sm"
              className="rounded-full text-sm"
            >
              {status}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};
