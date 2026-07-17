# Gameplay design — Glimmer Path

**Product:** Glimmer Path  
**Depends on:** [Research review](./candy-crush-research-review.md) · [Hooks](./02-hooks-retention-and-legal-monetization.md)  
**Related:** [Art](./03-art-style.md) · [Story](./05-story-and-campaign.md)  
**Date:** 2026-07-17

---

## 1. Design goals

| Goal | Spec |
|------|------|
| Instant literacy | First successful match in <15 seconds of first launch |
| Depth | Specials × blockers × goals = years of levels without new verbs |
| Skill + luck | Both required (CCS secret sauce — keep it) |
| Session | 2–5 minutes per level; multi-session days via energy |
| Fair free path | Campaign completable without pay; pay = speed/comfort/cosmetics |
| Meta hooks | Grove, collections, streaks, seasons sit *between* boards |

**Primary verb:** swap adjacent motes to align 3+ of one type.

---

## 2. Board fundamentals

- Grid: variable shapes (rectangular, notched, multi-room) up to ~9×9 effective.
- Swap only orthogonal neighbors.
- Match ≥3 in row or column clears.
- Gravity: default **down**; some levels/events flip gravity (Soda lesson — real twist, use sparingly).
- Cascades auto-resolve; player input locked mid-cascade.
- Illegal swaps snap back; idle hint after ~5s (early game), longer later.
- No timer by default (mass market); timed modes = event spice only.

### Colors

- Early levels: 4–5 colors.  
- Standard: 5–6.  
- Hard: 6 + awkward shapes.

---

## 3. Specials

| Create condition | Name | Effect |
|------------------|------|--------|
| Match 4 in a line | **Beam Mote** | Clears full row *or* column (direction = match orientation) |
| Match L/T or 2×2 (pick one rule and stick) | **Burst Mote** | Clears area (3×3 or plus-shape — pick in prototype) |
| Match 5 in a line | **Prism Core** | Clears all of one color *or* becomes combo catalyst |
| Beam + Beam | Cross beam | Row + column |
| Burst + Beam | Super lane | Fat line clear |
| Prism + any special | Amplify | Full-board light event (juice tier 5) |
| Prism + Prism | **Aurora** | Near-board-clear; rare |

**Design rule:** Creating specials is the skill fantasy; detonating combos is the variable super-reward.

### Pre-level boosters (examples)

| Booster | Effect |
|---------|--------|
| Starting Beam | One beam on board at start |
| Color brush | Paint one mote color |
| Hammer (in-level) | Destroy one tile / layer |
| Extra moves +5 | Classic CCS-like |

Earn via play, season, dailies; buy as convenience.

---

## 4. Blockers (The Dim’s tools)

| Blocker | Behavior | Player read |
|---------|----------|-------------|
| **Fog film** | Needs 1 match adjacent/on to clear | Soft layer |
| **Crystal shell** | Multi-hit (2–3) | Hard shell |
| **Shadow mold** | Spreads to empty/adjacent each N moves if not reduced | Urgency (chocolate analogue) |
| **Lock seal** | Mote locked until special/adjacent clear | Immobilize |
| **Void tile** | No mote rests; shapes board | Layout |
| **Chain vine** | Connects tiles; clear chain nodes | Puzzle |

Introduce **one new blocker every few episodes**, not a dump.

---

## 5. Level goals (variety engine)

| Goal type | Win condition |
|-----------|----------------|
| **Light the blooms** | Clear bloom markers under tiles (jelly analogue) |
| **Plant seeds** | Drop seed tokens to soil row (ingredient analogue) |
| **Gather orders** | Collect N motes / specials |
| **Score starline** | Reach score (secondary or rare primary) |
| **Purge mold** | Eliminate all shadow mold + survive |
| **Protect lantern** | Optional: keep a tile safe (advanced) |
| **Boss Dim** | Multi-phase objective on set pieces (episode ends) |

**Stars (1–3):** score or efficiency thresholds for completionists; **1 star enough to progress** campaign.

---

## 6. Difficulty craft

### Curve principles (from CCS, refined)

1. Teach → test → spike → relief plateau.  
2. Episode finale harder than mid-episode.  
3. Scallops prevent endless despair.  
4. Near-miss: many fails leave board “almost” (1 special / 1–2 moves short) without scripting illegal wins.

### Win-rate targets (design intent)

