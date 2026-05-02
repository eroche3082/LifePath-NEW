import { db } from "./db";
import { eq, and, like, desc, or, ne, SQL, sql } from "drizzle-orm";
import { 
  users, checkIns, dimensionTracker, trackers, goals, 
  rituals, journals, preferences,
  type User, type InsertUser
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions' 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Initialize user data
  async initializeUserData(userId: number): Promise<void> {
    // Initialize preferences
    await db.insert(preferences).values({
      userId,
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
    
    // Initialize dimension trackers for each dimension
    const dimensions = ["physical", "emotional", "intellectual", "spiritual", "relational"];
    
    for (const dimension of dimensions) {
      const score = dimension === "physical" ? 75 :
                   dimension === "emotional" ? 60 :
                   dimension === "intellectual" ? 85 :
                   dimension === "spiritual" ? 40 : 65;
                   
      await db.insert(dimensionTracker).values({
        userId,
        dimension,
        score,
        trackers: {}
      });
    }
  }

  // Dashboard methods
  async getDashboard(userId: number): Promise<any> {
    // For the dashboard, we aggregate data from multiple tables
    const userPreferences = await this.getPreferences(userId);
    const userGoals = await this.getGoals(userId);
    const userRituals = await this.getRituals(userId);
    
    // Get the latest check-in
    const [latestCheckIn] = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt))
      .limit(1);
    
    // Get dimension scores
    const dimensionScores = await db
      .select()
      .from(dimensionTracker)
      .where(eq(dimensionTracker.userId, userId));
    
    // Find focus area (lowest score)
    let focusArea = { dimension: "physical", score: 100 };
    for (const dim of dimensionScores) {
      if (dim.score < focusArea.score) {
        focusArea = { dimension: dim.dimension, score: dim.score };
      }
    }
    
    // Format dimensions for the wheel
    const dimensions = dimensionScores.reduce((acc, dim) => {
      acc[dim.dimension] = dim.score;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate balance score (average of all dimensions)
    const balanceScore = Math.round(
      dimensionScores.reduce((sum, dim) => sum + dim.score, 0) / dimensionScores.length
    );
    
    return {
      user: { username: userPreferences?.username || 'User' },
      lastAligned: latestCheckIn?.createdAt || new Date().toISOString(),
      dimensions,
      balanceScore,
      focusArea: focusArea.dimension,
      focusScore: focusArea.score,
      goals: userGoals.slice(0, 3), // Top 3 goals
      rituals: userRituals.filter(r => !r.completed).slice(0, 3) // Top 3 incomplete rituals
    };
  }

  async saveDashboard(userId: number, dashboard: any): Promise<void> {
    // In the database version, we don't need this method as data is saved to individual tables
  }

  // Check-in methods
  async saveCheckIn(checkIn: any): Promise<void> {
    await db.insert(checkIns).values({
      userId: checkIn.userId,
      mood: checkIn.mood,
      energy: checkIn.energy,
      reflection: checkIn.reflection
    });
  }

  // Tracker methods
  async getTrackerData(userId: number, dimension: string): Promise<any> {
    const [data] = await db
      .select()
      .from(dimensionTracker)
      .where(
        and(
          eq(dimensionTracker.userId, userId),
          eq(dimensionTracker.dimension, dimension)
        )
      );
    
    const dimensionTrackers = await db
      .select()
      .from(trackers)
      .where(
        and(
          eq(trackers.userId, userId),
          eq(trackers.dimension, dimension)
        )
      );
    
    return {
      ...data,
      trackers: dimensionTrackers.reduce((acc, tracker) => {
        acc[tracker.name] = {
          value: tracker.value,
          timestamp: tracker.updatedAt
        };
        return acc;
      }, {})
    };
  }

  async updateTracker(userId: number, dimension: string, trackerName: string, value: number): Promise<void> {
    // Check if tracker exists
    const [existingTracker] = await db
      .select()
      .from(trackers)
      .where(
        and(
          eq(trackers.userId, userId),
          eq(trackers.dimension, dimension),
          eq(trackers.name, trackerName)
        )
      );
    
    if (existingTracker) {
      // Update existing tracker
      await db
        .update(trackers)
        .set({ value })
        .where(eq(trackers.id, existingTracker.id));
    } else {
      // Create new tracker
      await db.insert(trackers).values({
        userId,
        dimension,
        name: trackerName,
        value
      });
    }
  }

  // Consultation methods
  async getConsultation(userId: number, dimension: string): Promise<any> {
    // For consultations, we'll use the dimension tracker data
    const [data] = await db
      .select()
      .from(dimensionTracker)
      .where(
        and(
          eq(dimensionTracker.userId, userId),
          eq(dimensionTracker.dimension, dimension)
        )
      );
    
    if (!data) return null;
    
    // Include any additional consultation data from the consultation field
    return data.consultation || null;
  }

  async saveConsultation(userId: number, dimension: string, consultation: any): Promise<void> {
    await db
      .update(dimensionTracker)
      .set({ consultation })
      .where(
        and(
          eq(dimensionTracker.userId, userId),
          eq(dimensionTracker.dimension, dimension)
        )
      );
  }

  // Goal methods
  async getGoals(userId: number): Promise<any[]> {
    return db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: any): Promise<any> {
    const [newGoal] = await db
      .insert(goals)
      .values({
        userId: goal.userId,
        title: goal.title,
        description: goal.description,
        dimension: goal.dimension,
        deadline: goal.deadline,
        total: goal.total || 1,
        completed: 0,
        progress: 0,
        steps: goal.steps || []
      })
      .returning();
    
    return newGoal;
  }

  async completeGoalStep(userId: number, goalId: string, stepId: number): Promise<void> {
    // Get the goal
    const [goal] = await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.id, parseInt(goalId))
        )
      );
    
    if (!goal) return;
    
    // Update the step in the steps array
    const updatedSteps = [...goal.steps];
    const stepIndex = updatedSteps.findIndex(s => s.id === stepId);
    
    if (stepIndex !== -1) {
      updatedSteps[stepIndex].completed = true;
      
      // Update goal progress
      const completed = goal.completed + 1;
      const progress = Math.round((completed / goal.total) * 100);
      
      // Find next step
      const nextStep = updatedSteps.find(s => !s.completed);
      
      await db
        .update(goals)
        .set({ 
          steps: updatedSteps,
          completed,
          progress,
          nextStep: nextStep ? nextStep.description : null,
          nextStepId: nextStep ? nextStep.id : null
        })
        .where(eq(goals.id, goal.id));
    }
  }

  // Ritual methods
  async getRituals(userId: number): Promise<any[]> {
    return db
      .select()
      .from(rituals)
      .where(eq(rituals.userId, userId))
      .orderBy(desc(rituals.createdAt));
  }

  async createRitual(ritual: any): Promise<any> {
    const [newRitual] = await db
      .insert(rituals)
      .values({
        userId: ritual.userId,
        title: ritual.title,
        description: ritual.description,
        time: ritual.time,
        dimension: ritual.dimension,
        completed: false
      })
      .returning();
    
    return newRitual;
  }

  async completeRitual(userId: number, ritualId: string): Promise<void> {
    // Get the ritual
    const [ritual] = await db
      .select()
      .from(rituals)
      .where(
        and(
          eq(rituals.userId, userId),
          eq(rituals.id, parseInt(ritualId))
        )
      );
    
    if (!ritual) return;
    
    // Update ritual as completed
    await db
      .update(rituals)
      .set({ 
        completed: true,
        completedAt: new Date()
      })
      .where(eq(rituals.id, ritual.id));
    
    // Add journal entry about completed ritual
    await this.saveJournalEntry({
      userId,
      title: `Completed ritual: ${ritual.title}`,
      content: `Completed the ${ritual.title} ritual for ${ritual.dimension} wellbeing.`,
      type: "ritual",
      dimension: ritual.dimension,
      emotions: ["accomplishment", "discipline"]
    });
  }

  // Archive methods
  async getArchiveData(userId: number, type: string, searchQuery: string): Promise<any> {
    // Get journals
    let journalQuery = db
      .select()
      .from(journals)
      .where(eq(journals.userId, userId));
    
    // Add search filter if provided
    if (searchQuery) {
      journalQuery = journalQuery.where(
        or(
          like(journals.title, `%${searchQuery}%`),
          like(journals.content, `%${searchQuery}%`)
        )
      );
    }
    
    const journalEntries = await journalQuery.orderBy(desc(journals.createdAt));
    
    // Format for timeline or journal view
    if (type === "timeline") {
      // Get check-ins with reflections
      const checkInEntries = await db
        .select()
        .from(checkIns)
        .where(
          and(
            eq(checkIns.userId, userId),
            ne(checkIns.reflection, null)
          )
        )
        .orderBy(desc(checkIns.createdAt));
      
      // Combine and format entries
      const timelineEntries = [
        ...journalEntries.map(journal => ({
          id: `journal_${journal.id}`,
          title: journal.title,
          content: journal.content,
          date: journal.createdAt.toLocaleDateString(),
          dimension: journal.dimension,
          type: journal.type,
          emotions: journal.emotions,
          audioRecording: journal.audioRecording
        })),
        ...checkInEntries.map(checkIn => ({
          id: `checkin_${checkIn.id}`,
          title: `Mood: ${getMoodLabel(checkIn.mood)}`,
          content: checkIn.reflection,
          date: checkIn.createdAt.toLocaleDateString(),
          dimension: "emotional",
          type: "check-in",
          emotions: [getMoodLabel(checkIn.mood).toLowerCase()]
        }))
      ];
      
      // Sort by date
      timelineEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return { entries: timelineEntries };
    } else {
      // Journal view
      const formattedJournals = journalEntries.map(journal => ({
        id: journal.id,
        title: journal.title,
        excerpt: journal.content.substring(0, 120) + (journal.content.length > 120 ? "..." : ""),
        date: journal.createdAt.toLocaleDateString(),
        dimensions: [journal.dimension],
        audioRecording: journal.audioRecording
      }));
      
      return { journals: formattedJournals };
    }
  }

  async saveJournalEntry(entry: any): Promise<void> {
    await db.insert(journals).values({
      userId: entry.userId,
      title: entry.title,
      content: entry.content,
      type: entry.type || "journal",
      dimension: entry.dimension,
      emotions: entry.emotions || [],
      audioRecording: entry.audioRecording
    });
  }

  // Preferences methods
  async savePreferences(userId: number, prefs: any): Promise<void> {
    // Check if preferences exist
    const [existingPrefs] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, userId));
    
    if (existingPrefs) {
      await db
        .update(preferences)
        .set(prefs)
        .where(eq(preferences.userId, userId));
    } else {
      await db.insert(preferences).values({
        userId,
        ...prefs
      });
    }
  }

  async getPreferences(userId: number): Promise<any> {
    const [prefs] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, userId));
    
    return prefs;
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

function or(...conditions: any[]): any {
  return { type: 'or', conditions };
}

function ne(column: any, value: any): any {
  return { type: 'not', condition: eq(column, value) };
}