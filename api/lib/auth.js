import jwt from "jsonwebtoken";

export const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const getTokenFromCookies = (cookieHeader) => {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  return cookies.token || null;
};

export const setCookieHeader = (token) => {
  return `token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
};

export const clearCookieHeader = () => {
  return `token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`;
};
