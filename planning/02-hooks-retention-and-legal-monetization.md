# Better than the original: hooks, retention, legal monetization

**Product:** Glimmer Path  
**Depends on:** [Research review](./candy-crush-research-review.md)  
**Related:** [Gameplay](./04-gameplay.md) · [Story](./05-story-and-campaign.md) · [Art](./03-art-style.md)  
**Date:** 2026-07-17

---

## 1. Thesis

Candy Crush Saga is excellent at **juice**, **skill/luck levels**, and **lives-as-habit**. It is mediocre at **personal ownership**, **seasonal identity**, **collection completion**, and **modern fair-but-sticky meta**.

We beat it on **habit density** and **years-long identity** — not by breaking the law, lying to players, or running unlicensed gambling.

**Goal:** A product players return to for years because *their world, collections, streaks, and status feel unfinished and theirs* — while every monetization path stays legal, transparent, and defensible.

---

## 2. Legal fence (non-negotiable)

These are design constraints, not optional ethics flavor. Shipping markets may need formal counsel; this is the product rulebook.

| Rule | Why |
|------|-----|
| **No real-money gambling** | No wagering for cash/prizes of monetary value; no casino mechanics. |
| **No paid loot boxes with hidden odds** | Prefer **zero** paid RNG loot. Cosmetics and boosters: fixed shop, season track, or earnable. If any random paid bundle ever ships, **odds published** and region law checked (BE/NL and others are strict). |
| **No fake social pressure** | No invented “friends waiting,” fake unread gifts, or fabricated scarcity clocks. Timers show real end times. |
| **No silent subscriptions** | Recurring purchases only with clear opt-in, price, and cancel path (platform + in-app). |
| **Clear pricing** | Every IAP shows what you get before confirm. No bait “free” that is not free. |
| **Age & kids** | Under-13 (or local digital age of consent): parental gates for IAP/ads as required (COPPA / DSA / local). Default design assumes mixed ages → **no child-targeted dark patterns**. |
| **Privacy** | Opt-in push; easy mute. Minimize data. No selling personal profiles as a “feature.” |
| **IP** | No King names, logos, candy-clone branding, or stolen assets. Original theme only. |
| **Ads (if any)** | Labeled; not disguised as rewards UI. Reward ads optional, never forced mid-move. |
| **Accessibility of truth** | Difficulty may be tuned; **never** sell a pack that claims guaranteed win via hidden rigging. |

**Legal exploitation vs illegal exploitation**

| Allowed (behavioral product design) | Forbidden |
|-------------------------------------|-----------|
| FOMO with **true** season end dates | Fake timers / false urgency |
| Variable **free** rewards | Paid slot-machine loot without compliance |
| Soft energy walls + buy convenience | Paywall that makes core campaign unwinnable without spend early |
| Streaks, collections, status | Threats, harassment, real-world guilt spam |
| Opt-in notifications | Spam without consent |
| Cosmetic status | Misleading “you almost won money” |

Addiction-by-design of *habit* is legal in most markets. **Fraud, gambling without license, and targeting kids with deceptive IAP** are not.

---

## 3. Where Candy Crush leaves money and retention on the table

| CCS strength | CCS gap | Our upgrade |
|--------------|---------|-------------|
| Board juice | Thin “home” identity | Living grove you own |
| Saga map pins | Pins ≠ attachment | Endowment: plots, creatures, light fill-in |
| Lives / regen | Pure friction | Energy + meaningful daily systems |
| Social lives ask | Feels spammy | Opt-in Grove Circle; limited daily help |
| Endless levels | Low seasonal story | Seasons with identity + FOMO track |
| Boosters | Pay can feel dirty | Cosmetics + convenience first; boosters secondary |
| Stars | Weak collection loop | Albums, codex, mastery titles |

---

## 4. Core psychology we weaponize (legal)

