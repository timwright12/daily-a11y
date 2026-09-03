// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { criterionSchema } from "./content/criterionSchema.js";

const criteria = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/criteria" }),
  schema: criterionSchema,
});

export const collections = { criteria };
