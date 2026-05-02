import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  dimension: string;
  completed: number;
  total: number;
  progress: number;
  deadline?: string;
}

interface GoalsCardProps {
  goals: Goal[];
  isLoading?: boolean;
}

export default function GoalsCard({ goals = [], isLoading = false }: GoalsCardProps) {
  // Get color classes based on dimension
  const getDimensionColorClasses = (dimension: string) => {
    const borderColorMap = {
      physical: "border-emerald-600",
      emotional: "border-gold-400",
      intellectual: "border-indigo-600",
      spiritual: "border-rose-500",
      relational: "border-purple-400"
    };
    
    const textColorMap = {
      physical: "text-emerald-400",
      emotional: "text-gold-400",
      intellectual: "text-indigo-400",
      spiritual: "text-rose-400",
      relational: "text-purple-400"
    };
    
    const bgColorMap = {
      physical: "bg-emerald-600",
      emotional: "bg-gold-400",
      intellectual: "bg-indigo-600",
      spiritual: "bg-rose-500",
      relational: "bg-purple-400"
    };
    
    return {
      border: borderColorMap[dimension as keyof typeof borderColorMap] || "border-gray-600",
      text: textColorMap[dimension as keyof typeof textColorMap] || "text-gray-400",
      bg: bgColorMap[dimension as keyof typeof bgColorMap] || "bg-gray-600"
    };
  };

  // Sample goals for loading state
  const defaultGoals = [
    {
      id: "1",
      title: "Complete 30-Day Meditation Challenge",
      dimension: "physical",
      completed: 22,
      total: 30,
      progress: 75,
      deadline: "Sep 15, 2023"
    },
    {
      id: "2",
      title: "Read 12 Personal Growth Books",
      dimension: "intellectual",
      completed: 5,
      total: 12,
      progress: 42
    },
    {
      id: "3",
      title: "Weekly Quality Time with Family",
      dimension: "relational",
      completed: 3,
      total: 5,
      progress: 60
    }
  ];

  const displayGoals = isLoading ? [] : (goals.length > 0 ? goals : defaultGoals);

  if (isLoading) {
    return (
      <Card className="cosmic-card rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        
        <Skeleton className="h-10 w-full mt-4" />
      </Card>
    );
  }

  return (
    <Card className="cosmic-card rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-urbanist font-medium text-white">Active Goals</h3>
        <Button variant="link" size="sm" className="text-indigo-400 hover:text-indigo-300 p-0">View All</Button>
      </div>
      
      <div className="space-y-4">
        {displayGoals.map((goal) => (
          <div key={goal.id} className={`p-4 bg-night-700 rounded-lg border-l-4 ${getDimensionColorClasses(goal.dimension).border}`}>
            <div className="flex justify-between mb-2">
              <h4 className="font-medium text-white">{goal.title}</h4>
              <span className="text-xs bg-night-600 text-gray-300 rounded-full px-2 py-1 flex items-center">
                {goal.dimension.charAt(0).toUpperCase() + goal.dimension.slice(1)}
              </span>
            </div>
            <div className="w-full h-2 bg-night-800 rounded-full mb-2">
              <div 
                className={`h-2 rounded-full ${getDimensionColorClasses(goal.dimension).bg}`} 
                style={{ width: `${goal.progress}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{goal.completed}/{goal.total} {goal.dimension === 'relational' ? 'weeks' : goal.dimension === 'intellectual' ? 'books' : 'days'} completed</span>
              <span className={getDimensionColorClasses(goal.dimension).text}>{goal.progress}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full mt-4 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400">
        <Plus className="h-4 w-4 mr-2" />
        Add Goal
      </Button>
    </Card>
  );
}
