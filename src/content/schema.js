import { z } from 'zod';

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
    message: 'answer index must be within choices bounds',
    path: ['answer'],
  });

export const criterionSchema = z.object({
  id: z.string().regex(/^\d\.\d+\.\d+$/, 'id must look like a WCAG SC number, e.g. 1.4.3'),
  name: z.string().min(1),
  level: z.enum(['A', 'AA', 'AAA']),
  principle: z.enum(['Perceivable', 'Operable', 'Understandable', 'Robust']),
  explanation: z.string().min(1),
  whoItAffects: z.string().min(1),
  codeExample: codeExampleSchema,
  howToTest: z.string().min(1),
  check: checkSchema,
  references: z.array(z.string()).default([]),
});
