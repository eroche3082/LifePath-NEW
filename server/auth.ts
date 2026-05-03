import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { rateLimit } from "express-rate-limit";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { verifyIdToken, isFirebaseAdminInitialized } from "./firebase-admin";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function sanitizeUser(user: SelectUser): Omit<SelectUser, "password"> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "lifepath_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }

        if (!(await comparePasswords(password, user.password))) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", authRateLimit, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);

        storage.initializeUserData(user.id);

        res.status(201).json(sanitizeUser(user));
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", authRateLimit, passport.authenticate("local"), (req, res) => {
    res.status(200).json(sanitizeUser(req.user as SelectUser));
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(sanitizeUser(req.user as SelectUser));
  });

  app.post("/api/auth/firebase", authRateLimit, async (req, res, next) => {
    try {
      if (!isFirebaseAdminInitialized) {
        return res.status(503).json({ error: "Firebase authentication is not available" });
      }

      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "ID token is required" });
      }

      const decodedToken = await verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      let user = await storage.getUserByFirebaseUid(uid);

      if (!user) {
        const existingByUsername = await storage.getUserByUsername(email || uid);
        if (existingByUsername) {
          return res.status(409).json({
            error: "An account with this email already exists. Please sign in with your password instead.",
          });
        }

        user = await storage.createUser({
          username: email || uid,
          email: email || '',
          name: name || email || uid,
          firebaseUid: uid,
          profilePicture: picture || null,
          password: ''
        });

        await storage.initializeUserData(user.id);
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(sanitizeUser(user as SelectUser));
      });

    } catch (error) {
      console.error("Firebase authentication error:", error);
      res.status(401).json({ error: "Invalid Firebase token" });
    }
  });

  app.get("/api/firebase/status", (req, res) => {
    res.json({
      available: isFirebaseAdminInitialized,
      message: isFirebaseAdminInitialized ? "Firebase is ready" : "Firebase Admin SDK is not initialized"
    });
  });
}
