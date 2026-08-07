import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createSession(admin);
    await setSessionCookie(token);

    return NextResponse.json({
      name: admin.name,
      email: admin.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Login failed. Try again." },
      { status: 500 },
    );
  }
}
