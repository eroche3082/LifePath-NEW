import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Plus, BookOpen, Wind, Moon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Ritual {
  id: string;
  title: string;
  time: string;
  description: string;
  dimension: string;
  completed: boolean;
}

interface RitualsCardProps {
  rituals: Ritual[];
  isLoading?: boolean;
}

export default function RitualsCard({ rituals = [], isLoading = false }: RitualsCardProps) {
  // Ritual completion mutation
  const completeRitualMutation = useMutation({
    mutationFn: async (ritualId: string) => {
      const res = await apiRequest("POST", `/api/rituals/${ritualId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    }
  });

  // Get ritual icon based on title or dimension
  const getRitualIcon = (ritual: Ritual) => {
    const title = ritual.title.toLowerCase();
    if (title.includes('read') || title.includes('book')) {
      return <BookOpen className="h-5 w-5 text-indigo-300" />;
    } else if (title.includes('breath') || title.includes('meditation')) {
      return <Wind className="h-5 w-5 text-emerald-600" />;
    } else if (title.includes('evening') || title.includes('sleep')) {
      return <Moon className="h-5 w-5 text-gold-400" />;
    }
    
    // Default icons based on dimension
    const dimensionIcons = {
      physical: <ActivitiesSVG className="h-5 w-5 text-emerald-600" />,
      emotional: <HeartSVG className="h-5 w-5 text-gold-400" />,
      intellectual: <BookSVG className="h-5 w-5 text-indigo-300" />,
      spiritual: <MeditationSVG className="h-5 w-5 text-rose-500" />,
      relational: <PeopleSVG className="h-5 w-5 text-purple-400" />
    };
    
    return dimensionIcons[ritual.dimension as keyof typeof dimensionIcons] || <ActivitiesSVG className="h-5 w-5 text-emerald-600" />;
  };

  // Get color classes based on dimension
  const getDimensionColorClasses = (dimension: string) => {
    const colorMap = {
      physical: { bg: "bg-emerald-900", text: "text-emerald-300" },
      emotional: { bg: "bg-gold-900", text: "text-gold-300" },
      intellectual: { bg: "bg-indigo-900", text: "text-indigo-300" },
      spiritual: { bg: "bg-rose-900", text: "text-rose-300" },
      relational: { bg: "bg-purple-900", text: "text-purple-300" }
    };
    
    return colorMap[dimension as keyof typeof colorMap] || { bg: "bg-night-600", text: "text-gray-300" };
  };

  // Sample rituals for loading state
  const defaultRituals = [
    {
      id: "1",
      title: "Morning Reading",
      time: "7:30 AM",
      description: "15 minutes of inspirational content",
      dimension: "intellectual",
      completed: true
    },
    {
      id: "2",
      title: "Breathwork Session",
      time: "12:15 PM",
      description: "5-minute energizing practice",
      dimension: "physical",
      completed: false
    },
    {
      id: "3",
      title: "Evening Reflection",
      time: "9:00 PM",
      description: "Gratitude practice and journaling",
      dimension: "emotional",
      completed: false
    }
  ];

  const displayRituals = isLoading ? [] : (rituals.length > 0 ? rituals : defaultRituals);

  if (isLoading) {
    return (
      <Card className="cosmic-card rounded-xl p-5">
        <CardHeader className="pb-2 px-0">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cosmic-card rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-urbanist font-medium text-white">Daily Rituals</h3>
        <Button variant="link" size="sm" className="text-indigo-400 hover:text-indigo-300 p-0">View All</Button>
      </div>
      
      <div className="space-y-3">
        {displayRituals.map((ritual) => (
          <div key={ritual.id} className="flex items-center p-3 bg-night-700 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-night-800 flex items-center justify-center mr-3 flex-shrink-0">
              {getRitualIcon(ritual)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-white">{ritual.title}</h4>
                <span className={`text-xs ${getDimensionColorClasses(ritual.dimension).bg} ${getDimensionColorClasses(ritual.dimension).text} rounded-full px-2 py-1`}>
                  {ritual.time}
                </span>
              </div>
              <p className="text-sm text-gray-400">{ritual.description}</p>
            </div>
            <div className="ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`p-2 rounded-full hover:bg-night-600 transition ${ritual.completed ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'}`}
                onClick={() => completeRitualMutation.mutate(ritual.id)}
                disabled={ritual.completed || completeRitualMutation.isPending}
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full mt-4 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400">
        <Plus className="h-4 w-4 mr-2" />
        Add Ritual
      </Button>
    </Card>
  );
}

// SVG Components
function ActivitiesSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function HeartSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function BookSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function MeditationSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
      <path d="M12 16v.01"></path>
      <path d="M12 8a2 2 0 0 1 2 2c0 1.1-.9 2-2 2a2 2 0 0 1-2-2c0-1.1.9-2 2-2z"></path>
    </svg>
  );
}

function PeopleSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
