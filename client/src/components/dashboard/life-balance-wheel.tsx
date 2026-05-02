import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

type Dimensions = {
  physical: number;
  emotional: number;
  intellectual: number;
  spiritual: number;
  relational: number;
};

interface LifeBalanceWheelProps {
  dimensions: Dimensions;
  balanceScore: number;
  focusArea: string;
  isLoading?: boolean;
}

export default function LifeBalanceWheel({ 
  dimensions, 
  balanceScore, 
  focusArea, 
  isLoading = false 
}: LifeBalanceWheelProps) {
  // Calculate stroke-dasharray and stroke-dashoffset for each circle
  const calculateCircleValues = (radius: number, percentage: number) => {
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - percentage / 100);
    return { dashArray, dashOffset };
  };

  if (isLoading) {
    return (
      <Card className="cosmic-card rounded-xl p-5 md:grid-span-1">
        <div className="flex flex-col items-center">
          <Skeleton className="w-56 h-56 rounded-full" />
          <div className="mt-4 text-center">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="cosmic-card rounded-xl p-5 md:grid-span-1">
      <div className="flex flex-col items-center">
        <div className="relative w-56 h-56 mx-auto my-4">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background circles */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="#2A2A5D" strokeWidth="12" />
            
            {/* Physical - outer ring */}
            <circle 
              className="progress-ring__circle" 
              cx="60" 
              cy="60" 
              r="54" 
              fill="none" 
              stroke="#4CB782" 
              strokeWidth="12" 
              strokeDasharray={calculateCircleValues(54, dimensions.physical).dashArray}
              strokeDashoffset={calculateCircleValues(54, dimensions.physical).dashOffset}
              transform="rotate(-90 60 60)" 
            />
            
            {/* Emotional - second ring */}
            <circle 
              className="progress-ring__circle" 
              cx="60" 
              cy="60" 
              r="42" 
              fill="none" 
              stroke="#DFC98A" 
              strokeWidth="12" 
              strokeDasharray={calculateCircleValues(42, dimensions.emotional).dashArray}
              strokeDashoffset={calculateCircleValues(42, dimensions.emotional).dashOffset}
              transform="rotate(-90 60 60)" 
            />
            
            {/* Intellectual - third ring */}
            <circle 
              className="progress-ring__circle" 
              cx="60" 
              cy="60" 
              r="30" 
              fill="none" 
              stroke="#3D7D6C" 
              strokeWidth="12" 
              strokeDasharray={calculateCircleValues(30, dimensions.intellectual).dashArray}
              strokeDashoffset={calculateCircleValues(30, dimensions.intellectual).dashOffset}
              transform="rotate(-90 60 60)" 
            />
            
            {/* Spiritual - inner ring */}
            <circle 
              className="progress-ring__circle" 
              cx="60" 
              cy="60" 
              r="18" 
              fill="none" 
              stroke="#F87272" 
              strokeWidth="12" 
              strokeDasharray={calculateCircleValues(18, dimensions.spiritual).dashArray}
              strokeDashoffset={calculateCircleValues(18, dimensions.spiritual).dashOffset}
              transform="rotate(-90 60 60)" 
            />
            
            {/* Center circle */}
            <circle cx="60" cy="60" r="9" fill="#121827" />
          </svg>
          
          {/* Labels positioned around the wheel */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-center">
            <div className="bg-emerald-600 text-white text-xs rounded-full px-3 py-1">Physical</div>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 text-center">
            <div className="bg-gold-400 text-night-900 text-xs rounded-full px-3 py-1">Emotional</div>
          </div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 text-center">
            <div className="bg-indigo-900 text-white text-xs rounded-full px-3 py-1">Intellectual</div>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 text-center">
            <div className="bg-rose-500 text-white text-xs rounded-full px-3 py-1">Spiritual</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-white">Balance Score: {balanceScore}/100</p>
          <p className="text-sm text-gray-400">
            Your {focusArea} dimension needs attention
          </p>
        </div>
      </div>
    </Card>
  );
}
