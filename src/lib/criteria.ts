// src/lib/criteria.ts
import { getCollection } from "astro:content";
import {
  sortCriteria,
  assertRelatedCriteriaExist,
} from "../content/loadCriteria.js";

export async function getSortedCriteria() {
  const entries = await getCollection("criteria");
  const criteria = entries.map((entry) => entry.data);
  assertRelatedCriteriaExist(criteria);
  return sortCriteria(criteria);
}
