import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, handleGoogleRedirect } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function FirebaseAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check Firebase status
  const { data: firebaseStatus } = useQuery({
    queryKey: ['/api/firebase/status'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Firebase authentication mutation
  const firebaseAuthMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await apiRequest('POST', '/api/auth/firebase', { idToken });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Welcome!",
        description: "You've been successfully signed in with Google.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Handle redirect result on page load
    handleGoogleRedirect()
      .then((result) => {
        if (result?.user) {
          // Get the ID token and authenticate with our backend
          result.user.getIdToken().then((idToken) => {
            firebaseAuthMutation.mutate(idToken);
          });
        }
      })
      .catch((error) => {
        console.error("Error handling redirect:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete Google sign-in.",
          variant: "destructive",
        });
      });

    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
      
      if (user) {
        // User is signed in, get ID token and authenticate with backend
        user.getIdToken().then((idToken) => {
          firebaseAuthMutation.mutate(idToken);
        }).catch((error) => {
          console.error("Error getting ID token:", error);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign In Error",
        description: "Failed to initiate Google sign-in.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // Show Firebase unavailable message if service is not available
  if (!firebaseStatus?.available) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Google Sign-In</CardTitle>
          <CardDescription>
            Google authentication is currently unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Firebase authentication service is not configured. Please use the regular login form.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Google Sign-In</CardTitle>
        <CardDescription>
          {firebaseUser ? 'You are signed in with Google' : 'Sign in with your Google account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {firebaseUser ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {firebaseUser.photoURL && (
                <img 
                  src={firebaseUser.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{firebaseUser.displayName}</p>
                <p className="text-sm text-muted-foreground">{firebaseUser.email}</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full"
              disabled={firebaseAuthMutation.isPending}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full"
            disabled={firebaseAuthMutation.isPending}
          >
            {firebaseAuthMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}