import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  BarChart2, 
  MessageCircle, 
  Target, 
  Clock, 
  Settings,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const navigation = [
    { name: "Daily Alignment Hub", href: "/", icon: Home },
    { name: "Dimension Trackers", href: "/trackers", icon: BarChart2 },
    { name: "Guided Consultations", href: "/consultations", icon: MessageCircle },
    { name: "Goals & Rituals", href: "/goals", icon: Target },
    { name: "Archive & Timeline", href: "/archive", icon: Clock },
    { name: "Settings & Sync", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-night-800 border-r border-indigo-950 h-screen">
      <div className="p-6 border-b border-indigo-950">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 relative">
            <div className="absolute inset-0 bg-indigo-800 rounded-full opacity-20 animate-pulse-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-400 w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-urbanist font-bold tracking-wide text-white">
            <span className="text-emerald-600">LIFE</span>
            <span className="text-white">PATH</span>
          </h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">Life Performance Alignment Platform</p>
      </div>
      
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`flex items-center px-4 py-3 rounded-lg ${isActive 
                    ? 'text-white bg-night-700' 
                    : 'text-gray-400 hover:text-white hover:bg-night-700'} transition-colors`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-indigo-950">
          <div className="flex items-center p-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400">Level 3 Seeker</p>
            </div>
            <button 
              className="ml-auto p-2 rounded-full hover:bg-night-700 text-gray-400 hover:text-white"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
