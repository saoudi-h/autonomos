import { z } from 'zod'

/**
 * Installer configuration for a single harness.
 *
 * At least one of `workflowsDir`, `targetDir`, or `skillsDir` must be defined.
 *
 * - `workflowsDir`: Where session.md, task.md, crystallize.md are written.
 *    Preferred field — used by most harnesses.
 * - `targetDir`: Single directory (legacy, like Cline's .clinerules/workflows/).
 * - `skillsDir`: Skills directory (legacy, for harnesses that don't distinguish
 *    skills from workflows).
 * - `commandsDir`: Additional commands directory (optional).
 */
export const InstallerSchema = z
    .object({
        workflowsDir: z.string().optional(),
        targetDir: z.string().optional(),
        skillsDir: z.string().optional(),
        commandsDir: z.string().optional(),
        globalTargetDir: z.string().optional(),
        fileExtension: z.string(),
    })
    .refine(
        data => Boolean(data.workflowsDir) || Boolean(data.targetDir) || Boolean(data.skillsDir),
        {
            message: 'At least one of `workflowsDir`, `targetDir`, or `skillsDir` must be defined',
        }
    )

/**
 * A single harness entry.
 */
export const HarnessSchema = z.object({
    name: z.string().min(1),
    preferred: z.boolean(),
    installer: InstallerSchema,
})

/**
 * Root schema for the harness-codes configuration file.
 */
export const HarnessCodesSchema = z.object({
    platforms: z.record(z.string(), HarnessSchema),
})

export type Installer = z.infer<typeof InstallerSchema>
export type Harness = z.infer<typeof HarnessSchema>
export type HarnessCodes = z.infer<typeof HarnessCodesSchema>
