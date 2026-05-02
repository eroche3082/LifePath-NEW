import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  LogOut, 
  Save, 
  Link, 
  Database, 
  CloudUpload, 
  Sparkles 
} from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    aiTone: "balanced",
    aiGender: "neutral",
    aiSpiritualStyle: "neutral",
    language: "english",
    darkMode: true,
    notifications: {
      ritualReminders: true,
      missedGoals: true,
      insights: true,
      checkIns: false
    },
    privacy: {
      shareAnonymousData: false,
      personalizedContent: true
    }
  });
  
  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences) => {
      const res = await apiRequest("POST", "/api/settings/preferences", updatedPreferences);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Preferences updated",
        description: "Your settings have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle preferences changes
  const handlePreferenceChange = (section, key, value) => {
    setPreferences(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        };
      } else {
        return {
          ...prev,
          [key]: value
        };
      }
    });
  };
  
  // Save preferences
  const savePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8 animate-fade-in">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-urbanist font-bold text-white">Settings & Sync</h1>
          <p className="text-gray-400 mt-2">Customize your LIFE PATH experience</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="cosmic-card">
              <CardContent className="p-4">
                <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col items-start h-auto bg-transparent space-y-1 w-full">
                    <TabsTrigger value="profile" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="w-full justify-start">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Assistant
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger value="language" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Language
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy
                    </TabsTrigger>
                    <TabsTrigger value="sync" className="w-full justify-start">
                      <Link className="h-4 w-4 mr-2" />
                      Integrations
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Separator className="my-4" />
                
                <div className="pt-2">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-medium">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-white">{user?.username}</h3>
                      <p className="text-sm text-gray-400">Level 3 Seeker</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-emerald-900/20 text-emerald-600 border-emerald-700">
                          Physical: Novice
                        </Badge>
                        <Badge variant="outline" className="bg-gold-900/20 text-gold-400 border-gold-700">
                          Emotional: Advanced
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input 
                        id="display-name" 
                        defaultValue={user?.username} 
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Your email address" 
                        className="bg-night-700 border-night-600"
                      />
                    </div>
                  </div>
                  
                  <Button className="bg-indigo-900 hover:bg-indigo-800">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Assistant Tab */}
            <TabsContent value="ai" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>AI Assistant Customization</CardTitle>
                  <CardDescription>
                    Customize how your AI guide interacts with you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-tone">Conversation Tone</Label>
                      <Select 
                        value={preferences.aiTone} 
                        onValueChange={(value) => handlePreferenceChange(null, 'aiTone', value)}
                      >
                        <SelectTrigger className="bg-night-700 border-night-600">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal & Professional</SelectItem>
                          <SelectItem value="balanced">Balanced & Supportive</SelectItem>
                          <SelectItem value="casual">Casual & Friendly</SelectItem>
                          <SelectItem value="poetic">Poetic & Inspirational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ai-gender">Voice Characteristics</Label>
                      <Select 
                        value={preferences.aiGender} 
                        onValueChange={(value) => handlePreferenceChange(null, 'aiGender', value)}
                      >
                        <SelectTrigger className="bg-night-700 border-night-600">
                          <SelectValue placeholder="Select voice style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="masculine">Masculine</SelectItem>
                          <SelectItem value="feminine">Feminine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="spiritual-style">Spiritual Guidance Style</Label>
                      <Select 
                        value={preferences.aiSpiritualStyle} 
                        onValueChange={(value) => handlePreferenceChange(null, 'aiSpiritualStyle', value)}
                      >
                        <SelectTrigger className="bg-night-700 border-night-600">
                          <SelectValue placeholder="Select spiritual style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral / Secular</SelectItem>
                          <SelectItem value="divine">Divine / Sacred</SelectItem>
                          <SelectItem value="stoic">Stoic / Philosophical</SelectItem>
                          <SelectItem value="intuitive">Intuitive / Mystical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-indigo-900 hover:bg-indigo-800"
                    onClick={savePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the visual aspects of your LIFE PATH experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <p className="text-sm text-gray-400">Use a darker color scheme</p>
                      </div>
                      <Switch 
                        checked={preferences.darkMode} 
                        onCheckedChange={(checked) => handlePreferenceChange(null, 'darkMode', checked)} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Color Theme</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="cosmic-card border-2 border-gold-400 p-4 rounded-lg cursor-pointer">
                          <div className="space-y-2">
                            <div className="bg-indigo-900 w-full h-3 rounded"></div>
                            <div className="bg-gold-400 w-full h-3 rounded"></div>
                            <div className="bg-emerald-600 w-full h-3 rounded"></div>
                          </div>
                          <p className="text-xs text-center mt-2">Cosmic (Default)</p>
                        </div>
                        
                        <div className="cosmic-card p-4 rounded-lg cursor-pointer">
                          <div className="space-y-2">
                            <div className="bg-purple-700 w-full h-3 rounded"></div>
                            <div className="bg-pink-400 w-full h-3 rounded"></div>
                            <div className="bg-blue-500 w-full h-3 rounded"></div>
                          </div>
                          <p className="text-xs text-center mt-2">Aurora</p>
                        </div>
                        
                        <div className="cosmic-card p-4 rounded-lg cursor-pointer">
                          <div className="space-y-2">
                            <div className="bg-teal-600 w-full h-3 rounded"></div>
                            <div className="bg-amber-500 w-full h-3 rounded"></div>
                            <div className="bg-blue-400 w-full h-3 rounded"></div>
                          </div>
                          <p className="text-xs text-center mt-2">Earth</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-indigo-900 hover:bg-indigo-800"
                    onClick={savePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Language Tab */}
            <TabsContent value="language" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Language Settings</CardTitle>
                  <CardDescription>
                    Choose your preferred language for the interface and AI interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Interface Language</Label>
                    <Select 
                      value={preferences.language} 
                      onValueChange={(value) => handlePreferenceChange(null, 'language', value)}
                    >
                      <SelectTrigger className="bg-night-700 border-night-600">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="portuguese">Portuguese</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="bg-indigo-900 hover:bg-indigo-800"
                    onClick={savePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Customize when and how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Ritual Reminders</Label>
                        <p className="text-sm text-gray-400">Receive reminders for your daily rituals</p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.ritualReminders} 
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'ritualReminders', checked)} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Missed Goals Alerts</Label>
                        <p className="text-sm text-gray-400">Be notified when you miss goal deadlines</p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.missedGoals} 
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'missedGoals', checked)} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">AI Insights</Label>
                        <p className="text-sm text-gray-400">Receive notifications about AI-generated insights</p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.insights} 
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'insights', checked)} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Check-in Reminders</Label>
                        <p className="text-sm text-gray-400">Regular reminders to check in with your wellbeing</p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.checkIns} 
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'checkIns', checked)} 
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-indigo-900 hover:bg-indigo-800"
                    onClick={savePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Manage how your data is used and shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Share Anonymous Data</Label>
                        <p className="text-sm text-gray-400">Help improve LIFE PATH by sharing anonymized usage data</p>
                      </div>
                      <Switch 
                        checked={preferences.privacy.shareAnonymousData} 
                        onCheckedChange={(checked) => handlePreferenceChange('privacy', 'shareAnonymousData', checked)} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Personalized Content</Label>
                        <p className="text-sm text-gray-400">Allow AI to analyze your data for better recommendations</p>
                      </div>
                      <Switch 
                        checked={preferences.privacy.personalizedContent} 
                        onCheckedChange={(checked) => handlePreferenceChange('privacy', 'personalizedContent', checked)} 
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-indigo-900 hover:bg-indigo-800"
                    onClick={savePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Sync Tab */}
            <TabsContent value="sync" className="mt-0">
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle>Integrations & Sync</CardTitle>
                  <CardDescription>
                    Connect with other services and manage your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8 text-blue-400" />
                        <div className="space-y-0.5">
                          <h4 className="text-base font-medium">Google Calendar</h4>
                          <p className="text-sm text-gray-400">Sync rituals and reminders with your calendar</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <YouTubeIcon className="h-8 w-8 text-red-500" />
                        <div className="space-y-0.5">
                          <h4 className="text-base font-medium">YouTube</h4>
                          <p className="text-sm text-gray-400">Access guided meditation and wellness content</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-8 w-8 text-emerald-500" />
                        <div className="space-y-0.5">
                          <h4 className="text-base font-medium">Data Export</h4>
                          <p className="text-sm text-gray-400">Download all your LIFE PATH data</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CloudUpload className="h-8 w-8 text-blue-400" />
                        <div className="space-y-0.5">
                          <h4 className="text-base font-medium">Cloud Backup</h4>
                          <p className="text-sm text-gray-400">Backup your data to Google Drive</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Setup</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// Icon components
function CalendarIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function YouTubeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
