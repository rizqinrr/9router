import { NextResponse } from "next/server";
import { getUsers, createUser, getActiveUserCount } from "@/lib/db/repos/usersRepo";

export async function GET(request) {
  try {
    const users = await getUsers();
    const activeCount = await getActiveUserCount();
    return NextResponse.json({ users, activeCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, pin, role = "user", daysRemaining = 30 } = await request.json();

    if (!username || !pin) {
      return NextResponse.json({ error: "Username and PIN are required" }, { status: 400 });
    }

    const user = await createUser({ username, pin, role, daysRemaining });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
