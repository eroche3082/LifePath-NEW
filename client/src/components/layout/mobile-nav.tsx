import { Link, useLocation } from "wouter";
import { 
  Home, 
  BarChart2, 
  MessageCircle, 
  Target,
  Menu
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const navigationItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Track", href: "/trackers", icon: BarChart2 },
    { name: "Consult", href: "/consultations", icon: MessageCircle },
    { name: "Goals", href: "/goals", icon: Target },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-night-800 border-b border-indigo-950 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 relative mr-2">
            <div className="absolute inset-0 bg-indigo-800 rounded-full opacity-20 animate-pulse-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-400 w-4 h-4">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-lg font-urbanist font-bold">
            <span className="text-emerald-600">LIFE</span>
            <span className="text-white">PATH</span>
          </h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Menu className="h-5 w-5 text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="cosmic-gradient w-72 border-l border-indigo-950">
            <div className="flex flex-col h-full">
              <div className="py-6 border-b border-indigo-950">
                <div className="flex items-center px-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                    {user?.username.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.username || "User"}</p>
                    <p className="text-xs text-gray-400">Level 3 Seeker</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 py-6">
                <ul className="space-y-1 px-2">
                  <li>
                    <Link href="/">
                      <a className={`flex items-center px-4 py-3 rounded-lg ${location === "/" ? "text-white bg-night-700" : "text-gray-400 hover:text-white hover:bg-night-700"} transition-colors`}>
                        <Home className="h-5 w-5 mr-3" />
                        <span>Daily Alignment Hub</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/trackers">
                      <a className={`flex items-center px-4 py-3 rounded-lg ${location === "/trackers" ? "text-white bg-night-700" : "text-gray-400 hover:text-white hover:bg-night-700"} transition-colors`}>
                        <BarChart2 className="h-5 w-5 mr-3" />
                        <span>Dimension Trackers</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/consultations">
                      <a className={`flex items-center px-4 py-3 rounded-lg ${location === "/consultations" ? "text-white bg-night-700" : "text-gray-400 hover:text-white hover:bg-night-700"} transition-colors`}>
                        <MessageCircle className="h-5 w-5 mr-3" />
                        <span>Guided Consultations</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/goals">
                      <a className={`flex items-center px-4 py-3 rounded-lg ${location === "/goals" ? "text-white bg-night-700" : "text-gray-400 hover:text-white hover:bg-night-700"} transition-colors`}>
                        <Target className="h-5 w-5 mr-3" />
                        <span>Goals & Rituals</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/archive">
                      <a className={`flex items-center px-4 py-3 rounded-lg ${location === "/archive" ? "text-white bg-night-700" : "text-gray-400 hover:text-white hover:bg-night-700"} transition-colors`}>
                        <Clock className="h-5 w-5 mr-3" />
                        <span>Archive & Timeline</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings">
                      <a className={`flex items-center px-4 py-3 rounded-lg ${location === "/settings" ? "text-white bg-night-700" : "text-gray-400 hover:text-white hover:bg-night-700"} transition-colors`}>
                        <Settings className="h-5 w-5 mr-3" />
                        <span>Settings & Sync</span>
                      </a>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-night-900 border-t border-indigo-950 z-50">
        <div className="flex justify-around p-3">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a className={`flex flex-col items-center ${isActive ? "text-gold-400" : "text-gray-400"}`}>
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

import { Clock, Settings } from "lucide-react";
