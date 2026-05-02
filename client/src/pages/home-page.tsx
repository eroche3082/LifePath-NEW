import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import AppShell from "@/components/layout/app-shell";
import DailyGreetingCard from "@/components/dashboard/daily-greeting-card";
import LifeBalanceWheel from "@/components/dashboard/life-balance-wheel";
import FocusAreaCard from "@/components/dashboard/focus-area-card";
import CheckInCard from "@/components/dashboard/check-in-card";
import RitualsCard from "@/components/dashboard/rituals-card";
import GoalsCard from "@/components/dashboard/goals-card";

export default function HomePage() {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  
  // Fetch daily dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  return (
    <AppShell>
      <div className="p-4 md:p-8 animate-fade-in">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-urbanist font-bold text-white">Daily Alignment Hub</h1>
          <p className="text-gray-400 mt-2">{today}</p>
        </header>

        {/* AI Assistant Welcome Card */}
        <DailyGreetingCard 
          username={user?.username || 'User'} 
          lastAligned={dashboardData?.lastAligned || 'Yesterday'}
          message={dashboardData?.dailyMessage || 'Welcome to LIFE PATH. Begin your journey of transformation today.'}
          quote={dashboardData?.quote || {
            text: "The mind that opens to a new idea never returns to its original size.",
            author: "Albert Einstein"
          }}
          isLoading={isLoading}
        />

        {/* Life Balance Wheel */}
        <h2 className="text-xl font-urbanist font-semibold text-white my-6">Your Life Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Wheel Visualization */}
          <LifeBalanceWheel 
            dimensions={dashboardData?.dimensions || {
              physical: 75,
              emotional: 60,
              intellectual: 85,
              spiritual: 40,
              relational: 65
            }}
            balanceScore={dashboardData?.balanceScore || 65}
            focusArea={dashboardData?.focusArea || 'spiritual'}
            isLoading={isLoading}
          />

          {/* Today's Focus Area */}
          <FocusAreaCard 
            focusArea={dashboardData?.focusArea || 'spiritual'}
            focusScore={dashboardData?.dimensions?.spiritual || 40}
            activities={dashboardData?.recommendedActivities || [
              "10-minute guided meditation session",
              "Journal reflection on your values and purpose",
              "Practice gratitude by listing three things you appreciate"
            ]}
            isLoading={isLoading}
          />

          {/* Quick Check-in */}
          <CheckInCard isLoading={isLoading} />
        </div>

        {/* Upcoming Rituals & Goals */}
        <div className="mt-8">
          <h2 className="text-xl font-urbanist font-semibold text-white mb-4">Today's Alignment Plan</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Rituals */}
            <RitualsCard 
              rituals={dashboardData?.rituals || []}
              isLoading={isLoading}
            />
            
            {/* Current Goals */}
            <GoalsCard 
              goals={dashboardData?.goals || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
