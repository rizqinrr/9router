import { NextResponse } from "next/server";
import { getApiKeys, getKeyUsageSummary, createApiKey } from "@/lib/localDb";
import { getConsistentMachineId } from "@/shared/utils/machineId";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const keys = await getApiKeys();
    const enriched = await Promise.all(
      keys.map(async (k) => {
        try {
          const usage = await getKeyUsageSummary(k.key);
          return { ...k, usage };
        } catch {
          return { ...k, usage: { totalTokens: 0, totalRequests: 0, totalCost: 0 } };
        }
      })
    );
    return NextResponse.json({ keys: enriched });
  } catch (error) {
    console.log("Error fetching keys:", error);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

// POST /api/keys - Create new API key
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, validDays, maxTokens, maxRequests, maxCost } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const machineId = await getConsistentMachineId();
    const apiKey = await createApiKey(name, machineId, {
      validDays: validDays ?? null,
      maxTokens: maxTokens ?? null,
      maxRequests: maxRequests ?? null,
      maxCost: maxCost ?? null,
    });

    return NextResponse.json({
      key: apiKey.key,
      name: apiKey.name,
      id: apiKey.id,
      machineId: apiKey.machineId,
      validDays: apiKey.validDays,
      maxTokens: apiKey.maxTokens,
      maxRequests: apiKey.maxRequests,
      maxCost: apiKey.maxCost,
    }, { status: 201 });
  } catch (error) {
    console.log("Error creating key:", error);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}
