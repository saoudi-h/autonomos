import { z } from 'zod'

/**
 * Installer configuration for a single harness.
 *
 * Either `targetDir` (single directory for both skills and commands, used by
 * Cline) or `skillsDir` (split mode, used by Claude Code, Codex, etc.) must be
 * defined. `commandsDir` is optional in split mode (some harnesses only support
 * skills, e.g. Codex).
 */
export const InstallerSchema = z
    .object({
        targetDir: z.string().optional(),
        skillsDir: z.string().optional(),
        commandsDir: z.string().optional(),
        globalTargetDir: z.string().optional(),
        fileExtension: z.string(),
    })
    .refine(data => Boolean(data.targetDir) || Boolean(data.skillsDir), {
        message: 'Either `targetDir` or `skillsDir` must be defined for each harness',
    })

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
