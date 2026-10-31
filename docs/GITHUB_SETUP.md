# GitHub setup checklist

These are manual steps to complete on github.com after pushing the local repository. Perform them in order.

1. Create a new empty **public** repository named `secure-node-devsecops` on GitHub (do not add a README, license or .gitignore on GitHub — they already exist locally). Public repositories get CodeQL, secret scanning and Dependabot for free.

2. Push the local repository:

   ```bash
   git remote add origin https://github.com/venkatapraneel-sketch/secure-node-devsecops.git
   git push -u origin main
   ```

3. In **Settings, Advanced Security** (it may be labelled "Code security" depending on the GitHub UI), enable: Dependency graph, Dependabot alerts, Dependabot security updates, Secret scanning, Push protection, and Private vulnerability reporting. Do NOT enable CodeQL "default setup": this repository uses the `codeql.yml` workflow, and enabling both causes upload conflicts.

4. Open the **Actions** tab and confirm the first CI and CodeQL runs on `main` finish green. The status check names ("Lint & test" and "Analyze (javascript-typescript)") only appear in the ruleset picker after they have run once.

5. Create labels `bug`, `enhancement`, `dependencies`, `github-actions` and `security` (Issues, Labels) if they do not exist. Dependabot and the issue templates reference them.

6. Open Settings, Rules, Rulesets, New branch ruleset named `protect-main`, Enforcement status Active, target the default branch, with these rules:
   - Restrict deletions
   - Block force pushes
   - Require a pull request before merging (set required approvals to 0 when working alone; GitHub does not let you approve your own pull request)
   - Require status checks to pass, adding "Lint & test" and "Analyze (javascript-typescript)"
   - Require code scanning results, with tool CodeQL, security alerts "High or higher" and alerts "Errors"

   The "Dependency review" check only runs on pull requests, so add it to the required checks after the first pull request has run it.

7. Enable Issues and Projects (Settings, General, Features). Create a GitHub Project (Projects tab, New project, Board layout) with columns Todo, In progress and Done. Create one issue per phase of the work and add them to the board.

8. Verify `.github/CODEOWNERS` contains your real GitHub username.

9. When finished, create a release: Releases, Draft a new release, new tag `v1.0.0`, title "v1.0.0", generate release notes, publish.

## Troubleshooting

- **A required check cannot be selected in the ruleset picker.** The check has not run yet. Trigger a push or pull request to `main` and return to the picker once the run completes.
- **CodeQL upload errors in the Actions log.** The most common cause is that the default CodeQL setup is also enabled in Settings. Disable the default setup; this repository manages scanning through `codeql.yml`.
- **Dependabot label warnings.** Dependabot cannot find a label it was configured to apply. Return to step 5 and create the missing label (`dependencies`, `github-actions`, or similar) under Issues, Labels.
