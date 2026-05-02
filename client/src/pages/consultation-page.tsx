import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppShell from "@/components/layout/app-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Brain, Smile, Compass, Users, MessageCircle, Mic, Play, ChevronRight } from "lucide-react";

export default function ConsultationPage() {
  const { user } = useAuth();
  const [currentDimension, setCurrentDimension] = useState("physical");
  const [message, setMessage] = useState("");

  // Fetch consultation data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/consultations", currentDimension],
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const res = await apiRequest("POST", "/api/consultations/message", {
        dimension: currentDimension,
        message
      });
      return await res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", currentDimension] });
    }
  });

  // Submit handler for consultation message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8 animate-fade-in">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-urbanist font-bold text-white">Guided Consultations</h1>
          <p className="text-gray-400 mt-2">AI-powered guidance for each dimension of your life</p>
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
          
          {/* All dimension tabs share the same layout but with different content */}
          <TabsContent value={currentDimension}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Conversation Area */}
                <Card className="cosmic-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-urbanist flex items-center gap-2">
                      {currentDimension === "physical" && <Heart className="h-5 w-5 text-emerald-600" />}
                      {currentDimension === "emotional" && <Smile className="h-5 w-5 text-gold-400" />}
                      {currentDimension === "intellectual" && <Brain className="h-5 w-5 text-indigo-400" />}
                      {currentDimension === "spiritual" && <Compass className="h-5 w-5 text-rose-500" />}
                      {currentDimension === "relational" && <Users className="h-5 w-5 text-purple-400" />}
                      {currentDimension.charAt(0).toUpperCase() + currentDimension.slice(1)} Consultation
                    </CardTitle>
                    <CardDescription>
                      Discuss your {currentDimension} wellbeing and receive personalized guidance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto p-2">
                      {isLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : data?.messages && data.messages.length > 0 ? (
                        data.messages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-start gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="flex-shrink-0">
                                {msg.isUser ? (
                                  <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                                ) : (
                                  <AvatarFallback className="bg-indigo-900">AI</AvatarFallback>
                                )}
                              </Avatar>
                              <div className={`p-3 rounded-lg ${msg.isUser ? 'bg-indigo-900' : 'bg-night-700'}`}>
                                <p className="text-sm text-gray-200">{msg.content}</p>
                                <div className="mt-1 text-xs text-gray-400">{msg.timestamp}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">Begin your consultation by sending a message</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <form onSubmit={handleSubmit} className="w-full space-y-2">
                      <Textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Share your thoughts about your ${currentDimension} wellbeing...`}
                        className="bg-night-700 border-night-600 resize-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" size="icon" className="rounded-full bg-night-700 border-night-600">
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-indigo-900 hover:bg-indigo-800"
                          disabled={sendMessageMutation.isPending || !message.trim()}
                        >
                          {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </form>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="space-y-6">
                {/* Suggested Topics */}
                <Card className="cosmic-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data?.suggestedTopics?.map((topic, i) => (
                          <Button 
                            key={i}
                            variant="outline" 
                            className="w-full justify-start text-left bg-night-700 border-night-600 hover:bg-night-600"
                            onClick={() => setMessage(topic)}
                          >
                            {topic}
                          </Button>
                        )) || (
                          <div className="text-center py-4">
                            <p className="text-gray-400">No suggested topics available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Guided Sessions */}
                <Card className="cosmic-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Guided Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data?.guidedSessions?.map((session, i) => (
                          <div key={i} className="p-3 bg-night-700 rounded-lg hover:bg-night-600 cursor-pointer transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center">
                                  <Play className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{session.title}</h4>
                                  <p className="text-xs text-gray-400">{session.duration} minutes</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-4">
                            <p className="text-gray-400">No guided sessions available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
