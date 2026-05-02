import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Heart, 
  Brain, 
  Flame, 
  Users, 
  Activity, 
  Moon, 
  Droplets, 
  Utensils,
  Smile, 
  Frown, 
  Meh,
  BookOpen,
  GraduationCap,
  PenTool,
  Compass,
  Feather,
  Cloud,
  UserPlus,
  HeartHandshake,
  MessageCircle
} from "lucide-react";

export default function TrackersPage() {
  const { user } = useAuth();
  const [currentDimension, setCurrentDimension] = useState("physical");
  
  // Fetch tracker data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/trackers", currentDimension],
    enabled: !!user,
  });

  // Dimension icons mapping
  const dimensionIcons = {
    physical: <Heart className="h-5 w-5 text-emerald-600" />,
    emotional: <Smile className="h-5 w-5 text-gold-400" />,
    intellectual: <Brain className="h-5 w-5 text-indigo-400" />,
    spiritual: <Compass className="h-5 w-5 text-rose-500" />,
    relational: <Users className="h-5 w-5 text-purple-400" />
  };

  // Tracker item icons mapping
  const trackerIcons = {
    // Physical
    sleep: <Moon className="h-5 w-5" />,
    water: <Droplets className="h-5 w-5" />,
    food: <Utensils className="h-5 w-5" />,
    exercise: <Activity className="h-5 w-5" />,
    // Emotional
    mood: <Smile className="h-5 w-5" />,
    stress: <Flame className="h-5 w-5" />,
    // Intellectual
    learning: <BookOpen className="h-5 w-5" />,
    reading: <GraduationCap className="h-5 w-5" />,
    reflection: <PenTool className="h-5 w-5" />,
    // Spiritual
    meditation: <Feather className="h-5 w-5" />,
    prayer: <Cloud className="h-5 w-5" />,
    // Relational
    relationships: <UserPlus className="h-5 w-5" />,
    gratitude: <HeartHandshake className="h-5 w-5" />,
    social: <MessageCircle className="h-5 w-5" />
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8 animate-fade-in">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-urbanist font-bold text-white">Dimension Trackers</h1>
          <p className="text-gray-400 mt-2">Track and monitor your 5 dimensions of wellbeing</p>
        </header>

        <Tabs defaultValue="physical" value={currentDimension} onValueChange={setCurrentDimension} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="physical" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Physical</span>
            </TabsTrigger>
            <TabsTrigger value="emotional" className="flex items-center space-x-2">
              <Smile className="h-4 w-4" />
              <span className="hidden md:inline">Emotional</span>
            </TabsTrigger>
            <TabsTrigger value="intellectual" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Intellectual</span>
            </TabsTrigger>
            <TabsTrigger value="spiritual" className="flex items-center space-x-2">
              <Compass className="h-4 w-4" />
              <span className="hidden md:inline">Spiritual</span>
            </TabsTrigger>
            <TabsTrigger value="relational" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Relational</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Physical Dimension */}
          <TabsContent value="physical" className="space-y-6">
            <DimensionOverview 
              title="Physical Wellbeing"
              description="Monitor your physical health, habits, and bodily well-being"
              score={data?.score || 75}
              icon={dimensionIcons.physical}
              isLoading={isLoading}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TrackerCard 
                title="Sleep"
                value={data?.trackers?.sleep?.value || 7.5}
                unit="hours"
                target={data?.trackers?.sleep?.target || 8}
                icon={trackerIcons.sleep}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Water Intake"
                value={data?.trackers?.water?.value || 6}
                unit="glasses"
                target={data?.trackers?.water?.target || 8}
                icon={trackerIcons.water}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Nutrition"
                value={data?.trackers?.food?.value || 7}
                unit="quality score"
                target={data?.trackers?.food?.target || 10}
                icon={trackerIcons.food}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Exercise"
                value={data?.trackers?.exercise?.value || 30}
                unit="minutes"
                target={data?.trackers?.exercise?.target || 45}
                icon={trackerIcons.exercise}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          {/* Emotional Dimension */}
          <TabsContent value="emotional" className="space-y-6">
            <DimensionOverview 
              title="Emotional Wellbeing"
              description="Track your emotional states, moods, and feelings"
              score={data?.score || 60}
              icon={dimensionIcons.emotional}
              isLoading={isLoading}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrackerCard 
                title="Mood Check-in"
                value={data?.trackers?.mood?.value || 3.8}
                unit="/ 5"
                target={data?.trackers?.mood?.target || 5}
                icon={trackerIcons.mood}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Stress Level"
                value={data?.trackers?.stress?.value || 4}
                unit="/ 10"
                target={data?.trackers?.stress?.target || 3}
                icon={trackerIcons.stress}
                isLoading={isLoading}
                isInverse={true}
              />
              
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                    Emotional Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      <p>Track more emotional data to see trends</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Intellectual Dimension */}
          <TabsContent value="intellectual" className="space-y-6">
            <DimensionOverview 
              title="Intellectual Growth"
              description="Track your learning, knowledge acquisition, and mental expansion"
              score={data?.score || 85}
              icon={dimensionIcons.intellectual}
              isLoading={isLoading}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TrackerCard 
                title="Learning Time"
                value={data?.trackers?.learning?.value || 45}
                unit="minutes"
                target={data?.trackers?.learning?.target || 60}
                icon={trackerIcons.learning}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Reading Log"
                value={data?.trackers?.reading?.value || 18}
                unit="pages"
                target={data?.trackers?.reading?.target || 25}
                icon={trackerIcons.reading}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Reflection Journal"
                value={data?.trackers?.reflection?.value || 1}
                unit="entries"
                target={data?.trackers?.reflection?.target || 1}
                icon={trackerIcons.reflection}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          {/* Spiritual Dimension */}
          <TabsContent value="spiritual" className="space-y-6">
            <DimensionOverview 
              title="Spiritual Connection"
              description="Monitor your sense of purpose, meaning, and connection to something greater"
              score={data?.score || 40}
              icon={dimensionIcons.spiritual}
              isLoading={isLoading}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TrackerCard 
                title="Meditation"
                value={data?.trackers?.meditation?.value || 8}
                unit="minutes"
                target={data?.trackers?.meditation?.target || 20}
                icon={trackerIcons.meditation}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Prayer/Reflection"
                value={data?.trackers?.prayer?.value || 0}
                unit="sessions"
                target={data?.trackers?.prayer?.target || 2}
                icon={trackerIcons.prayer}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          {/* Relational Dimension */}
          <TabsContent value="relational" className="space-y-6">
            <DimensionOverview 
              title="Relational Harmony"
              description="Track your connections with others, boundaries, and social wellbeing"
              score={data?.score || 65}
              icon={dimensionIcons.relational}
              isLoading={isLoading}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TrackerCard 
                title="Key Relationships"
                value={data?.trackers?.relationships?.value || 3}
                unit="interactions"
                target={data?.trackers?.relationships?.target || 5}
                icon={trackerIcons.relationships}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Gratitude Practice"
                value={data?.trackers?.gratitude?.value || 2}
                unit="entries"
                target={data?.trackers?.gratitude?.target || 3}
                icon={trackerIcons.gratitude}
                isLoading={isLoading}
              />
              
              <TrackerCard 
                title="Social Balance"
                value={data?.trackers?.social?.value || 6}
                unit="/ 10"
                target={data?.trackers?.social?.target || 8}
                icon={trackerIcons.social}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function DimensionOverview({ title, description, score, icon, isLoading }) {
  return (
    <Card className="cosmic-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-night-700 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-urbanist font-semibold text-white">{title}</h3>
            <p className="text-gray-400">{description}</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-2xl font-bold text-white">{score}/100</span>
                <span className="text-sm text-gray-400">Dimension Score</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackerCard({ title, value, unit, target, icon, isLoading, isInverse = false }) {
  const progress = isInverse 
    ? Math.max(0, Math.min(100, 100 - ((value / target) * 100)))
    : Math.max(0, Math.min(100, (value / target) * 100));
  
  return (
    <Card className="cosmic-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-bold text-white">{value}</span>
              <span className="text-sm text-gray-400">{unit}</span>
            </div>
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>{isInverse ? `Target: ${target} or less` : `Target: ${target}`}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
