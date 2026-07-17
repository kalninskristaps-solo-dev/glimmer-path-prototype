# Glimmer Path — Prototype

Playable **new-game experience**: title → story intro → onboarding levels → core match-3 → grove / path tease.

Opens in any modern browser. No build step, no server required (file:// works).

## Run

```bash
open "index.html"
```

Or drag `index.html` into Chrome / Safari / Firefox. For cleanest mobile feel, use a local static server:

```bash
cd Prototype && python3 -m http.server 8765
# then open http://localhost:8765
```

## What this prototype proves

| Pillar | In prototype |
|--------|----------------|
| **Look** | Luminous pastoral prism UI — glass motes, dark glass chrome, soft fog world |
| **Story** | Full first-session narrative (Luma, Pathkeeper, The Dim, Glimmer Path) |
| **Core loop** | Swap → match ≥3 → cascade → specials → limited moves → goal |
| **Onboarding** | Scripted levels 1–5 as every new campaign begins |
| **Meta teaser** | Home Glade lights after first clear; path map after Act I sample |

## Levels (new game)

1. **First Spark** — swap & match 3, collect Rose quartz  
2. **Glass Rain** — cascades + Beam Mote (match 4)  
3. **Soft Thorns** — Fog film blocker  
4. **Burst of Dawn** — Burst Mote (L / T)  
5. **Lantern Trial** — blooms goal + mini boss feel  

Skip story anytime. Progress is in `localStorage` under `glimmer-path-proto`. Use **Reset new game** on the title screen to replay the full intro.

## Files

| Path | Role |
|------|------|
| `index.html` | Screens shell |
| `css/prototype.css` | Art direction + layout |
| `js/story.js` | Dialogue sequences |
| `js/board.js` | Match-3 engine |
| `js/app.js` | Flow, levels, grove/map |

## Not in scope (by design)

- Full season / shop / energy IAP  
- Online friends  
- Sound VO (SFX stubs only if browser allows)  
- Full 75-level Act I  

Planning sources: `../planning/`.
