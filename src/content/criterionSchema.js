import { z } from "zod";

/**
 * Content style convention for this codebase: `explanation`, `whoItAffects`,
 * and `howToTest` should be understandable by engineers and designers who
 * know general web development but aren't WCAG specialists — not by the
 * general public, and not only by accessibility experts. Aim for roughly a
 * grade 9-12 reading level (Flesch-Kincaid), favoring short sentences with
 * one idea each over em-dash/parenthetical clause-stacking. Keep standard
 * technical vocabulary as-is (DOM, ARIA, viewport, contrast ratio, etc.) —
 * the target is sentence structure, not vocabulary simplification, so don't
 * expect to hit grade 9 on fields that legitimately need that vocabulary.
 * These three fields each render into their own <p> as JSX text
 * interpolation (see CriterionApp.jsx's CriterionContent function), so
 * `\n\n` paragraph breaks are invisible — write each as one flowing block,
 * not multiple paragraphs.
 */
const codeExampleSchema = z.object({
  lang: z.string().min(1),
  bad: z.string().min(1),
  good: z.string().min(1),
});

const checkSchema = z
  .object({
    question: z.string().min(1),
    choices: z.array(z.string().min(1)).min(2),
    answer: z.number().int().min(0),
  })
  .refine((check) => check.answer < check.choices.length, {
    message: "answer index must be within choices bounds",
    path: ["answer"],
  });

export const criterionSchema = z.object({
  id: z
    .string()
    .regex(/^\d\.\d+\.\d+$/, "id must look like a WCAG SC number, e.g. 1.4.3"),
  name: z.string().min(1),
  level: z.enum(["A", "AA", "AAA"]),
  principle: z.enum(["Perceivable", "Operable", "Understandable", "Robust"]),
  explanation: z.string().min(1),
  whoItAffects: z.string().min(1),
  codeExample: codeExampleSchema,
  howToTest: z.string().min(1),
  check: checkSchema,
  references: z.array(z.string()).default([]),
});
