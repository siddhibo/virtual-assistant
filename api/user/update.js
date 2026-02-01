import connectDb from "../lib/db.js";
import User from "../lib/User.js";
import { verifyToken, getTokenFromCookies } from "../lib/auth.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";

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

    const { assistantName, imageUrl, imageBase64 } = req.body;
    let assistantImage = imageUrl;

    if (imageBase64) {
      assistantImage = await uploadToCloudinary(imageBase64);
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
