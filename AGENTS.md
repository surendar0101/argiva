# Agent instructions

Before doing anything in this repo, read [sdd/state.json](sdd/state.json). It holds the current phase and step, all decisions so far, open items and the TODO list.

- Resume from `currentStep` and anything in `awaitingOwner`.
- Follow [.github/prompts/scaffold-argiva.prompt.md](.github/prompts/scaffold-argiva.prompt.md) for the full process and requirements, and [docs/brand-content.md](docs/brand-content.md) for all copy and policies.
- After every decision or completed task, update `sdd/state.json` and append to the matching `sdd/*.md` log.
- Save state continuously, because the session can end at any time. Record questions in `awaitingOwner` before asking them. Write plans to `nextActions` before long work. Validate the JSON after each edit. Never end a turn with stale state.
- End each turn by telling the owner the current step and the next step.
- Every phase plan ends with a documentation task. A phase isn't done until it is complete. The task covers:
  - [README.md](README.md);
  - [docs/setup.md](docs/setup.md) for owner one-time setup such as accounts and services;
  - [docs/runbook.md](docs/runbook.md) for operations;
  - a README for each new app or package;
  - ADRs;
  - [docs/README.md](docs/README.md), the docs index.

  The full rule is in the prompt's Process section.
- Never `git commit` or `git push`.