1. **Variable ratio reinforcement** — cascades and free daily chests feel irregularly amazing (same family as CCS juice; free-only RNG).
2. **Near-miss** — level design keeps many fails as “one special short,” not hopeless (research-backed commitment fuel).
3. **Endowment effect** — anything the player *builds* or *names* is harder to abandon than a pin on a corporate map.
4. **Zeigarnik effect** — incomplete collection pages and open season tracks itch until closed.
5. **Loss aversion** — streaks and freeze tokens; loss is soft, visible, recoverable without scam.
6. **Peak-end rule** — session endings bias toward a win celebration or a clear “next free energy at HH:MM,” not mute shame.
7. **Goal gradient** — progress bars that accelerate near completion (season track, album pages).
8. **Social proof / status** — titles, trails, frames; optional, not required to progress.
9. **Habit stacking** — daily prism + streak + one energy dump = ritual.
10. **Hedonic adaptation fight** — energy caps prevent binge-burnout (CCS lesson kept and improved).

---

## 5. Systems that should out-hook Candy Crush

### 5.1 Living World Endowment (primary long-term hook)

Every campaign win feeds **your grove**:

- Paths light up, plots unlock, fauna return, ambient audio densifies.
- Optional rename of landmarks (local-only or cloud save).
- **Returning after absence:** grove *dims* slightly (visual wilt), not wiped. One “welcome back” session restores glow — **guilt + hope**, not punishment.

**Why stronger than CCS map:** players protect *property*, not a progress number.

### 5.2 Collection albums (completionism engine)

- Codex pages: creatures, flora, prism variants, lore fragments.
- Drops from wins, dailies, seasons — **earnable**.
- UI always shows **missing slots** (especially “1 left”).
- Paid option: season currency packs / time — **not** random paid card packs with hidden odds.

### 5.3 Streak architecture

| Streak type | Reward shape | Soft landing |
|-------------|--------------|--------------|
| Daily open | Small currency + free chest key | — |
| Daily win (1 campaign or daily) | Escalating 7-day ladder | Freeze token (earn 1/week free) |
| Season login milestones | Cosmetic crumbs | Catch-up login week for returners |

Never: “pay or lose 90 days of progress forever” without free recovery path.

### 5.4 Season Pass (transparent FOMO)

- Full track visible: free lane + premium lane.
- Premium is **cosmetic + convenience** heavy; power boosters modest and also earnable on free lane at slower pace.
- True end date on UI.
- No premium-only story chapters.

### 5.5 Energy (lives 2.0)

- Cap (e.g. 5–8); regen on timer.
- Fail spends energy; win does not refund by default (keeps stakes) but **first daily fail** can be free once (reduces rage-quit).
- Refills: wait / optional rewarded ad / IAP / friend help (1/day send).
- Early campaign: generous; late Master Path: tighter.

### 5.6 Adaptive “one more try” difficulty

- Target band: skilled-enough players win often enough to feel competent, fail often enough to crave retry.
- Soft DDA only on **RNG board deals** within published rules — never secret “you paid so we make it easy” without also making free path fair.
- Hard levels stay hard; sell **extra moves / boosters**, not “buy victory token.”

### 5.7 Session design

| Moment | Design |
|--------|--------|
| Login | Streak + daily chest + grove glance (ownership hit in <10s) |
| Mid | 1–3 levels, juice peaks on combos |
| Exit | Prefer star celebration or “energy full at …” |
| Push (opt-in) | Energy full, streak at risk (true), season ending (true) |

### 5.8 Social (anti-spam)

- **Grove Circle** (3–20 players): weekly collective goal (cosmetic tree for all).
- Async help: energy or “hint seed,” rate-limited.
- No wall posts required. No contact-book abuse.
- Events: cosmetic leaderboards; **no pay-to-rank with real-money prize pools** without gambling review.

### 5.9 Variable free rewards

Daily free chest: weighted table of boosters / cosmetic dust / album crumbs.  
**Free RNG is not gambling.** Display “bonus!” spectacle; never imply cash value.

### 5.10 Identity & status