| Segment | Approx clear rate (no booster) |
|---------|--------------------------------|
| Onboarding (1–20) | High (70%+) |
| Early mid | 40–60% |
| Spikes | 15–30% |
| Relief | 50%+ |

Numbers tuned via telemetry later; never use secret pay-to-win RNG.

### Energy interaction

- Fail = −1 energy.  
- Out of energy = wait / ad optional / IAP / friend.  
- First fail of day free (hooks doc).  

---

## 7. Meta gameplay (between levels)

```
[Login] → Grove glance + streak → Daily Prism → Campaign / Event → Win feed Grove + album → Energy check → Exit
```

| System | Player action | Reward |
|--------|---------------|--------|
| **Grove** | Auto-updates on wins | Visual ownership, cosmetics slots |
| **Energy** | Spend to play campaign/event | Gate habit |
| **Streaks** | Daily open / daily win | Ladder rewards |
| **Daily Prism** | 1 special board / day | Album crumbs + currency |
| **Collections** | Passive drops | Completion itch |
| **Season track** | XP from levels | Free/premium rewards |
| **Master Path** | Hard remixes post-campaign | Titles, frames |
| **Grove Circle** | Async weekly goal | Shared cosmetic |

**Endless practice mode:** no energy, no campaign rewards — fairness offload and skill training.

---

## 8. Controls & feel

| Input | Behavior |
|-------|----------|
| Tap-drag / swipe | Swap |
| Tap-tap | Optional second control scheme |
| Undo | None mid-level (stakes); optional pre-boost only |
| Pause | Goals + quit (quit = fail if moves spent — be transparent) |

**Feel goals:** snappy swap, elastic settle, readable cascade order (left-to-right / top-to-bottom consistent).

---

## 9. Modes roadmap

| Mode | Energy | Purpose |
|------|--------|---------|
| Campaign Path | Yes | Core story + grove |
| Daily Prism | Free 1/day | Habit + collection |
| Season boards | Yes | FOMO content |
| Event Cup | Yes / tickets | Competitive cosmetic |
| Master Path | Yes | Veterans |
| Practice | No | Training |

---

## 10. Progression economy (high level)

| Currency | Earn | Sink |
|----------|------|------|
| **Light dust** | Levels, dailies | Album unlocks, minor cosmetics |
| **Prism coins** | Soft premium earn | Boosters |
| **Season XP** | Play | Track |
| **Premium season token** | IAP | Premium track |
| **Gems** (premium) | IAP / rare free | Energy, bundles, cosmetics |

Avoid four confusing premium currencies. Prefer **one real-money gem** + soft currencies.

---

## 11. Onboarding (levels 1–12)

1. Swap tutorial — forced match.  
2. Cascades celebration.  
3. First Beam create + detonate.  
4. First goal type: blooms.  
5. First fail teaching energy (gentle).  
6. Grove first light cinematic (short).  
7. Burst special.  
8. First blocker fog.  
9. Orders goal.  
10. Mold intro.  
11. Prism core.  
12. Episode boss lite + season UI teaser.

No shop pressure before level 10.

---

## 12. Level design checklist (per level)

- [ ] Clear single primary goal  
- [ ] Teach or test ≤1 new idea  
- [ ] Board has intentional paths, not pure noise  
- [ ] At least one skilled line to create a special  
- [ ] Fail states not soft-locked (always some moves)  
- [ ] Juice moments possible without perfect play  
- [ ] Time-to-complete estimate 1–4 minutes  

---

## 13. What we take from CCS / what we change

| Keep | Change |
|------|--------|
| Match-3 + specials + limited moves | Theme, names, juice identity |
| Saga chunks (~15 levels) | Living grove meta |
| Skill + luck | Stronger collections / seasons |
| Energy-like gate | Fairer early game; first-fail free |
| Boosters | Cosmetics-led monetization |

---

## 14. Prototype vertical slice (build order)

1. Grid, swap, match, gravity, cascades  
2. Score + moves + win/lose  
3. Beam + Burst specials  
4. One goal type (blooms)  
5. Juice tiers 1–4  
6. Energy stub  
7. One grove visual state change on win  

If the slice is not fun, **no** amount of streak systems will save it.

---

## 15. One-line gameplay promise

**Easy first swap, deep special combos, fair free campaign — with a grove and albums that make “one more level” about more than a number.**
