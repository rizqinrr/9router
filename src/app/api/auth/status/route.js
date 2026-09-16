import { NextResponse } from "next/server";
import { getDashboardAuthSession } from "@/lib/auth/dashboardSession";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const session = await getDashboardAuthSession(token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
        role: session.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
