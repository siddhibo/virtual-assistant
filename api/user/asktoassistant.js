import connectDb from "../lib/db.js";
import User from "../lib/User.js";
import { verifyToken, getTokenFromCookies } from "../lib/auth.js";
import geminiResponse from "../lib/gemini.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const token = getTokenFromCookies(req.headers.cookie);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    await connectDb();

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { command } = req.body;
    const response = await geminiResponse(command, user.assistantName || "Assistant", user.name);

    let parsedResponse;
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (e) {
      parsedResponse = { type: "general", userInput: command, response: response };
    }

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Ask assistant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
