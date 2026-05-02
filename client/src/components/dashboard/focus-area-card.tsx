import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Brain, Smile, Compass, Users, CheckCircle2 } from "lucide-react";

interface FocusAreaCardProps {
  focusArea: string;
  focusScore: number;
  activities: string[];
  isLoading?: boolean;
}

export default function FocusAreaCard({
  focusArea,
  focusScore,
  activities,
  isLoading = false
}: FocusAreaCardProps) {
  const dimensionIcons = {
    physical: <Heart className="h-5 w-5 text-emerald-600" />,
    emotional: <Smile className="h-5 w-5 text-gold-400" />,
    intellectual: <Brain className="h-5 w-5 text-indigo-400" />,
    spiritual: <Compass className="h-5 w-5 text-rose-500" />,
    relational: <Users className="h-5 w-5 text-purple-400" />
  };

  const getFocusIcon = () => {
    return dimensionIcons[focusArea as keyof typeof dimensionIcons] || dimensionIcons.spiritual;
  };

  if (isLoading) {
    return (
      <Card className="cosmic-card rounded-xl p-5 flex flex-col">
        <div className="flex items-center mb-4">
          <Skeleton className="h-6 w-40" />
        </div>
        
        <Skeleton className="h-16 w-full rounded-lg mb-4" />
        
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        
        <Skeleton className="h-12 w-full mt-auto" />
      </Card>
    );
  }

  return (
    <Card className="cosmic-card rounded-xl p-5 flex flex-col">
      <h3 className="text-lg font-urbanist font-semibold text-white mb-4 flex items-center">
        {getFocusIcon()}
        <span className="ml-2">Today's Focus: {focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}</span>
      </h3>
      
      <div className="bg-night-700 rounded-lg p-4 mb-4">
        <p className="text-gray-300">
          Your {focusArea} dimension score is at <span className="text-rose-500 font-medium">{focusScore}%</span>, indicating an opportunity for growth and reflection.
        </p>
      </div>
      
      <h4 className="font-medium text-white mb-2">Recommended Activities:</h4>
      <ul className="space-y-2 text-gray-300 mb-4">
        {activities.map((activity, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
            {activity}
          </li>
        ))}
      </ul>
      
      <Button className="mt-auto bg-indigo-900 hover:bg-indigo-800 text-white font-medium">
        Start {focusArea.charAt(0).toUpperCase() + focusArea.slice(1)} Session
      </Button>
    </Card>
  );
}
