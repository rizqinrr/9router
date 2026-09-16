import { NextResponse } from "next/server";
import { resetUserPin } from "@/lib/db/repos/usersRepo";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { pin } = await request.json();

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: "PIN must be at least 4 characters" }, { status: 400 });
    }

    const user = await resetUserPin(parseInt(id), pin);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
