// src/pages/today.json.ts
import type { APIRoute } from "astro";
import { getSortedCriteria } from "../lib/criteria";
import { buildTodayPayload } from "../lib/today.js";
import { SITE_URL } from "../gamification/shareCard.js";

export const prerender = true;

export const GET: APIRoute = async () => {
  const criteria = await getSortedCriteria();
  const payload = buildTodayPayload(criteria, new Date(), SITE_URL);

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
