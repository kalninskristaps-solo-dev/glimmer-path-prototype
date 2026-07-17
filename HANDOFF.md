# Glimmer Path — handoff (continue without prior chat)

**Last updated:** 2026-07-17  
**Status:** Playable browser prototype, judged OK to share. Public on GitHub + Pages.

Use this file when starting a new session. Read `README.md` + this, then `planning/` for design depth.

---

## What this is

Original **CCS-class match-3** prototype (hooks, juice, saga map). **Not** King / Candy Crush IP.

| | |
|--|--|
| **Working title** | **Glimmer Path** |
| **Theme** | Match light-motes; characters threatened by **The Dim** (forgetting) |
| **Scope** | Static HTML/CSS/JS only — no build, no backend |
| **Progress** | Browser `localStorage` key: `glimmer-path-proto` |
| **Local path** | `/Users/kristapskalnins/Documents/Grok/Candy Crush Clone/` |

Folder name is still `Candy Crush Clone` (historical). Product name in UI/docs is **Glimmer Path**.

---

## Share links (live)

| What | URL |
|------|-----|
| **Repo** | https://github.com/kalninskristaps-solo-dev/glimmer-path-prototype |
| **Play (GitHub Pages)** | https://kalninskristaps-solo-dev.github.io/glimmer-path-prototype/Prototype/ |
| **Git remote** | `origin` → above repo, branch `main` |
| **GitHub user** | `kalninskristaps-solo-dev` (authenticated via `gh` on this machine) |

Pages source: **main** branch, **root** `/`. First deploy can take 1–2 minutes; if 404, wait and hard-refresh.

**Only this folder is the git repo** — not the whole Grok workspace. Do not init git higher up.

---

## Run locally

```bash
cd "/Users/kristapskalnins/Documents/Grok/Candy Crush Clone/Prototype"
python3 -m http.server 8765
# open http://localhost:8765
```

Or open `Prototype/index.html` in a modern browser. A local server may already be running on port **8765**.

---

## Layout

```
Candy Crush Clone/          ← git root (this repo)
├── HANDOFF.md              ← you are here (session continuity)
├── README.md               ← short public overview
├── .gitignore
├── planning/               ← design docs (principles, not King IP)
│   ├── README.md
│   ├── candy-crush-research-review.md
│   ├── 02-hooks-retention-and-legal-monetization.md
│   ├── 03-art-style.md
│   ├── 04-gameplay.md
│   └── 05-story-and-campaign.md
└── Prototype/
    ├── README.md
    ├── index.html          ← screens shell
    ├── css/prototype.css
    └── js/
        ├── app.js          ← flow, levels, map, meta hooks, win
        ├── board.js        ← match-3 engine
        └── story.js        ← dialogue / cold open
```

---

## What the prototype includes

### First minute / campaign
- Cold open → play quickly → early “save Pip” style payoff
- Title → story (skippable) → onboarding levels → living map
- **Campaign end** when characters/path goals done (`campaignDone` in state)
- **Reset new game** on title clears `localStorage` and restarts intro

### Match-3
- Swap, match ≥3, cascades
- **Specials:** Beam (match 4), Burst (L/T), Prism — with detonate FX
- **Auto-deploy:** specials fire when their color is matched (not only manual)
- Blockers: fog film; goals include blooms / collect colors
- Win when goals met: `finishLevel()` from end-of-move / cascade stop (fixed so goals-met doesn’t hang)

### Meta / legal dark hooks (prototype only — free, transparent)
- Energy (session pacing)
- Lantern days
- Keepsakes
- **Lucky Wick** — free daily/slot-style spin only (no paid loot boxes in this build)
- Real timers on map (not fake “wait” UI only)

### Art / feel
- Brighter symbols and backgrounds than early draft
- FLIP-style motion + faster FX (after “slow/funky” feedback)
- Pastoral prism / glass-mote direction (see `planning/03-art-style.md`)

### Levels (sample spine)
1. First Spark — match 3, collect  
2. Glass Rain — cascades + Beam  
3. Soft Thorns — fog  
4. Burst of Dawn — Burst  
5. Lantern Trial — blooms / mini-boss feel  

More map/story content lives in `app.js` + `story.js` beyond the five onboarding beats.

---

## Bugs fixed in prior session (don’t re-break)

| Issue | Direction of fix |
|-------|------------------|
| Slow / funky motion | Faster FX; FLIP-style board animation |
| Specials hard to see | Detonate FX; clearer special tiles |
| Specials only manual | Auto-fire when matching that color |
| Level doesn’t end when goals met | `finishLevel` from `endMove` / cascade idle; safe DOM |
| Map loop / no first-minute hook | `campaignDone` + cold open path |
| Whole Grok vault almost published | Git only under this folder |

---

## Push / update after changes

```bash
cd "/Users/kristapskalnins/Documents/Grok/Candy Crush Clone"
git status
git add -A
git commit -m "Describe change"
git push origin main
```

Pages redeploys from `main`. Confirm with `gh auth status` if push fails.

Optional: `gh repo view --web` opens the repo.

---

## Intentionally out of scope (prototype)

- Full season / shop / energy IAP  
- Online friends / accounts  
- Real audio VO  
- Full multi-act level pack (planning describes the vision; code has a short spine)  
- Paid RNG / loot boxes  

Legal fence for any continuation: free transparent RNG only; real timers; no dark-pattern paid gambling.

---

## Design doc map

| Doc | Use when… |
|-----|-----------|
| `planning/candy-crush-research-review.md` | Why CCS-class games hook |
| `02-hooks-retention-and-legal-monetization.md` | Retention + legal monetization |
| `03-art-style.md` | Visual / audio identity |
| `04-gameplay.md` | Loop, specials, goals, meta |
| `05-story-and-campaign.md` | Narrative, Dim, map, seasons |

---

## Suggested next work (if continuing)

Pick based on feedback from shares:

1. Polish first 60s (copy, pacing, fail/win clarity)  
2. More levels on the map + clearer character timers  
3. Mobile touch/drag feel pass  
4. SFX stubs or music bed  
5. Visual polish pass (sprites vs pure CSS)  
6. Light analytics or “share progress” (optional; keep static if possible)  

User note from last session: **“Looks ok for prototype”** — priority was shareability, not feature expansion.

---

## Agent / session checklist

When resuming in a new chat:

1. Read this file + `README.md`  
2. Confirm remote: `git remote -v` should be `glimmer-path-prototype`  
3. Run or open Pages play URL; smoke-test: new game → clear a level → map  
4. Do **not** create a second git root in parent `Grok/`  
5. Match tone of existing `app.js` / CSS; keep legal hooks free-only unless product decision changes  

---

## One-liner for others

> Play **Glimmer Path** (original match-3 prototype):  
> https://kalninskristaps-solo-dev.github.io/glimmer-path-prototype/Prototype/  
> Source: https://github.com/kalninskristaps-solo-dev/glimmer-path-prototype  
