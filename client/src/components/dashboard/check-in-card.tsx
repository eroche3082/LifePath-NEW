import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CheckInCardProps {
  isLoading?: boolean;
}

export default function CheckInCard({ isLoading = false }: CheckInCardProps) {
  const { toast } = useToast();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number>(65);
  const [reflection, setReflection] = useState<string>("");

  const saveMutation = useMutation({
    mutationFn: async (data: { mood: number | null; energy: number; reflection: string }) => {
      const res = await apiRequest("POST", "/api/check-in", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in saved",
        description: "Your daily check-in has been recorded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate({ mood, energy, reflection });
  };

  const moods = [
    { emoji: "😞", label: "Struggling", value: 1 },
    { emoji: "😐", label: "Neutral", value: 2 },
    { emoji: "🙂", label: "Good", value: 3 },
    { emoji: "😊", label: "Great", value: 4 },
    { emoji: "🤩", label: "Amazing", value: 5 },
  ];

  if (isLoading) {
    return (
      <Card className="cosmic-card rounded-xl p-5 flex flex-col">
        <Skeleton className="h-6 w-32 mb-5" />
        
        <div className="mb-5">
          <Skeleton className="h-5 w-48 mb-2" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mt-1" />
        </div>
        
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-24 w-full mb-4" />
        </div>
        
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  return (
    <Card className="cosmic-card rounded-xl p-5 flex flex-col">
      <h3 className="text-lg font-urbanist font-semibold text-white mb-4">Quick Check-in</h3>
      
      <div className="mb-5">
        <label className="block text-gray-300 mb-2">How are you feeling right now?</label>
        <div className="grid grid-cols-5 gap-2">
          {moods.map((moodOption) => (
            <button
              key={moodOption.value}
              className={`flex flex-col items-center p-3 bg-night-700 rounded-lg hover:bg-night-600 transition border ${
                mood === moodOption.value ? "border-gold-400" : "border-transparent"
              }`}
              onClick={() => setMood(moodOption.value)}
            >
              <span className="text-2xl">{moodOption.emoji}</span>
              <span className="text-xs mt-1 text-gray-400">{moodOption.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Energy level today</label>
        <Progress value={energy} className="h-4" />
        <input
          type="range"
          min="0"
          max="100"
          value={energy}
          onChange={(e) => setEnergy(parseInt(e.target.value))}
          className="w-full mt-2 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
      
      <div>
        <label className="block text-gray-300 mb-2">Quick reflection (optional)</label>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full bg-night-700 border border-night-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-800"
          placeholder="Share your thoughts..."
          rows={2}
        />
      </div>
      
      <Button 
        onClick={handleSave}
        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? "Saving..." : "Save Check-in"}
      </Button>
    </Card>
  );
}
