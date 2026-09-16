import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db/repos/usersRepo";
import { getUsageHistory } from "@/lib/db/repos/usageRepo";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get usage for this user
    const usage = await getUsageHistory({ userId });

    // Aggregate stats
    const totalRequests = usage.length;
    const totalCost = usage.reduce((sum, u) => sum + (u.cost || 0), 0);
    const totalPromptTokens = usage.reduce((sum, u) => sum + (u.tokens?.prompt_tokens || 0), 0);
    const totalCompletionTokens = usage.reduce((sum, u) => sum + (u.tokens?.completion_tokens || 0), 0);

    // Group by model
    const byModel = {};
    for (const u of usage) {
      const key = u.model || "unknown";
      if (!byModel[key]) byModel[key] = { requests: 0, cost: 0, promptTokens: 0, completionTokens: 0 };
      byModel[key].requests++;
      byModel[key].cost += u.cost || 0;
      byModel[key].promptTokens += u.tokens?.prompt_tokens || 0;
      byModel[key].completionTokens += u.tokens?.completion_tokens || 0;
    }

    return NextResponse.json({
      user,
      stats: {
        totalRequests,
        totalCost,
        totalPromptTokens,
        totalCompletionTokens,
        byModel,
      },
      recentUsage: usage.slice(-20), // Last 20 entries
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
