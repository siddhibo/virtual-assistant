import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    
    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response to read out loud to the user>"
}

Type meanings:
- "general": factual or informational questions you can answer
- "google-search": user wants to search something on Google
- "youtube-search": user wants to search something on YouTube
- "youtube-play": user wants to directly play a video or song
- "calculator-open": user wants to open calculator
- "instagram-open": user wants to open instagram
- "facebook-open": user wants to open facebook
- "weather-show": user wants to know weather
- "get-time": user asks for current time
- "get-date": user asks for today's date
- "get-day": user asks what day it is
- "get-month": user asks for current month

Only respond with the JSON object, nothing else.

User input: ${command}`;

    const result = await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("Gemini error:", error);
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Sorry, I encountered an error. Please try again."
    });
  }
};

export default geminiResponse;
