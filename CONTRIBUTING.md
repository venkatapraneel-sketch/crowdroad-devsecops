# Contributing

Thank you for helping improve this project. Every change, including the maintainer's own, follows the same workflow.

## Workflow

1. **Open or pick an issue.** Describe the problem or feature using an issue template.
2. **Create a branch from `main`.** Use `feature/<short-name>`, `fix/<short-name>`, `docs/<short-name>` or `chore/<short-name>`.
3. **Make small, focused commits** with clear messages in the imperative mood (for example `fix: reject empty note titles`).
4. **Run the checks locally** before pushing:

```bash
   npm run lint
   npm test
   npm run audit:high
```

5. **Open a pull request** against `main`, fill in the template and link the issue with `Closes #<number>`.
6. **Wait for the required checks** (Lint & test, Dependency review, CodeQL) and address review comments.
7. **Merge** once everything is green. Never commit directly to `main`.

## Rules

- Never commit secrets, tokens, passwords or private keys. Use `.env` (git-ignored) for local configuration.
- Add or update tests for any behaviour change.
- Treat all request input as untrusted and validate it.
- Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
