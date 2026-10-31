# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## Reporting a vulnerability

Please do not report security vulnerabilities through public issues or pull requests.

Use GitHub's private vulnerability reporting instead:

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Describe the problem, the affected version and the steps to reproduce it.

You can expect an acknowledgement within 7 days. This is a student project, so fixes are made on a best-effort basis, and reporters will be credited if they wish.

## Security measures in this repository

- CodeQL code scanning on every pull request and weekly
- Dependabot alerts and weekly update pull requests for npm packages and GitHub Actions
- Secret scanning with push protection
- Dependency review and `npm audit` checks in CI
- Branch ruleset on `main`: pull request required, status checks and code scanning results must pass
- Workflows run with least-privilege `GITHUB_TOKEN` permissions
- API hardening: security headers (Helmet), rate limiting, request size limit, strict input validation, no internal error details in responses
