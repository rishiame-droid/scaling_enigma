# CLAUDE.md

This file provides guidance to Claude Code and other AI assistants working in this repository.

---

## Repository Overview

**Repository**: `rishiame-droid/scaling_enigma`
**Status**: Newly initialized — no source code has been added yet.

This repository is at its very beginning. The conventions, workflows, and structure documented here should be followed as the project grows.

---

## Repository Structure

Since the project is currently empty, structure will be established as development begins. Common layouts to adopt depending on project type:

### Python Project
```
scaling_enigma/
├── CLAUDE.md
├── README.md
├── pyproject.toml          # or setup.py / setup.cfg
├── requirements.txt        # or requirements-dev.txt
├── src/
│   └── scaling_enigma/
│       ├── __init__.py
│       └── ...
├── tests/
│   ├── __init__.py
│   └── test_*.py
└── .github/
    └── workflows/
```

### Node/TypeScript Project
```
scaling_enigma/
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   └── ...
├── tests/
│   └── ...
└── .github/
    └── workflows/
```

Update this section once the actual project type is determined.

---

## Development Workflow

### Branch Strategy

- **Default branch**: `main`
- **Feature branches**: `feature/<short-description>`
- **Bug fix branches**: `fix/<short-description>`
- **Documentation branches**: `docs/<short-description>`
- **Claude-initiated branches**: `claude/<short-description>` (as used by this file)

Always branch off `main` and open a pull request to merge back.

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

Examples:
```
feat(auth): add JWT token validation
fix(api): handle null response from upstream service
docs: update CLAUDE.md with project structure
chore: add pre-commit hooks
```

### Pull Request Guidelines

- Keep PRs focused and small — one logical change per PR.
- Write a clear description of what changed and why.
- PRs require at least one approval before merge.
- Squash merge preferred to keep `main` history clean.

---

## Code Conventions

These apply across all code added to this repository.

### General

- Prefer clarity over cleverness — write code that the next developer can understand.
- No commented-out dead code. Delete unused code; version control is the history.
- No `TODO` comments left in merged code — open an issue instead.
- Keep functions small and single-purpose.

### Naming

| Construct | Convention |
|-----------|------------|
| Files | `snake_case` (Python) or `camelCase`/`kebab-case` (JS/TS) |
| Variables | `snake_case` (Python), `camelCase` (JS/TS) |
| Constants | `UPPER_SNAKE_CASE` |
| Classes | `PascalCase` |
| Functions/Methods | `snake_case` (Python), `camelCase` (JS/TS) |

### Error Handling

- Handle errors explicitly — do not silently swallow exceptions.
- Validate inputs at system boundaries (API endpoints, CLI entry points, file parsing).
- Do not add defensive validation for internal code paths where invariants are guaranteed by the caller.

### Security

- Never commit secrets, credentials, API keys, or tokens.
- Use environment variables for all secrets; document required vars in `.env.example`.
- Follow OWASP Top 10 guidelines — no SQL injection, XSS, command injection, etc.
- Sanitize all user-supplied input before use.

---

## Testing

### Philosophy

- Tests are required for all new features and bug fixes.
- Unit tests cover individual functions/modules in isolation.
- Integration tests cover interactions between components.
- Do not mock things that are fast or deterministic — only mock I/O and external services.

### Running Tests

_Update this section once the project and test framework are established._

```bash
# Python (pytest)
pytest

# Node/TypeScript (jest)
npm test

# With coverage
pytest --cov=src
npm test -- --coverage
```

### Test File Conventions

- Test files mirror the source tree structure.
- Python: `tests/test_<module_name>.py`
- JS/TS: `src/**/__tests__/<module>.test.ts` or `tests/<module>.test.ts`
- Test names describe the behavior being verified: `test_returns_error_when_input_is_empty`.

---

## Environment Setup

_Update this section once dependencies and tooling are established._

### Prerequisites

Document required tools and versions here (e.g., Python 3.11+, Node 20+, Docker, etc.).

### Local Setup

```bash
# Clone the repository
git clone https://github.com/rishiame-droid/scaling_enigma.git
cd scaling_enigma

# Install dependencies (update command for your stack)
# pip install -e ".[dev]"
# npm install

# Copy example environment file
cp .env.example .env
# Edit .env with your local values

# Run tests to verify setup
# pytest / npm test
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| _None defined yet_ | | | |

Add required environment variables to this table as they are introduced.

---

## CI/CD

_Update this section once CI/CD pipelines are configured._

Planned checks on every PR:
- Linting / static analysis
- Type checking
- Unit and integration tests
- Security scanning

---

## AI Assistant Guidelines

When working in this repository, Claude Code and other AI assistants should:

1. **Read before editing** — always read a file before modifying it.
2. **Stay in scope** — do not refactor, reformat, or comment code outside the task at hand.
3. **No speculative abstractions** — implement what is needed, not what might be needed.
4. **No secret exposure** — never log, print, or commit secrets or credentials.
5. **Security first** — validate inputs at boundaries; avoid injection-vulnerable patterns.
6. **Tests required** — every new function or bug fix should have a corresponding test.
7. **Update this file** — when project structure, tooling, or conventions change, update CLAUDE.md to reflect the current state.
8. **Commit to the right branch** — develop on the designated feature branch; never push directly to `main`.
9. **Confirm before destructive actions** — always ask before deleting files, resetting branches, or force-pushing.
10. **Keep PRs small** — if a task grows large, split it into reviewable increments.

---

## Updating This File

This file should be kept current as the project evolves. Update it when:

- A new language, framework, or major dependency is introduced.
- The directory structure changes significantly.
- New development tools (linters, formatters, test runners) are added.
- CI/CD pipelines are configured or changed.
- Team conventions are agreed upon or updated.
