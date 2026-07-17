# Glimmer Path — prototype

Original **match-3** prototype inspired by Candy Crush–class design (hooks, juice, saga map) — **not** King / Candy Crush IP.

**Theme:** match light-motes, save characters from *The Dim* (forgetting).

## Play in browser

### Share links (public)

| | |
|--|--|
| **Play** | https://kalninskristaps-solo-dev.github.io/glimmer-path-prototype/Prototype/ |
| **Repo** | https://kalninskristaps-solo-dev/glimmer-path-prototype |

GitHub Pages: branch `main`, site root `/`. If the play URL 404s right after a push, wait 1–2 minutes.

### Local

```bash
cd Prototype
python3 -m http.server 8765
# open http://localhost:8765
```

Or open `Prototype/index.html` directly in a modern browser.

### Continue later (new session)

Read **[HANDOFF.md](./HANDOFF.md)** — status, git, bugs fixed, next steps, agent checklist.

## What’s in the prototype

| Area | Contents |
|------|----------|
| **First minute** | Cold open → play in seconds → “save Pip” payoff |
| **Match-3** | Swap, cascades, Beam / Burst / Prism specials, fog, blooms |
| **Map** | Living path, characters to rescue, real timers |
| **Hooks** | Energy, lantern days, keepsakes, free Lucky Wick spin |
| **Planning** | Design docs under `planning/` |

## Structure

```
Candy Crush Clone/      # git root → glimmer-path-prototype
├── HANDOFF.md          # Session continuity (read when resuming)
├── Prototype/          # Playable web prototype
│   ├── index.html
│   ├── css/
│   └── js/
├── planning/           # Research + design docs
└── README.md
```

## Share notes

- Static HTML/CSS/JS — no build step
- Progress stored in browser `localStorage` (`glimmer-path-proto`)
- Legal fence: free RNG spin only, real timers, no paid loot boxes in this prototype

## Product name

Working title: **Glimmer Path**
