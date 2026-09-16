import { NextResponse } from "next/server";
import { getProviderConnections } from "@/lib/localDb";
import { isOpenAICompatibleProvider, isAnthropicCompatibleProvider } from "@/shared/constants/providers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    if (!providerId) {
      return NextResponse.json({ error: "providerId is required" }, { status: 400 });
    }

    if (!isOpenAICompatibleProvider(providerId) && !isAnthropicCompatibleProvider(providerId)) {
      return NextResponse.json({ models: [] });
    }

    const connections = await getProviderConnections({ provider: providerId });
    const connection = connections.find(c => c.isActive && c.apiKey);

    if (!connection?.apiKey) {
      return NextResponse.json({ models: [] });
    }

    const baseUrl = typeof connection?.providerSpecificData?.baseUrl === "string"
      ? connection.providerSpecificData.baseUrl.trim().replace(/\/$/, "")
      : "";

    if (!baseUrl) return NextResponse.json({ models: [] });

    const headers = { "Content-Type": "application/json" };

    if (isOpenAICompatibleProvider(providerId)) {
      headers.Authorization = `Bearer ${connection.apiKey}`;
    } else {
      headers["x-api-key"] = connection.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers.Authorization = `Bearer ${connection.apiKey}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${baseUrl}/models`, {
        method: "GET",
        headers,
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return NextResponse.json({ models: [] });

      const data = await res.json();

      const modelIds = (data?.data || data?.models || [])
        .map(m => m?.id || m?.name || m)
        .filter(id => typeof id === "string" && id.length > 0);

      return NextResponse.json({ models: modelIds });
    } catch {
      return NextResponse.json({ models: [] });
    }
  } catch (error) {
    console.log("Error discovering models:", error);
    return NextResponse.json({ models: [] });
  }
}