- Titles: Pathkeeper I → Radiant Pathkeeper (year marks).
- Board frames, swap trails, win stamps — mostly season/mastery.
- Profile is optional share card (player-initiated).

### 5.11 Content cadence (product as service)

| Cadence | Content |
|---------|---------|
| Weekly | New levels or event board |
| 6–8 weeks | Full season (story region + track + cosmetics) |
| Quarterly | Major grove biome / quality pass |
| Always | Master Path remixes for veterans |

### 5.12 Commitment devices

- Optional weekly self-goals (“3 hard clears”) with cosmetic badge.
- Public only if player toggles share.

---

## 6. Monetization stack (legal, long-term ARPU)

**Whale fuel without casino:**

1. Season premium track  
2. Cosmetic shop (fixed prices)  
3. Energy / move refills (convenience)  
4. Booster bundles (clear counts)  
5. Optional ad-free / VIP comfort (no power monopoly)

**Conversion principles**

- First purchase should feel *smart* (season at discount, starter cosmetic) not *desperate*.
- Never gate Act 1 story.
- Show value of free path monthly so non-payers still evangelize (CCS lesson: free majority is the network).

**What we refuse for “more addiction”**

- Child-directed spend pressure  
- Loot boxes that simulate slots for money  
- Misleading odds  
- Hostage progress (delete grove if no pay)

---

## 7. Long-term retention model (12–36 months)

| Phase | Player state | Systems that keep them |
|-------|--------------|------------------------|
| Week 1 | Dopamine + competence | Juice, easy wins, first grove light |
| Month 1 | Habit | Streaks, energy ritual, album page 1 |
| Month 3 | Identity | Custom grove, first season complete, title |
| Month 6–12 | Service loyalty | Seasons, events, circle, collections |
| Year 2+ | Legacy | Year titles, Master Path, returning wilt/revive, social status |

**Churn recovery**

- Wilted grove + “light the path again” quest (free energy burst).  
- No punishment of inventory.  
- Email/push only if opted in.

**Metrics that matter (design targets, not vanity)**

- D1 / D7 / D30 retention  
- Energy sessions per day (habit)  
- Season track engagement free vs paid  
- % players with ≥1 collection “1 left” (Zeigarnik health)  
- Payer % and regret/refund rate (ethics canary)

---

## 8. Comparison: us vs Candy Crush on “addictive product”

| Dimension | Candy Crush | Glimmer Path (intent) |
|-----------|-------------|------------------------|
| Board feel | Excellent | Match or beat (art + juice docs) |
| Ownership | Weak | **Strong** (grove) |
| Collection | Weak | **Strong** (albums) |
| Seasons | Events, not identity-first | **Core** |
| Social | Effective but spammy | Cleaner, still sticky |
| Pay cleanliness | Boosters heavy | Cosmetics + convenience first |
| Legal risk of RNG pay | Historical booster focus | Explicitly low |
| Years-deep identity | Level number | Level + grove + titles + codex |

---

## 9. Risks (and mitigations)

| Risk | Mitigation |
|------|------------|
| Feels “more evil” than CCS | Legal fence + free path + no fake social |
| Meta drowns puzzle | Story/gameplay: meta is between levels, not mid-swap |
| Content treadmill burns team | Episode size 15; seasonal 30–50; tools later |
| Accessibility | Colorblind patterns, reduce motion (art doc) |
| Regulation shift | No paid loot dependency |

---

## 10. Implementation priority (when building)

1. Core match-3 + juice + energy  
2. Grove endowment updates on win  
3. Streaks + daily chest  
4. Collections  
5. Season track  
6. Circle social  
7. Monetization surfaces  

Do not ship paywalls before juice and free fun exist. A greasy empty shell does not addict — it churns.

---

## 11. One-line product promise

**Come back tomorrow because your grove is dimming, your album is one mote short, your streak is warm, and the board still feels unfairly good when it explodes — all without a single illegal lever.**
