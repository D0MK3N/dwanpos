import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cek JWT dari cookie
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: true, message: "Not authenticated" });
  }
  // Validasi JWT ke backend (Go)
  try {
    const resp = await fetch("http://localhost:8080/auth/me", {
      headers: { "Cookie": `auth_token=${token}` },
      credentials: "include",
    });
    if (!resp.ok) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }
    const data = await resp.json();
    return res.status(200).json({ user: data.user });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Server error" });
  }
}
