import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Search, 
  Calendar, 
  Heart, 
  Brain, 
  Smile, 
  Compass, 
  Users, 
  ChevronUp, 
  ChevronDown,
  Play,
  Volume2
} from "lucide-react";

export default function ArchivePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  
  // Fetch archive data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/archive", activeTab, searchQuery],
    enabled: !!user,
  });

  const toggleExpand = (id: number) => {
    if (expandedEntry === id) {
      setExpandedEntry(null);
    } else {
      setExpandedEntry(id);
    }
  };

  const dimensionIcons = {
    physical: <Heart className="h-4 w-4 text-emerald-600" />,
    emotional: <Smile className="h-4 w-4 text-gold-400" />,
    intellectual: <Brain className="h-4 w-4 text-indigo-400" />,
    spiritual: <Compass className="h-4 w-4 text-rose-500" />,
    relational: <Users className="h-4 w-4 text-purple-400" />
  };

  const dimensionColors = {
    physical: "bg-emerald-900/20 text-emerald-600 border-emerald-700",
    emotional: "bg-gold-900/20 text-gold-400 border-gold-700",
    intellectual: "bg-indigo-900/20 text-indigo-400 border-indigo-700",
    spiritual: "bg-rose-900/20 text-rose-500 border-rose-700",
    relational: "bg-purple-900/20 text-purple-400 border-purple-700"
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8 animate-fade-in">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-urbanist font-bold text-white">Archive & Timeline</h1>
          <p className="text-gray-400 mt-2">Review your journey and growth over time</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search entries, tags, or content..."
              className="pl-10 bg-night-700 border-night-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-2 w-full md:w-auto">
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="journals" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Journals</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : data?.entries?.length > 0 ? (
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-6 md:left-8 w-0.5 bg-night-700"></div>
              <div className="space-y-6">
                {data.entries.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="relative z-10 mt-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${dimensionColors[entry.dimension].split(" ")[2]}`}></div>
                      </div>
                      
                      <Card className="cosmic-card flex-1" onClick={() => toggleExpand(entry.id)}>
                        <CardHeader className="pb-2">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={dimensionColors[entry.dimension]}>
                                {dimensionIcons[entry.dimension]}
                                <span className="ml-1">{entry.dimension}</span>
                              </Badge>
                              <span className="text-sm text-gray-400">{entry.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.audioRecording && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                  <Volume2 className="h-4 w-4 text-indigo-400" />
                                </Button>
                              )}
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(entry.id);
                                }}
                              >
                                {expandedEntry === entry.id ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className={`text-gray-300 ${expandedEntry !== entry.id && "line-clamp-2"}`}>
                            {entry.content}
                          </p>
                          
                          {expandedEntry === entry.id && entry.emotions && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {entry.emotions.map((emotion, i) => (
                                <Badge key={i} variant="outline" className="bg-night-700 text-gray-300">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-10 cosmic-card rounded-xl">
              <h3 className="text-lg font-medium text-white mb-2">No Timeline Entries Yet</h3>
              <p className="text-gray-400">
                As you continue your journey with LIFE PATH, your activities and reflections will appear here
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Journals Tab */}
        <TabsContent value="journals" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : data?.journals?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.journals.map((journal) => (
                <Card key={journal.id} className="cosmic-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{journal.title}</CardTitle>
                        <CardDescription>{journal.date}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        {journal.dimensions.map((dim, i) => (
                          <span key={i} className="flex items-center justify-center w-6 h-6 rounded-full bg-night-700">
                            {dimensionIcons[dim]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 line-clamp-3 mb-4">{journal.excerpt}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-400">{user?.username}</span>
                      </div>
                      
                      {journal.audioRecording && (
                        <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
                          <Play className="h-3 w-3" />
                          Listen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 cosmic-card rounded-xl">
              <h3 className="text-lg font-medium text-white mb-2">No Journal Entries Yet</h3>
              <p className="text-gray-400">
                Start journaling your thoughts, reflections and insights to build your archive
              </p>
            </div>
          )}
        </TabsContent>
      </div>
    </AppShell>
  );
}
