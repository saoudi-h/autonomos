# PROJECT TASKS & ROADMAP

> **LEGEND**
> **Priority:** [🔴 Critical] [🟠 High] [🔵 Medium] [⚪ Low]
> **Complexity:** [S] Small (1h), [M] Medium (4h), [L] Large (1-2 days), [XL] Huge (Planning req.)
> **Status:** [ ] Todo, [/] In Progress, [x] Done, [!] Blocked

## 🚀 Active Sprint

### CLI Improvements

- [x] **[CLI-01]** Add `--help` / `-h` flag with detailed usage info `Priority: 🔴` `Complexity: S`
- [x] **[CLI-02]** Implement `autonomos agents` command (list AGENT.md files) `Priority: 🟠` `Complexity: M`
    - Tree-like output showing AGENT.md hierarchy
    - `--all` flag: list from project root
    - `--local` flag (default): list from current directory
- [x] **[CLI-03]** Add `--dry-run` flag to `init` (preview without writing) `Priority: 🔵` `Complexity: S`
- [x] **[CLI-04]** Implement `autonomos status` command (show protocol version, tasks summary) `Priority: 🔵` `Complexity: M`
- [x] **[CLI-05]** Add colorized output with chalk/picocolors `Priority: ⚪` `Complexity: S`

### Core Enhancements

- [x] **[CORE-01]** Add AGENT.md parser (extract sections, metadata) `Priority: 🟠` `Complexity: M`
- [x] **[CORE-02]** Create worklog template and generator function `Priority: 🔵` `Complexity: S`
- [x] **[CORE-03]** Add JSON Schema validation for manifest.json `Priority: ⚪` `Complexity: S`
- [x] **[META-01]** Improve NPM metadata and LICENSE inclusion `Priority: 🟠` `Complexity: S`

### Protocol Refinements

- [x] **[PROTO-01]** Define AGENT.md frontmatter spec (YAML metadata) `Priority: 🟠` `Complexity: M`
- [x] **[PROTO-02]** Add "Quick Reference" section to PROTOCOL.md `Priority: 🔵` `Complexity: S`
- [x] **[PROTO-03]** Define standard sections for package-level AGENT.md `Priority: ⚪` `Complexity: S`
- [x] **[PROTO-04]** Protocol v0.3 refactoring: shorten workflows, remove duplication, fix paths `Priority: 🔴` `Complexity: L` *See: .autonomos/worklogs/2026-06-13-PROTO-04-v03-refactoring.md*

### Testing & Quality

- [x] **[TEST-01]** Add unit tests for TaskParser `Priority: 🟠` `Complexity: M`
- [ ] **[TEST-02]** Add integration tests for CLI commands `Priority: 🔵` `Complexity: L`
- [ ] **[TEST-03]** Add E2E test: init → update → status workflow `Priority: ⚪` `Complexity: L`

### Documentation

- [x] **[DOC-01]** Create README.md for @autonomos/core `Priority: 🟠` `Complexity: S`
- [x] **[DOC-02]** Create README.md for @autonomos/cli `Priority: 🟠` `Complexity: S`
- [x] **[DOC-03]** Add CLI usage examples to root README.md `Priority: 🔵` `Complexity: S`

## 🔮 Backlog

### Future Ideas

- [ ] **[FUTURE-01]** MCP Server package (@autonomos/mcp-server) `Priority: ⚪` `Complexity: XL`
- [ ] **[FUTURE-02]** VSCode extension for AGENT.md navigation `Priority: ⚪` `Complexity: XL`
- [ ] **[FUTURE-03]** Web dashboard for project task visualization `Priority: ⚪` `Complexity: XL`
- [ ] **[FUTURE-04]** GitHub Action for protocol validation `Priority: ⚪` `Complexity: L`
