# LIFE PATH (P.A.P.H.) - Life Performance Alignment Platform

## Overview

LIFE PATH is a comprehensive life tracking and alignment platform that helps users balance and optimize five key dimensions of their lives: Physical, Emotional, Intellectual, Spiritual, and Relational (P.A.P.H.). The platform leverages Google's Gemini AI to provide personalized guidance, daily insights, and dimensional consultations. Users can track habits across all five dimensions, set goals, establish rituals, receive AI-powered consultations, and maintain a comprehensive archive of their personal growth journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: TailwindCSS with custom cosmic-themed design system and ShadCN/UI components
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme**: Dark mode with custom color palette (night, indigo, gold, emerald themes)
- **Layout**: Responsive design with sidebar navigation for desktop and bottom navigation for mobile

### Backend Architecture
- **Runtime**: Node.js with Express server framework
- **Language**: TypeScript for type safety across the stack
- **Session Management**: Express sessions with PostgreSQL session store
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **API Design**: RESTful endpoints with JSON responses and proper error handling

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database interactions
- **Schema Design**: 
  - User management (users, sessions)
  - Dimensional tracking (check_ins, dimension_tracker, trackers)
  - Goal and ritual management (goals, rituals)
  - Content archival (journals, preferences)
- **Connection**: Connection pooling with @neondatabase/serverless driver

### Authentication and Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Route Protection**: Protected route wrapper component for authenticated pages
- **Security**: CSRF protection, secure cookies, and proper session management

### AI Integration Architecture
- **Primary AI**: Google Gemini 1.5 Pro via @google/generative-ai SDK
- **Backup AI**: Vertex AI integration for enhanced capabilities
- **AI Functions**:
  - Daily quote generation with JSON-structured responses
  - Personalized content based on user mood and context
  - Dimensional consultations for each life area
  - Mood-based response adaptation
- **Error Handling**: Graceful fallbacks with predefined content when AI services are unavailable
- **Prompt Engineering**: Structured prompts with clear instructions for consistent outputs

### Development and Build Architecture
- **Build Tool**: Vite for fast development and optimized production builds
- **Module System**: ESM modules throughout the stack
- **Development**: Hot module replacement with Vite middleware integration
- **TypeScript**: Shared types between client and server via shared schema
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### AI and Machine Learning
- **Google Gemini API**: Primary AI service for content generation and consultations
- **Google Vertex AI**: Advanced AI capabilities and model access
- **Anthropic Claude**: Backup AI service (API key available but not actively used)

### Authentication and Cloud Services
- **Google Cloud Platform**: Multiple API integrations including:
  - Text-to-Speech and Speech-to-Text APIs
  - Natural Language Processing
  - Translation API
  - Vision API
  - Maps API
- **Firebase**: Authentication, hosting, and additional Google services integration

### Payment and Communication
- **Stripe**: Payment processing for subscription management (both test and live keys configured)
- **SendGrid**: Email delivery service for notifications and communications
- **ElevenLabs**: Voice synthesis for audio features

### Content and Media
- **YouTube API**: Integration for spiritual content and guided sessions
- **Pixabay API**: Image search and media content
- **News API**: External content integration for intellectual dimension

### Development and Monitoring
- **Replit**: Development environment with custom plugins for runtime error handling
- **HubSpot**: CRM integration for user management
- **Various Analytics APIs**: For data insights and user behavior tracking

### Database and Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Google Cloud Storage**: File and media storage capabilities
- **Firebase Hosting**: Static site hosting and CDN