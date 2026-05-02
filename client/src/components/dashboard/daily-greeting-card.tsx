import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Mic } from "lucide-react";

interface QuoteType {
  text: string;
  author: string;
}

interface DailyGreetingCardProps {
  username: string;
  lastAligned: string;
  message: string;
  quote: QuoteType;
  isLoading?: boolean;
}

export default function DailyGreetingCard({
  username,
  lastAligned,
  message,
  quote,
  isLoading = false
}: DailyGreetingCardProps) {
  if (isLoading) {
    return (
      <Card className="cosmic-card rounded-xl p-5 md:p-6 mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-900 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
        
        <div className="flex items-start space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-36 mt-1 md:mt-0" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            
            <Skeleton className="h-24 w-full rounded-lg mb-4" />
            
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="cosmic-card rounded-xl p-5 md:p-6 mb-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-900 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
      
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center flex-shrink-0 border border-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <h3 className="text-lg font-urbanist font-semibold text-white">Welcome back, {username}</h3>
            <span className="text-sm text-gray-400 mt-1 md:mt-0">Last aligned: {lastAligned}</span>
          </div>
          <p className="text-gray-300 mb-4">{message}</p>
          
          <div className="bg-night-700 rounded-lg p-4 border-l-4 border-gold-400">
            <p className="text-gold-400 font-urbanist font-medium italic">"{quote.text}"</p>
            <p className="text-sm text-gray-400 mt-2">— {quote.author}</p>
          </div>
          
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="bg-indigo-900 hover:bg-indigo-800 text-white flex items-center text-sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
            <Button variant="outline" className="text-white flex items-center text-sm">
              <Mic className="h-4 w-4 mr-2" />
              Voice Journal
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
