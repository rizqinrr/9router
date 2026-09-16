"use server";

import { NextResponse } from "next/server";
import { GET as opencodeGet } from "../opencode-settings/route";
import { GET as openclawGet } from "../openclaw-settings/route";
import { GET as hermesGet } from "../hermes-settings/route";

const STATUS_GETTERS = {
  opencode: opencodeGet,
  openclaw: openclawGet,
  hermes: hermesGet,
};

export async function GET() {
  const entries = await Promise.all(
    Object.entries(STATUS_GETTERS).map(async ([toolId, getter]) => {
      try {
        const res = await getter();
        const data = await res.json();
        return [toolId, data];
      } catch {
        return [toolId, null];
      }
    })
  );
  return NextResponse.json(Object.fromEntries(entries));
}
