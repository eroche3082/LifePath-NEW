import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Brain, Smile, Compass, Users, Target, Calendar, Plus, CheckCircle, X } from "lucide-react";

export default function GoalsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("goals");
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [ritualDialogOpen, setRitualDialogOpen] = useState(false);
  
  // Fetch goals data
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });
  
  // Fetch rituals data
  const { data: ritualsData, isLoading: ritualsLoading } = useQuery({
    queryKey: ["/api/rituals"],
    enabled: !!user,
  });

  // Complete goal mutation
  const completeGoalStepMutation = useMutation({
    mutationFn: async ({ goalId, step }) => {
      const res = await apiRequest("POST", `/api/goals/${goalId}/complete-step`, { step });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    }
  });

  // Complete ritual mutation
  const completeRitualMutation = useMutation({
    mutationFn: async (ritualId) => {
      const res = await apiRequest("POST", `/api/rituals/${ritualId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rituals"] });
    }
  });

  return (
    <AppShell>
      <div className="p-4 md:p-8 animate-fade-in">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-urbanist font-bold text-white">Goals & Rituals</h1>
          <p className="text-gray-400 mt-2">Set intentions and create daily practices for alignment</p>
        </header>

        <Tabs defaultValue="goals" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </TabsTrigger>
            <TabsTrigger value="rituals" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Daily Rituals</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-urbanist font-semibold text-white">Active Goals</h2>
              <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-900 hover:bg-indigo-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="cosmic-card border-indigo-950 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Set a specific, measurable goal for any dimension of your life
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input
                        id="goal-title"
                        placeholder="What do you want to achieve?"
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-dimension">Dimension</Label>
                      <Select>
                        <SelectTrigger className="bg-night-700 border-night-600">
                          <SelectValue placeholder="Select a dimension" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Physical</SelectItem>
                          <SelectItem value="emotional">Emotional</SelectItem>
                          <SelectItem value="intellectual">Intellectual</SelectItem>
                          <SelectItem value="spiritual">Spiritual</SelectItem>
                          <SelectItem value="relational">Relational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-steps">Total Steps</Label>
                      <Input
                        id="goal-steps"
                        type="number"
                        min="1"
                        placeholder="How many steps to complete this goal?"
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-deadline">Target Date (Optional)</Label>
                      <Input
                        id="goal-deadline"
                        type="date"
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setGoalDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-900 hover:bg-indigo-800">
                      Create Goal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goalsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))
              ) : goalsData?.goals?.length > 0 ? (
                goalsData.goals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onCompleteStep={(step) => completeGoalStepMutation.mutate({ goalId: goal.id, step })} 
                  />
                ))
              ) : (
                <div className="col-span-full text-center p-10 cosmic-card rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-2">No Active Goals</h3>
                  <p className="text-gray-400 mb-6">Start setting goals to track your progress across all dimensions</p>
                  <Button onClick={() => setGoalDialogOpen(true)} className="bg-indigo-900 hover:bg-indigo-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Rituals Tab */}
          <TabsContent value="rituals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-urbanist font-semibold text-white">Daily Rituals</h2>
              <Dialog open={ritualDialogOpen} onOpenChange={setRitualDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ritual
                  </Button>
                </DialogTrigger>
                <DialogContent className="cosmic-card border-indigo-950 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Daily Ritual</DialogTitle>
                    <DialogDescription>
                      Establish consistent practices to enhance your wellbeing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="ritual-title">Ritual Name</Label>
                      <Input
                        id="ritual-title"
                        placeholder="What practice do you want to establish?"
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ritual-dimension">Dimension</Label>
                      <Select>
                        <SelectTrigger className="bg-night-700 border-night-600">
                          <SelectValue placeholder="Select a dimension" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Physical</SelectItem>
                          <SelectItem value="emotional">Emotional</SelectItem>
                          <SelectItem value="intellectual">Intellectual</SelectItem>
                          <SelectItem value="spiritual">Spiritual</SelectItem>
                          <SelectItem value="relational">Relational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ritual-time">Preferred Time</Label>
                      <Input
                        id="ritual-time"
                        type="time"
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ritual-duration">Duration (minutes)</Label>
                      <Input
                        id="ritual-duration"
                        type="number"
                        min="1"
                        placeholder="How long does this ritual take?"
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setRitualDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Create Ritual
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ritualsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))
              ) : ritualsData?.rituals?.length > 0 ? (
                ritualsData.rituals.map((ritual) => (
                  <RitualCard 
                    key={ritual.id} 
                    ritual={ritual} 
                    onComplete={() => completeRitualMutation.mutate(ritual.id)} 
                  />
                ))
              ) : (
                <div className="col-span-full text-center p-10 cosmic-card rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-2">No Daily Rituals</h3>
                  <p className="text-gray-400 mb-6">Establish consistent practices to enhance your wellbeing</p>
                  <Button onClick={() => setRitualDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ritual
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function GoalCard({ goal, onCompleteStep }) {
  const dimensionColors = {
    physical: "border-emerald-600",
    emotional: "border-gold-400",
    intellectual: "border-indigo-600",
    spiritual: "border-rose-500",
    relational: "border-purple-400"
  };
  
  const dimensionIcons = {
    physical: <Heart className="h-5 w-5 text-emerald-600" />,
    emotional: <Smile className="h-5 w-5 text-gold-400" />,
    intellectual: <Brain className="h-5 w-5 text-indigo-600" />,
    spiritual: <Compass className="h-5 w-5 text-rose-500" />,
    relational: <Users className="h-5 w-5 text-purple-400" />
  };
  
  const progress = (goal.completed / goal.total) * 100;
  
  return (
    <Card className={`cosmic-card border-l-4 ${dimensionColors[goal.dimension]}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg text-white">{goal.title}</CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-night-600 text-gray-300 flex items-center">
            {dimensionIcons[goal.dimension]}
            <span className="ml-1">{goal.dimension.charAt(0).toUpperCase() + goal.dimension.slice(1)}</span>
          </span>
        </div>
        <CardDescription>
          {goal.deadline ? `Target date: ${goal.deadline}` : "Ongoing goal"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full h-2 bg-night-800 rounded-full">
          <div 
            className={`h-2 rounded-full ${goal.dimension === 'physical' ? 'bg-emerald-600' : 
            goal.dimension === 'emotional' ? 'bg-gold-400' : 
            goal.dimension === 'intellectual' ? 'bg-indigo-600' : 
            goal.dimension === 'spiritual' ? 'bg-rose-500' : 'bg-purple-400'}`}
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{goal.completed}/{goal.total} steps completed</span>
          <span className={`${goal.dimension === 'physical' ? 'text-emerald-600' : 
            goal.dimension === 'emotional' ? 'text-gold-400' : 
            goal.dimension === 'intellectual' ? 'text-indigo-600' : 
            goal.dimension === 'spiritual' ? 'text-rose-500' : 'text-purple-400'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="space-y-1">
          {goal.nextStep && (
            <div className="flex items-center justify-between bg-night-700 p-2 rounded">
              <span className="text-sm text-gray-300">Next: {goal.nextStep}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onCompleteStep(goal.nextStepId)} 
                className="h-8 w-8 p-0"
              >
                <CheckCircle className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RitualCard({ ritual, onComplete }) {
  const dimensionColors = {
    physical: "bg-emerald-600 bg-opacity-20 text-emerald-600",
    emotional: "bg-gold-400 bg-opacity-20 text-gold-400",
    intellectual: "bg-indigo-600 bg-opacity-20 text-indigo-600",
    spiritual: "bg-rose-500 bg-opacity-20 text-rose-500",
    relational: "bg-purple-400 bg-opacity-20 text-purple-400"
  };
  
  const dimensionIcons = {
    physical: <Heart className="h-5 w-5" />,
    emotional: <Smile className="h-5 w-5" />,
    intellectual: <Brain className="h-5 w-5" />,
    spiritual: <Compass className="h-5 w-5" />,
    relational: <Users className="h-5 w-5" />
  };
  
  return (
    <Card className="cosmic-card">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dimensionColors[ritual.dimension]}`}>
            {dimensionIcons[ritual.dimension]}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium text-white">{ritual.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full bg-${ritual.dimension === 'physical' ? 'emerald' : 
                ritual.dimension === 'emotional' ? 'gold' : 
                ritual.dimension === 'intellectual' ? 'indigo' : 
                ritual.dimension === 'spiritual' ? 'rose' : 'purple'}-900 text-${ritual.dimension === 'physical' ? 'emerald' : 
                ritual.dimension === 'emotional' ? 'gold' : 
                ritual.dimension === 'intellectual' ? 'indigo' : 
                ritual.dimension === 'spiritual' ? 'rose' : 'purple'}-300`}>
                {ritual.time}
              </span>
            </div>
            <p className="text-sm text-gray-400">{ritual.description}</p>
          </div>
          <div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full h-8 w-8"
              onClick={onComplete}
              disabled={ritual.completed}
            >
              {ritual.completed ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
