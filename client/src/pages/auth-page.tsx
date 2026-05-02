import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FirebaseAuth } from "@/components/FirebaseAuth";

const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

const registerSchema = insertUserSchema.pick({
  username: true,
  password: true,
}).extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: RegisterFormValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  }

  return (
    <div className="min-h-screen cosmic-gradient flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="text-center md:text-left mb-6">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-9 h-9 relative">
                <div className="absolute inset-0 bg-indigo-800 rounded-full opacity-20 animate-pulse-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-400 w-5 h-5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-urbanist font-bold tracking-wide text-white">
                <span className="text-emerald-600">LIFE</span>
                <span className="text-white">PATH</span>
              </h1>
            </div>
            <h2 className="text-xl text-gray-200 mb-2">Welcome to your journey</h2>
            <p className="text-gray-400">Life Performance Alignment Platform & Hub</p>
          </div>

          <Card className="cosmic-card border-indigo-950">
            <CardHeader>
              <CardTitle className="text-center text-xl text-white">Account Access</CardTitle>
              <CardDescription className="text-center">Sign in or create your account to begin your transformation</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                className="bg-night-700 border-night-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                className="bg-night-700 border-night-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-indigo-900 hover:bg-indigo-800"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                                className="bg-night-700 border-night-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                {...field} 
                                className="bg-night-700 border-night-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                {...field} 
                                className="bg-night-700 border-night-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Separator className="flex-1" />
                <span className="text-sm text-gray-400">OR</span>
                <Separator className="flex-1" />
              </div>
              
              <FirebaseAuth />
              
              <div className="text-sm text-gray-400 text-center w-full">
                By continuing, you agree to LIFE PATH's Terms of Service and Privacy Policy
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-urbanist font-bold text-white">Begin Your <span className="text-gold-400">Transformational</span> Journey</h2>
            <p className="text-gray-300 text-lg">LIFE PATH is your personal alignment platform designed to bring harmony to all dimensions of your being.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="cosmic-card p-4 rounded-lg flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Physical Wellness</h3>
                <p className="text-sm text-gray-400">Track habits, sleep, and exercise patterns</p>
              </div>
            </div>
            
            <div className="cosmic-card p-4 rounded-lg flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold-400 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Emotional Balance</h3>
                <p className="text-sm text-gray-400">Monitor mood and manage stress levels</p>
              </div>
            </div>
            
            <div className="cosmic-card p-4 rounded-lg flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-900 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Intellectual Growth</h3>
                <p className="text-sm text-gray-400">Set learning goals and track progress</p>
              </div>
            </div>
            
            <div className="cosmic-card p-4 rounded-lg flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Spiritual Connection</h3>
                <p className="text-sm text-gray-400">Develop mindfulness and inner peace</p>
              </div>
            </div>
          </div>
          
          <div className="cosmic-card p-5 rounded-lg">
            <p className="text-gray-300 italic">"The LIFE PATH system helped me find clarity and purpose during a difficult transitional period. The daily guidance is like having a wise mentor always available."</p>
            <div className="mt-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-white font-medium">MM</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Michael Morgan</p>
                <p className="text-xs text-gray-400">Level 7 Practitioner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
