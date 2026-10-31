# Demo guide

This guide walks through a 5 to 7 minute demonstration showing that insecure changes are stopped by the pipeline. It uses three short-lived demo branches. Capture a screenshot after each key moment as noted.

---

## Demo A: insecure code is caught by CodeQL

```bash
git switch main && git pull
git switch -c demo/insecure-greeting
```

In `src/app.js`, insert the following block immediately before the line `// Unknown route.`:

```javascript
  // DEMO ONLY: deliberately insecure route (reflected XSS) to trigger CodeQL.
  app.get('/greet', (req, res) => {
    res.send('<h1>Hello ' + req.query.name + '</h1>');
  });
```

```bash
git add src/app.js
git commit -m "feat: add greeting route (demo of insecure code)"
git push -u origin demo/insecure-greeting
```

Open a pull request from `demo/insecure-greeting` into `main`.

**Expected:** CodeQL reports a reflected cross-site scripting alert (rule `js/reflected-xss`) and the branch ruleset blocks the merge. Capture a screenshot of the CodeQL alert on the pull request page and of the merge button showing that checks have not passed.

If no alert appears, wait for the CodeQL workflow run to finish and then check Security, Code scanning on the repository.

To resolve: delete the insecure route from `src/app.js`, commit and push, and show the checks turning green. Then close the demo pull request without merging and delete the branch.

---

## Demo B: vulnerable dependency is blocked

```bash
git switch main && git pull
git switch -c demo/vulnerable-dependency
npm install lodash@4.17.15
npm run audit:high   # should now exit with a non-zero code
git add package.json package-lock.json
git commit -m "chore: add lodash 4.17.15 (demo of vulnerable dependency)"
git push -u origin demo/vulnerable-dependency
```

Open a pull request from `demo/vulnerable-dependency` into `main`.

**Expected:** the "Lint & test" check fails at the `npm run audit:high` step and "Dependency review" reports high-severity advisories. Capture a screenshot of the failed CI step and of the dependency review summary.

To resolve: run `npm uninstall lodash`, commit and push, and show the checks turning green. Close the demo pull request without merging and delete the branch.

---

## Demo C: trace the change with history tools

Show the following, capturing a screenshot of each view:

- The **Blame** view of `src/app.js` on GitHub (or any file on `main`), showing which commit introduced each line.
- The command `git log -S "greet" --oneline --all` in the terminal, which surfaces the commit that added the greeting route.
- GitHub pull request search with filters such as `is:pr is:closed label:dependencies`, showing how past dependency updates are discoverable.
- An issue cross-linked from a pull request using `Closes #N` in the pull request description.

---

## Demo D: Dependabot

Show the following, capturing a screenshot of each:

- The **Security** tab, Dependabot alerts page, listing any open dependency advisories.
- The pull requests labelled `dependencies` that Dependabot opens each week for npm packages and for GitHub Actions version updates.

---

## Demo E (optional): secret scanning push protection

Follow GitHub's documentation "Working with push protection from the command line" on a throwaway branch. Never paste a real credential into any file. Do not commit any key-like string to `main`.

---

## Demo checklist

Capture a screenshot of each of the following before the demo session ends:

- [ ] CodeQL reflected-XSS alert displayed on the Demo A pull request
- [ ] Branch ruleset blocking the merge on the Demo A pull request
- [ ] Failed "Lint & test" audit step on the Demo B pull request
- [ ] Failed dependency review on the Demo B pull request
- [ ] Ruleset blocking the merge on the Demo B pull request
- [ ] Dependabot alerts page
- [ ] Blame view of a source file
- [ ] GitHub Projects board with issues in the appropriate columns
- [ ] Final green checks on `main` after the demo branches are cleaned up
- [ ] The v1.0.0 release page
