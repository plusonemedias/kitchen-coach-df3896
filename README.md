# Kitchen Coach — two trackers (Jean + Her)

A single-page web app that ships as **two configured instances** — one for Jean, one for his
girlfriend. Each is a mobile-first, installable nutrition tracker with a dashboard, one-tap
food logging, weigh-ins, and an **offline coach**. **No backend, no cloud, no accounts, no API,
nothing to pay for.** Each person's data lives only in their own browser.

Royal **white-and-gold** theme — calm, minimal, elegant.

## Open it

Static files — no build step.

- **Double-click `index.html`**, *or* serve the folder (recommended, so the PWA installs cleanly):
  ```
  cd kitchen-coach
  node server.js        # → http://localhost:4178
  ```
  (Any static server works; `server.js` is a tiny zero-dependency one included for convenience.)

You'll see a chooser: **Jean** or **Her**. Each opens its own tracker:

- Jean → `index.html?user=jean` (gold + royal navy)
- Her → `index.html?user=gf` (champagne gold + royal plum)

Bookmark the right URL on each phone so they never mix up instances.

## Install to a phone home screen (PWA)

1. Open the instance URL in the phone browser (Safari on iOS, Chrome on Android).
2. **iOS:** Share → *Add to Home Screen.* **Android:** menu → *Install app.*
3. It launches full-screen and works offline — **including the coach**, since the coach needs no network.

> Install **after** navigating to `?user=jean` or `?user=gf` so the app opens into the right tracker.

## Tabs

- **Today** — the hero **protein ring** (gold), calories + water below it, a plain-language
  "what's left" line, and a **Tap to log** list of today's meals: **one tap logs a meal**, with
  per-portion macros already filled. Also the **desk-nibble counter** (Jean) and the week-2 prompt.
- **Log** — the full template library (one tap each), manual add for anything else, and today's timeline.
- **Weigh** — weekly weigh-in + trend chart with the goal line.
- **Coach** — the offline coach (below).
- **Kitchen** — this week's grocery list + Sunday batch steps.

## The coach — offline & free (no API key)

The coach is **fully offline**. It reads your **real logged data** (today's food, running totals,
remaining macros, recent weigh-ins, day type) and the masterbrief rules, and answers locally —
**no API key, no cost, no network call ever.**

Tap a chip or type a question:

- **What should I eat now?** — fits a real template meal to your remaining protein/calories
- **Am I on track?** — today's numbers in a table with a verdict
- **Plan my day** — your full meal template for today's day type, with a running calorie total
- **Eating out**, **Craving a snack**, **Batch & grocery**, plus water, weight, and protein questions

It also enforces the couple rule: if Jean asks about her plate, it redirects him.

> Because it's rule-based (not a large language model), it won't free-form chat about anything —
> it's a focused coach for *this* plan and *your* data. Everything it says is grounded in your log.

## Back up / move devices

Settings (⚙) → **Export JSON backup** saves all of that person's data to a file.
**Import JSON backup** restores it on another device.

## Changing the numbers

All targets, meal templates with per-portion macros, the grocery list, batch steps, and the coach's
knowledge facts live in **`config.js`**, with inline comments. Protein values are taken straight from
the masterbrief; per-item calories are estimates allocated to sum to each day's confirmed total.

- **Jean:** confirmed numbers, used directly (Training 2,400/220, Soccer 2,500/220, Rest 2,100/200,
  floor 2,059, eating window 12–8, weekly schedule baked in → today's day type auto-detected).
- **Her:** **estimates** (~1,650 kcal / ~130g P, floor 1,550, no fasting), labelled as such in the UI.
  The app **never auto-trims** them — the week-2 prompt only *suggests* a trim after two clean logged
  weeks, which you confirm by hand.

## The couple rule (hard constraint, built in)

Each instance is single-person. Jean's tracker has **zero** visibility into hers and vice versa —
data is namespaced per user in storage and only one instance loads at a time. There is no shared
view, leaderboard, or compare-to-partner anywhere. The kitchen enforces; he never audits her plate.

## Privacy

No server, no database, no analytics, no API. All data is `localStorage` on the device, and the app
makes **no network calls at all**.
