/**
 * Agent Protocol Specification Version (Independent of Package versions)
 * This refers to the schema and behavioral contract version.
 */
export const PROTOCOL_VERSION = '0.8.4-alpha'

/**
 * Directory name for Autonomos configuration
 */
export const AUTONOMOS_DIR = '.autonomos'

/**
 * Manifest filename
 */
export const MANIFEST_FILE = 'manifest.json'

/**
 * Protocol filename
 */
export const PROTOCOL_FILE = 'PROTOCOL.md'

/**
 * Tasks filename
 */
export const TASKS_FILE = 'TASKS.md'

/**
 * Agent context filename (at project root)
 */
export const AGENT_FILE = 'AGENT.md'

/**
 * Worklogs directory name
 */
export const WORKLOGS_DIR = 'worklogs'

/**
 * Optional project-owned directory for durable target-state specifications
 */
export const SPECS_DIR = 'specs'

/**
 * Optional project-owned directory for technical decision records (ADRs)
 */
export const DECISIONS_DIR = 'decisions'

/** Optional project-owned history, never loaded by default. */
export const ARCHIVE_DIR = 'archive'

/**
 * Layout version of project-owned records. Absent in a manifest means 1.
 * Format 2: current registries hold open work only, closed records live in
 * `archive/closed/`, and worklogs follow the proportionate shape.
 */
export const ARTIFACT_FORMAT = 2

/** Issues registry filename. */
export const ISSUES_FILE = 'ISSUES.md'

/** Append-only registries of closed tasks and issues, under the archive. */
export const CLOSED_DIR = 'closed'

/** Archive batch that receives worklogs written before artifact format 2. */
export const LEGACY_WORKLOGS_DIR = 'worklogs-format-1'

/** Archive index filename. */
export const ARCHIVE_INDEX_FILE = 'README.md'

/**
 * Advisory size budgets (bytes or characters) reported by `autonomos status`.
 * They keep startup and close-out context proportionate; they are not parsers.
 */
export const CONTEXT_BUDGETS = {
    rootAgentBytes: 8_000,
    localAgentBytes: 4_000,
    tasksBytes: 16_000,
    issuesBytes: 24_000,
    taskEntryChars: 300,
    worklogBytes: 2_500,
} as const
