// src/lib/criteria.ts
import { getCollection } from "astro:content";
import { sortCriteria } from "../content/loadCriteria.js";

export async function getSortedCriteria() {
  const entries = await getCollection("criteria");
  return sortCriteria(entries.map((entry) => entry.data));
}
