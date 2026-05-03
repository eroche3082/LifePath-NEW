import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateAIResponse, generateDailyQuote, generatePersonalizedContent } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // -------------------- API Routes --------------------
  
  // Dashboard Data
  app.get("/api/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const dashboard = await storage.getDashboard(userId);
      
      // If no dashboard data exists yet, generate initial data
      if (!dashboard) {
        const initialDashboard = {
          lastAligned: "First time",
          dailyMessage: await generatePersonalizedContent(req.user?.username || "user", "welcome"),
          quote: await generateDailyQuote(),
          dimensions: {
            physical: 75,
            emotional: 60,
            intellectual: 85,
            spiritual: 40,
            relational: 65
          },
          balanceScore: 65,
          focusArea: "spiritual",
          recommendedActivities: [
            "10-minute guided meditation session",
            "Journal reflection on your values and purpose",
            "Practice gratitude by listing three things you appreciate"
          ],
          rituals: [],
          goals: []
        };
        
        await storage.saveDashboard(userId, initialDashboard);
        res.json(initialDashboard);
      } else {
        res.json(dashboard);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Check-in
  app.post("/api/check-in", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { mood, energy, reflection } = req.body;
      const userId = req.user?.id;
      
      const checkIn = {
        userId,
        mood,
        energy,
        reflection,
        timestamp: new Date().toISOString(),
      };
      
      await storage.saveCheckIn(checkIn);
      
      // Update dashboard based on check-in
      const dashboard = await storage.getDashboard(userId);
      if (dashboard) {
        dashboard.lastAligned = new Date().toLocaleString();
        // Generate personalized message based on mood
        if (mood !== null) {
          dashboard.dailyMessage = await generatePersonalizedContent(req.user?.username || "user", "mood", mood);
        }
        await storage.saveDashboard(userId, dashboard);
      }
      
      res.json({ success: true, message: "Check-in recorded" });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({ message: "Failed to save check-in" });
    }
  });

  // Trackers
  app.get("/api/trackers/:dimension?", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const dimension = req.params.dimension || "physical";
      
      const trackerData = await storage.getTrackerData(userId, dimension);
      res.json(trackerData || {
        score: dimension === "physical" ? 75 :
              dimension === "emotional" ? 60 :
              dimension === "intellectual" ? 85 :
              dimension === "spiritual" ? 40 : 65,
        trackers: {}
      });
    } catch (error) {
      console.error("Trackers fetch error:", error);
      res.status(500).json({ message: "Failed to fetch tracker data" });
    }
  });

  // Consultations
  app.get("/api/consultations/:dimension", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const dimension = req.params.dimension;
      
      const consultation = await storage.getConsultation(userId, dimension);
      
      if (!consultation) {
        const suggestedTopics = [
          dimension === "physical" ? "How can I improve my sleep quality?" : 
          dimension === "emotional" ? "I've been feeling anxious lately, any suggestions?" : 
          dimension === "intellectual" ? "What books would you recommend for personal growth?" : 
          dimension === "spiritual" ? "How can I develop a consistent meditation practice?" : 
          "How can I strengthen my relationships with family?",
          
          dimension === "physical" ? "What's a good exercise routine for beginners?" : 
          dimension === "emotional" ? "Techniques to manage stress in daily life" : 
          dimension === "intellectual" ? "How to develop a learning habit" : 
          dimension === "spiritual" ? "Connecting with my deeper purpose" : 
          "Setting healthy boundaries in relationships"
        ];
        
        const guidedSessions = [
          {
            title: dimension === "physical" ? "Energy Boost Breathwork" : 
                  dimension === "emotional" ? "Emotional Release Practice" : 
                  dimension === "intellectual" ? "Mind Clarity Session" : 
                  dimension === "spiritual" ? "Connecting with Purpose" : 
                  "Heart-Centered Communication",
            duration: "10"
          },
          {
            title: dimension === "physical" ? "Restorative Movement Flow" : 
                  dimension === "emotional" ? "Self-Compassion Meditation" : 
                  dimension === "intellectual" ? "Creative Thinking Exercise" : 
                  dimension === "spiritual" ? "Inner Wisdom Journey" : 
                  "Empathy Building Practice",
            duration: "15"
          }
        ];
        
        const initialConsultation = {
          messages: [],
          suggestedTopics,
          guidedSessions
        };
        
        await storage.saveConsultation(userId, dimension, initialConsultation);
        res.json(initialConsultation);
      } else {
        res.json(consultation);
      }
    } catch (error) {
      console.error("Consultation fetch error:", error);
      res.status(500).json({ message: "Failed to fetch consultation data" });
    }
  });

  // Send consultation message
  app.post("/api/consultations/message", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const { dimension, message } = req.body;
      
      if (!dimension || !message) {
        return res.status(400).json({ message: "Dimension and message are required" });
      }
      
      const consultation = await storage.getConsultation(userId, dimension);
      
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      
      // Add user message
      const userMessage = {
        content: message,
        isUser: true,
        timestamp: new Date().toLocaleString()
      };
      consultation.messages.push(userMessage);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(message, dimension, req.user?.username || "user");
      const aiMessage = {
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleString()
      };
      consultation.messages.push(aiMessage);
      
      await storage.saveConsultation(userId, dimension, consultation);
      
      res.json({ success: true, message: "Message sent", response: aiMessage });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const goals = await storage.getGoals(userId);
      res.json({ goals: goals || [] });
    } catch (error) {
      console.error("Goals fetch error:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Complete goal step
  app.post("/api/goals/:goalId/complete-step", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const goalId = req.params.goalId;
      const { step } = req.body;
      
      await storage.completeGoalStep(userId, goalId, step);
      res.json({ success: true, message: "Goal step completed" });
    } catch (error) {
      console.error("Complete goal step error:", error);
      res.status(500).json({ message: "Failed to complete goal step" });
    }
  });

  // Rituals
  app.get("/api/rituals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const rituals = await storage.getRituals(userId);
      res.json({ rituals: rituals || [] });
    } catch (error) {
      console.error("Rituals fetch error:", error);
      res.status(500).json({ message: "Failed to fetch rituals" });
    }
  });

  // Complete ritual
  app.post("/api/rituals/:ritualId/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const ritualId = req.params.ritualId;
      
      await storage.completeRitual(userId, ritualId);
      res.json({ success: true, message: "Ritual completed" });
    } catch (error) {
      console.error("Complete ritual error:", error);
      res.status(500).json({ message: "Failed to complete ritual" });
    }
  });

  // Archive
  app.get("/api/archive/:type", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const type = req.params.type;
      const searchQuery = req.query.q as string || "";
      
      const archiveData = await storage.getArchiveData(userId, type, searchQuery);
      res.json(archiveData || { entries: [], journals: [] });
    } catch (error) {
      console.error("Archive fetch error:", error);
      res.status(500).json({ message: "Failed to fetch archive data" });
    }
  });

  // Settings
  app.post("/api/settings/preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const preferences = req.body;
      
      await storage.savePreferences(userId, preferences);
      res.json({ success: true, message: "Preferences saved" });
    } catch (error) {
      console.error("Save preferences error:", error);
      res.status(500).json({ message: "Failed to save preferences" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
