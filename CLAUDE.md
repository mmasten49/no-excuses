# CLAUDE.md: Module 4 app

MGMT 342, Fall 2026. Matthew Masten's Module 4 project: **No Excuses**, a small phone web app that helps a college student track and cut spending on one or two habits, pizza and cash purchases.

## The map: which file holds what

| File | What it holds | What gets built from it |
|---|---|---|
| `problem.md` | Who has the problem, what it costs, how it's handled today, and how we'd know it's solved | Nothing. It's the reference for every other file. |
| `evidence.md` | Research with sources, survey results, and the plan for the classmate test | The business case |
| `solution.md` | What the app does, step by step, screen by screen, and what it does **not** do | **The app. This is the build file.** |
| `web-page.md` | The copy for the page that explains the app | The web page |
| `ad-script.md` | A 30–60 second commercial, scene by scene | The ad (Nov 19) |
| `app/` (`index.html` + `logic.js`) | The working app, built from solution.md. `logic.js` holds all the math. | n/a |
| `web/index.html` | The marketing page, built from web-page.md. Its button links to `../app/index.html`. | n/a |
| `media/ad/` | The motion graphic ad, built from ad-script.md (Session 25) | n/a |
| `survey-form.md` / `survey-form.gs` | The survey, as instructions for browser Claude or as an Apps Script | The Google Form |

## Rules for building
- **Build the app from `solution.md` only.** If something isn't in solution.md, don't build it. Ask.
- **"What it does not do" in solution.md is a hard limit.** Never add a feature that's on that list, or one that isn't written down.
- **Keep it tiny.** The app has to run in a phone browser on its own computer. No accounts, no server and no paid services. It costs $0.
- **When files disagree,** stop and point out the conflict. Don't pick a side.
- **Never invent numbers, survey results or research.** If something is missing, leave it blank and say so.

## Key dates
- **Nov 10:** problem.md, evidence.md and solution.md drafted, and the survey sent.
- **Nov 12 (Thu):** survey answers are due. The agent builds the first version from solution.md plus the survey answers.
- **Nov 17:** a classmate reads the web page and tests the app. web-page.md has to be done before then.
- **Nov 19:** the ad gets produced from ad-script.md.
