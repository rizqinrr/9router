import { NextResponse } from "next/server";
import { addDaysToUser } from "@/lib/db/repos/usersRepo";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { days } = await request.json();

    if (!days || typeof days !== "number" || days === 0) {
      return NextResponse.json({ error: "Days must be a non-zero number" }, { status: 400 });
    }

    const user = await addDaysToUser(parseInt(id), days);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
