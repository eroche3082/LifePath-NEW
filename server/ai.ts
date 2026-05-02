// LIFE PATH application AI integration using Google's Gemini API

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// The generative AI model to use (Gemini 1.5 Pro is the latest available)
const model = 'gemini-1.5-pro';
const geminiModel = genAI.getGenerativeModel({ model });

// Collection of quotes for daily inspiration - used as fallback if AI fails
const inspirationalQuotes = [
  {
    text: "The mind that opens to a new idea never returns to its original size.",
    author: "Albert Einstein"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  }
];

// Generate a daily quote using Gemini
export async function generateDailyQuote(): Promise<{ text: string; author: string }> {
  try {
    const prompt = `Generate an inspiring quote about personal growth, balance, and self-improvement. 
    Return a JSON object with "text" (the quote) and "author" (who said it). 
    If the author is unknown, use "Unknown".
    Make sure the quote is meaningful, inspirational, and concise (under 200 characters).`;

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
        responseMimeType: 'application/json',
      }
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      const jsonResponse = JSON.parse(text);
      return {
        text: jsonResponse.text || "The journey of balance begins with a single step.",
        author: jsonResponse.author || "Unknown"
      };
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      return {
        text: "The greatest discovery is finding harmony within yourself.",
        author: "LIFE PATH"
      };
    }
  } catch (error) {
    console.error("Error generating quote with Gemini:", error);
    
    // Fallback to predefined quotes
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    return inspirationalQuotes[randomIndex];
  }
}

// Generate personalized content based on user state
export async function generatePersonalizedContent(
  username: string, 
  contentType: string,
  moodValue?: number
): Promise<string> {
  try {
    let prompt = '';
    
    if (contentType === "welcome") {
      prompt = `Generate a warm, personalized welcome message for ${username} who is using LIFE PATH, 
      a holistic wellbeing platform focusing on five dimensions: physical, emotional, intellectual, spiritual, and relational.
      The message should be encouraging and mention personal growth or alignment. Keep it under 2 sentences.`;
    } else if (contentType === "mood" && moodValue !== undefined) {
      const moodLabels = {
        1: "struggling",
        2: "neutral",
        3: "good",
        4: "great",
        5: "amazing"
      };
      
      const mood = moodLabels[moodValue as keyof typeof moodLabels] || "neutral";
      
      prompt = `${username} has reported feeling "${mood}" today on the LIFE PATH wellbeing platform.
      Generate a personalized, empathetic response that acknowledges this mood and offers a meaningful
      perspective or question related to personal growth across the five dimensions (physical, emotional, 
      intellectual, spiritual, and relational). Keep it under 3 sentences.`;
    } else {
      prompt = `Generate a short, encouraging message for ${username} about aligning their five life dimensions
      (physical, emotional, intellectual, spiritual, and relational) for overall wellbeing. Keep it under 2 sentences.`;
    }

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    return result.response.candidates?.[0]?.content?.parts?.[0]?.text || 
      `Today is an opportunity to align your dimensions, ${username}. What would you like to focus on?`;
  } catch (error) {
    console.error("Error generating personalized content with Gemini:", error);
    
    // Fallback response if AI fails
    return `Today is an opportunity to align your dimensions, ${username}. What would you like to focus on?`;
  }
}

// Generate AI response for consultations
export async function generateAIResponse(
  message: string,
  dimension: string,
  username: string
): Promise<string> {
  try {
    // Context about the different life dimensions
    const dimensionInfo = {
      physical: "Physical wellbeing refers to how you care for your body through movement, nutrition, sleep, and other bodily needs. It's the foundation for energy and vitality.",
      emotional: "Emotional wellbeing encompasses your awareness of feelings, ability to process them healthily, and maintain balance between different emotional states.",
      intellectual: "Intellectual wellbeing involves continuous learning, creative expression, critical thinking, and maintaining cognitive flexibility throughout life.",
      spiritual: "Spiritual wellbeing relates to your sense of meaning, purpose, and connection to something larger than yourself. It's about values, beliefs, and what gives your life significance.",
      relational: "Relational wellbeing focuses on the quality of your connections with others, including communication, boundaries, intimacy, and community engagement."
    };

    // Build the prompt with context
    const prompt = `You are a holistic wellbeing consultant in the LIFE PATH platform, specializing in the "${dimension}" dimension of wellbeing.

    Here's information about this dimension:
    ${dimensionInfo[dimension as keyof typeof dimensionInfo]}

    The user (${username}) has sent this message:
    "${message}"

    Respond as a supportive, insightful wellbeing guide focused specifically on the ${dimension} dimension.
    Be concise (maximum 3 sentences) but profound and end with a reflective question that encourages deeper exploration.`;

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });

    return result.response.candidates?.[0]?.content?.parts?.[0]?.text || 
      getReflectiveResponse(dimension, username, message);
  } catch (error) {
    console.error("Error generating AI response with Gemini:", error);
    
    // Fallback to rule-based response if AI fails
    return getReflectiveResponse(dimension, username, message);
  }
}

// Helper function to generate reflective responses as a fallback
function getReflectiveResponse(dimension: string, username: string, message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return `Hello ${username}. I'd be happy to explore your ${dimension} well-being with you today. What specific aspect would you like guidance on?`;
  }
  
  // Check for questions about the dimension
  if (lowerMessage.includes("what is") || lowerMessage.includes("explain") || lowerMessage.includes("define")) {
    const dimensionInfo = {
      physical: "Physical wellbeing refers to how you care for your body through movement, nutrition, sleep, and other bodily needs. It's the foundation for energy and vitality in all other dimensions.",
      emotional: "Emotional wellbeing encompasses your awareness of feelings, ability to process them healthily, and maintain balance between different emotional states.",
      intellectual: "Intellectual wellbeing involves continuous learning, creative expression, critical thinking, and maintaining cognitive flexibility throughout life.",
      spiritual: "Spiritual wellbeing relates to your sense of meaning, purpose, and connection to something larger than yourself. It's about values, beliefs, and what gives your life significance.",
      relational: "Relational wellbeing focuses on the quality of your connections with others, including communication, boundaries, intimacy, and community engagement."
    };
    
    return dimensionInfo[dimension as keyof typeof dimensionInfo] || "This dimension encompasses an important aspect of your overall wellbeing and life balance.";
  }
  
  // Generic reflective responses by dimension
  const reflections = {
    physical: "How does your body feel when you're at your best? What practices consistently support that state?",
    emotional: "Emotions provide valuable information when we learn to listen. What might your current emotional state be trying to tell you?",
    intellectual: "Curiosity drives intellectual growth. What topics naturally spark your interest and engagement?",
    spiritual: "Meaning often emerges from aligning actions with values. What activities make you lose track of time and feel most purposeful?",
    relational: "Quality relationships require both giving and receiving. How do you balance these aspects in your connections?"
  };
  
  return `Thank you for sharing that perspective on your ${dimension} wellbeing, ${username}. ${reflections[dimension as keyof typeof reflections] || reflections.physical}`;
}
