import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  sessionStore: session.Store;
  
  // Dashboard
  getDashboard(userId: number): Promise<any>;
  saveDashboard(userId: number, dashboard: any): Promise<void>;
  
  // Check-ins
  saveCheckIn(checkIn: any): Promise<void>;
  
  // Trackers
  getTrackerData(userId: number, dimension: string): Promise<any>;
  updateTracker(userId: number, dimension: string, tracker: string, value: number): Promise<void>;
  
  // Consultations
  getConsultation(userId: number, dimension: string): Promise<any>;
  saveConsultation(userId: number, dimension: string, consultation: any): Promise<void>;
  
  // Goals
  getGoals(userId: number): Promise<any[]>;
  createGoal(goal: any): Promise<any>;
  completeGoalStep(userId: number, goalId: string, step: number): Promise<void>;
  
  // Rituals
  getRituals(userId: number): Promise<any[]>;
  createRitual(ritual: any): Promise<any>;
  completeRitual(userId: number, ritualId: string): Promise<void>;
  
  // Archive
  getArchiveData(userId: number, type: string, searchQuery: string): Promise<any>;
  saveJournalEntry(entry: any): Promise<void>;
  
  // User data
  initializeUserData(userId: number): Promise<void>;
  savePreferences(userId: number, preferences: any): Promise<void>;
  getPreferences(userId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dashboards: Map<number, any>;
  private checkIns: Map<number, any[]>;
  private trackers: Map<string, any>; // userId_dimension
  private consultations: Map<string, any>; // userId_dimension
  private goals: Map<number, any[]>;
  private rituals: Map<number, any[]>;
  private journals: Map<number, any[]>;
  private preferences: Map<number, any>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.dashboards = new Map();
    this.checkIns = new Map();
    this.trackers = new Map();
    this.consultations = new Map();
    this.goals = new Map();
    this.rituals = new Map();
    this.journals = new Map();
    this.preferences = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create admin user
    this.createAdminUser();
  }
  
  // Create admin user for testing
  private async createAdminUser() {
    try {
      // Use direct password without hashing for simplicity in testing
      // In production, this would use proper password hashing
      const adminUser: User = {
        id: this.currentId++,
        username: "admin",
        password: "password123",
        name: null,
        email: null,
        firebaseUid: null,
        profilePicture: null,
        createdAt: new Date()
      };
      this.users.set(adminUser.id, adminUser);
      
      // Initialize user data
      this.initializeUserData(adminUser.id);
      console.log("Admin user created successfully");
    } catch (error) {
      console.error("Error creating admin user:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { name: null, email: null, firebaseUid: null, profilePicture: null, ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Initialize basic user data
  async initializeUserData(userId: number): Promise<void> {
    // Initialize empty collections for new user
    this.dashboards.set(userId, null);
    this.checkIns.set(userId, []);
    this.goals.set(userId, []);
    this.rituals.set(userId, []);
    this.journals.set(userId, []);
    
    // Set default preferences
    this.preferences.set(userId, {
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
    
    // Initialize sample data for each dimension
    const dimensions = ["physical", "emotional", "intellectual", "spiritual", "relational"];
    
    for (const dimension of dimensions) {
      this.trackers.set(`${userId}_${dimension}`, {
        score: dimension === "physical" ? 75 :
              dimension === "emotional" ? 60 :
              dimension === "intellectual" ? 85 :
              dimension === "spiritual" ? 40 : 65,
        trackers: {}
      });
      
      // Initialize empty consultation for each dimension
      this.consultations.set(`${userId}_${dimension}`, null);
    }
  }

  // Dashboard methods
  async getDashboard(userId: number): Promise<any> {
    return this.dashboards.get(userId);
  }

  async saveDashboard(userId: number, dashboard: any): Promise<void> {
    this.dashboards.set(userId, dashboard);
  }

  // Check-in methods
  async saveCheckIn(checkIn: any): Promise<void> {
    const userId = checkIn.userId;
    const userCheckIns = this.checkIns.get(userId) || [];
    userCheckIns.push(checkIn);
    this.checkIns.set(userId, userCheckIns);
  }

  // Tracker methods
  async getTrackerData(userId: number, dimension: string): Promise<any> {
    return this.trackers.get(`${userId}_${dimension}`);
  }

  async updateTracker(userId: number, dimension: string, tracker: string, value: number): Promise<void> {
    const key = `${userId}_${dimension}`;
    const trackerData = this.trackers.get(key) || { score: 50, trackers: {} };
    
    // Update specific tracker
    trackerData.trackers[tracker] = {
      ...trackerData.trackers[tracker],
      value,
      timestamp: new Date().toISOString()
    };
    
    this.trackers.set(key, trackerData);
  }

  // Consultation methods
  async getConsultation(userId: number, dimension: string): Promise<any> {
    return this.consultations.get(`${userId}_${dimension}`);
  }

  async saveConsultation(userId: number, dimension: string, consultation: any): Promise<void> {
    this.consultations.set(`${userId}_${dimension}`, consultation);
  }

  // Goal methods
  async getGoals(userId: number): Promise<any[]> {
    return this.goals.get(userId) || [];
  }

  async createGoal(goal: any): Promise<any> {
    const userId = goal.userId;
    const userGoals = this.goals.get(userId) || [];
    const newGoal = { ...goal, id: `goal_${Date.now()}` };
    userGoals.push(newGoal);
    this.goals.set(userId, userGoals);
    return newGoal;
  }

  async completeGoalStep(userId: number, goalId: string, step: number): Promise<void> {
    const userGoals = this.goals.get(userId) || [];
    const goalIndex = userGoals.findIndex(g => g.id === goalId);
    
    if (goalIndex !== -1) {
      const goal = userGoals[goalIndex];
      goal.completed += 1;
      goal.progress = Math.round((goal.completed / goal.total) * 100);
      
      // Update next step if applicable
      if (goal.steps && goal.steps.length > 0) {
        const completedStep = goal.steps.find((s: any) => s.id === step);
        if (completedStep) {
          completedStep.completed = true;
        }
        
        // Find next incomplete step
        const nextStep = goal.steps.find((s: any) => !s.completed);
        goal.nextStep = nextStep ? nextStep.description : null;
        goal.nextStepId = nextStep ? nextStep.id : null;
      }
      
      userGoals[goalIndex] = goal;
      this.goals.set(userId, userGoals);
    }
  }

  // Ritual methods
  async getRituals(userId: number): Promise<any[]> {
    return this.rituals.get(userId) || [];
  }

  async createRitual(ritual: any): Promise<any> {
    const userId = ritual.userId;
    const userRituals = this.rituals.get(userId) || [];
    const newRitual = { ...ritual, id: `ritual_${Date.now()}`, completed: false };
    userRituals.push(newRitual);
    this.rituals.set(userId, userRituals);
    return newRitual;
  }

  async completeRitual(userId: number, ritualId: string): Promise<void> {
    const userRituals = this.rituals.get(userId) || [];
    const ritualIndex = userRituals.findIndex(r => r.id === ritualId);
    
    if (ritualIndex !== -1) {
      userRituals[ritualIndex].completed = true;
      userRituals[ritualIndex].completedAt = new Date().toISOString();
      this.rituals.set(userId, userRituals);
      
      // Add to journal
      const userJournals = this.journals.get(userId) || [];
      const ritual = userRituals[ritualIndex];
      
      userJournals.push({
        id: `journal_${Date.now()}`,
        title: `Completed ritual: ${ritual.title}`,
        content: `Completed the ${ritual.title} ritual for ${ritual.dimension} wellbeing.`,
        type: "ritual",
        dimension: ritual.dimension,
        timestamp: new Date().toISOString(),
        emotions: ["accomplishment", "discipline"]
      });
      
      this.journals.set(userId, userJournals);
    }
  }

  // Archive methods
  async getArchiveData(userId: number, type: string, searchQuery: string): Promise<any> {
    const userJournals = this.journals.get(userId) || [];
    const userCheckIns = this.checkIns.get(userId) || [];
    
    // Filter by search query if provided
    const filteredJournals = searchQuery ? 
      userJournals.filter(journal => 
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        journal.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) : userJournals;
    
    // Format data based on requested type
    if (type === "timeline") {
      // Combine journals and check-ins into a single timeline
      const timelineEntries = [
        ...filteredJournals.map(journal => ({
          id: journal.id,
          title: journal.title,
          content: journal.content,
          date: new Date(journal.timestamp).toLocaleDateString(),
          dimension: journal.dimension,
          type: journal.type,
          emotions: journal.emotions,
          audioRecording: journal.audioRecording
        })),
        ...userCheckIns
          .filter(checkIn => checkIn.reflection && checkIn.reflection.trim() !== "")
          .map(checkIn => ({
            id: `checkin_${checkIn.timestamp}`,
            title: `Mood: ${getMoodLabel(checkIn.mood)}`,
            content: checkIn.reflection,
            date: new Date(checkIn.timestamp).toLocaleDateString(),
            dimension: "emotional",
            type: "check-in",
            emotions: [getMoodLabel(checkIn.mood).toLowerCase()]
          }))
      ];
      
      // Sort by date, newest first
      timelineEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return { entries: timelineEntries };
    } else {
      // Return just journal entries
      const journalEntries = filteredJournals.map(journal => ({
        id: journal.id,
        title: journal.title,
        excerpt: journal.content.substring(0, 120) + (journal.content.length > 120 ? "..." : ""),
        date: new Date(journal.timestamp).toLocaleDateString(),
        dimensions: [journal.dimension],
        audioRecording: journal.audioRecording
      }));
      
      // Sort by date, newest first
      journalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return { journals: journalEntries };
    }
  }

  async saveJournalEntry(entry: any): Promise<void> {
    const userId = entry.userId;
    const userJournals = this.journals.get(userId) || [];
    const newEntry = { ...entry, id: `journal_${Date.now()}`, timestamp: new Date().toISOString() };
    userJournals.push(newEntry);
    this.journals.set(userId, userJournals);
  }

  // Preferences methods
  async savePreferences(userId: number, preferences: any): Promise<void> {
    this.preferences.set(userId, preferences);
  }

  async getPreferences(userId: number): Promise<any> {
    return this.preferences.get(userId);
  }
}

// Helper function to get mood label
function getMoodLabel(moodValue: number): string {
  switch (moodValue) {
    case 1: return "Struggling";
    case 2: return "Neutral";
    case 3: return "Good";
    case 4: return "Great";
    case 5: return "Amazing";
    default: return "Unknown";
  }
}

import { DatabaseStorage } from "./database-storage";

// Switch from in-memory storage to database storage
export const storage = new DatabaseStorage();
