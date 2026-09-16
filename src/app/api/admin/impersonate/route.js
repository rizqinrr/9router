import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db/repos/usersRepo";
import { setUserSessionCookie } from "@/lib/auth/dashboardSession";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await getUserById(parseInt(userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create session for the target user
    const cookieStore = await cookies();
    await setUserSessionCookie(cookieStore, request, user);

    return NextResponse.json({
      success: true,
      impersonating: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
