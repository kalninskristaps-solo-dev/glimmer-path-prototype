/**
 * Glimmer Path prototype — new-game flow + levels
 */
(function () {
  const STORAGE_KEY = "glimmer-path-proto";

  const LEVELS = [
    {
      id: 1,
      ep: "First minute · Save Pip",
      title: "First Spark",
      luma: "Pink hearts (♥). Match 3+. Pip is fading — be quick.",
      tip: "Swap neighbours. Three in a row = light. That’s how you hold a name.",
      rows: 6,
      cols: 6,
      colorCount: 4,
      moves: 28,
      goals: [{ type: "collect", color: "rose", need: 8 }],
      layout: "tutorial",
      freeEnergy: true,
      skipIntro: true,
      save: {
        id: "pip",
        name: "Pip",
        role: "Firefly child",
        plea: "“I can’t find Mum’s song…”",
        saved: "Pip remembers the lullaby.",
      },
    },
    {
      id: 2,
      ep: "Rescue Nori",
      title: "Glass Rain",
      luma: "Match four in a line → Beam. Then match its colour to fire the line.",
      tip: "Match 4 → Beam. Match that colour again (or swap the Beam) to auto-fire.",
      rows: 7,
      cols: 7,
      colorCount: 5,
      moves: 26,
      goals: [
        { type: "collect", color: "citrine", need: 12 },
        { type: "make", special: "beam", need: 1 },
      ],
      layout: null,
      freeEnergy: true,
      save: {
        id: "nori",
        name: "Nori",
        role: "Bridge warden",
        plea: "“Travellers vanish without road marks.”",
        saved: "Nori lights the beam-post again.",
      },
    },
    {
      id: 3,
      ep: "Rescue Moss Elder",
      title: "Soft Thorns",
      luma: "Fog is The Dim. Match on or beside it to clear a layer.",
      tip: "Grey haze = fog. Match through or next to it.",
      rows: 7,
      cols: 7,
      colorCount: 5,
      moves: 26,
      goals: [{ type: "fog", need: 6 }],
      layout: "fogCenter",
      save: {
        id: "moss",
        name: "Moss Elder",
        role: "Grove memory",
        plea: "“My grandchildren’s names… fog ate them.”",
        saved: "The Elder speaks three names clear.",
      },
    },
    {
      id: 4,
      ep: "Rescue Kess",
      title: "Burst of Dawn",
      luma: "L or T shape → Burst. Match its colour to blast 3×3.",
      tip: "L/T → Burst. Match colour or swap to detonate.",
      rows: 7,
      cols: 7,
      colorCount: 5,
      moves: 26,
      goals: [
        { type: "make", special: "burst", need: 1 },
        { type: "collect", color: "jade", need: 10 },
      ],
      layout: null,
      save: {
        id: "kess",
        name: "Kess & twin",
        role: "Dancers",
        plea: "“We forgot the steps we swore to keep.”",
        saved: "The twins spin — gold dust rises.",
      },
    },
    {
      id: 5,
      ep: "Save Luma",
      title: "Lantern Trial",
      luma: "Light the gold blooms under tiles. This is Luma’s core.",
      tip: "Clear motes on gold rings to light blooms.",
      rows: 7,
      cols: 7,
      colorCount: 5,
      moves: 30,
      goals: [{ type: "blooms", need: 8 }],
      layout: "blooms",
      finale: true,
      save: {
        id: "luma",
        name: "Luma",
        role: "Your lantern",
        plea: "“If this fails… I may forget your face first.”",
        saved: "Luma’s core steadies. She knows you.",
      },
    },
  ];

  /** Node positions on SVG path (viewBox 320×720) — winding path */
  const PATH_NODES = [
    { x: 160, y: 80 },
    { x: 230, y: 200 },
    { x: 90, y: 320 },
    { x: 240, y: 450 },
    { x: 160, y: 600 },
  ];

  const ENERGY_MAX = 5;
  const ENERGY_REGEN_MS = 45000; // 45s prototype (full game: ~30min)
  const ALBUM_MAX = 12; // Keepsakes max (saved memories)
  const DIM_PRESSURE_MS = 8 * 60 * 1000; // 8 min real urgency on uncleared path

  /** Free Lucky Wick reel — weights sum 100. No paid spins. */
  const WICK_SYMBOLS = [
    { id: "empty", label: "—", weight: 28, reward: null },
    { id: "energy", label: "✦", weight: 22, prize: "energy" },
    { id: "keep", label: "♡", weight: 18, prize: "keepsake" },
    { id: "double", label: "××", weight: 12, prize: "energy2" },
    { id: "lantern", label: "⚑", weight: 12, prize: "streak_safe" },
    { id: "jackpot", label: "✶", weight: 8, prize: "jackpot" },
  ];

  const state = {
    screen: "boot",
    levelIndex: 0,
    maxUnlocked: 0,
    cleared: {},
    groveLevel: 0,
    seenIntro: false,
    storyQueue: [],
    storyIndex: 0,
    storyThen: null,
    board: null,
    moves: 0,
    progress: {},
    selected: null,
    busy: false,
    levelFinished: false,
    hintTimer: null,
    levelStartMoves: 0,
    // Legal dark hooks
    energy: ENERGY_MAX,
    energyMax: ENERGY_MAX,
    energyReadyAt: 0,
    streak: 0,
    lastWinDay: "",
    album: 0,
    albumMax: ALBUM_MAX,
    dailyPrismClaimedDay: "",
    firstFailFreeDay: "",
    peakCascade: 0,
    specialsThisLevel: 0,
    winSpinUsed: false,
    spinSource: null, // "win" | "daily"
    dimPressureEndsAt: 0,
    mapTimerId: null,
    campaignDone: false,
  };

  const $ = (id) => document.getElementById(id);

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.levelIndex = data.levelIndex || 0;
      state.maxUnlocked = data.maxUnlocked || 0;
      state.cleared = data.cleared || {};
      state.groveLevel = data.groveLevel || 0;
      state.seenIntro = !!data.seenIntro;
      state.energy = data.energy != null ? data.energy : ENERGY_MAX;
      state.energyReadyAt = data.energyReadyAt || 0;
      state.streak = data.streak || 0;
      state.lastWinDay = data.lastWinDay || "";
      state.album = data.album || 0;
      state.dailyPrismClaimedDay = data.dailyPrismClaimedDay || "";
      state.firstFailFreeDay = data.firstFailFreeDay || "";
      state.dimPressureEndsAt = data.dimPressureEndsAt || 0;
      state.campaignDone = !!data.campaignDone;
      tickEnergy();
    } catch (_) {}
  }

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        levelIndex: state.levelIndex,
        maxUnlocked: state.maxUnlocked,
        cleared: state.cleared,
        groveLevel: state.groveLevel,
        seenIntro: state.seenIntro,
        energy: state.energy,
        energyReadyAt: state.energyReadyAt,
        streak: state.streak,
        lastWinDay: state.lastWinDay,
        album: state.album,
        dailyPrismClaimedDay: state.dailyPrismClaimedDay,
        firstFailFreeDay: state.firstFailFreeDay,
        dimPressureEndsAt: state.dimPressureEndsAt,
        campaignDone: state.campaignDone,
      })
    );
  }

  function tickEnergy() {
    if (state.energy >= state.energyMax) {
      state.energyReadyAt = 0;
      return;
    }
    const now = Date.now();
    if (!state.energyReadyAt) {
      state.energyReadyAt = now + ENERGY_REGEN_MS;
    }
    while (state.energy < state.energyMax && state.energyReadyAt && now >= state.energyReadyAt) {
      state.energy++;
      if (state.energy >= state.energyMax) {
        state.energyReadyAt = 0;
      } else {
        state.energyReadyAt += ENERGY_REGEN_MS;
      }
    }
  }

  function spendEnergy() {
    tickEnergy();
    if (state.energy <= 0) return false;
    state.energy--;
    if (state.energy < state.energyMax && !state.energyReadyAt) {
      state.energyReadyAt = Date.now() + ENERGY_REGEN_MS;
    }
    save();
    refreshMetaHud();
    return true;
  }

  function refundEnergyOnce() {
    // first fail of day free
    if (state.firstFailFreeDay === todayKey()) return false;
    state.firstFailFreeDay = todayKey();
    if (state.energy < state.energyMax) state.energy++;
    save();
    return true;
  }

  function refreshMetaHud() {
    tickEnergy();
    const e = state.energy;
    const set = (id, v) => {
      const el = $(id);
      if (el) el.textContent = String(v);
    };
    set("hud-energy", e);
    set("hud-energy-max", state.energyMax);
    set("hud-streak", state.streak);
    set("hud-album", state.album);
    set("hud-album-max", state.albumMax);
    set("map-energy-n", e);
    set("map-streak-n", state.streak);
    const daily = $("btn-daily-prism");
    if (daily) {
      const claimed = state.dailyPrismClaimedDay === todayKey();
      daily.textContent = claimed ? "Lucky Wick · done" : "Lucky Wick · daily";
      daily.disabled = claimed;
      daily.classList.toggle("claimed", claimed);
    }
  }

  function pickWickSymbol() {
    const total = WICK_SYMBOLS.reduce((n, s) => n + s.weight, 0);
    let r = Math.random() * total;
    for (const s of WICK_SYMBOLS) {
      r -= s.weight;
      if (r <= 0) return s;
    }
    return WICK_SYMBOLS[0];
  }

  function buildReelStrip(el, winner, length) {
    if (!el) return;
    el.innerHTML = "";
    el.style.transition = "none";
    el.style.transform = "translateY(0)";
    const items = [];
    for (let i = 0; i < length - 1; i++) {
      items.push(WICK_SYMBOLS[(Math.random() * WICK_SYMBOLS.length) | 0]);
    }
    items.push(winner);
    items.forEach((s) => {
      const cell = document.createElement("div");
      cell.className = "reel-cell sym-" + s.id;
      cell.textContent = s.label;
      el.appendChild(cell);
    });
  }

  function openLuckyWick(source) {
    state.spinSource = source;
    state.winSpinUsed = source === "win";
    $("spin-result").textContent = "Three free reels. Match symbols for a prize.";
    $("btn-spin-pull").hidden = false;
    $("btn-spin-pull").disabled = false;
    $("btn-spin-done").hidden = true;
    // idle strips
    ["reel-1", "reel-2", "reel-3"].forEach((id) => {
      buildReelStrip($(id), pickWickSymbol(), 8);
    });
    $("overlay-spin").hidden = false;
  }

  function closeLuckyWick() {
    $("overlay-spin").hidden = true;
    if (state.spinSource === "win") {
      // stay on win screen
    } else {
      refreshMetaHud();
    }
    state.spinSource = null;
  }

  async function runLuckyWickSpin() {
    const btn = $("btn-spin-pull");
    btn.disabled = true;
    $("spin-result").textContent = "Wick flaring…";

    // Weighted outcomes; slight near-miss bias: often 2 match, 3rd fails
    let a = pickWickSymbol();
    let b = pickWickSymbol();
    let c = pickWickSymbol();
    if (Math.random() < 0.35) {
      // engineered near-miss (legal free cosmetic tension)
      a = b = pickWickSymbol();
      c = WICK_SYMBOLS.find((s) => s.id !== a.id) || pickWickSymbol();
    }

    const reels = [
      { el: $("reel-1"), win: a, delay: 0 },
      { el: $("reel-2"), win: b, delay: 120 },
      { el: $("reel-3"), win: c, delay: 240 },
    ];
    const cellH = 56;
    const len = 14;

    reels.forEach(({ el, win }) => buildReelStrip(el, win, len));
    void $("reel-1").offsetWidth;

    const anims = reels.map(({ el, delay }, i) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const dist = (len - 1) * cellH;
          el.style.transition =
            "transform " + (900 + i * 200) + "ms cubic-bezier(0.15, 0.85, 0.2, 1)";
          el.style.transform = "translateY(-" + dist + "px)";
          setTimeout(resolve, 900 + i * 200 + 40);
        }, delay);
      });
    });
    await Promise.all(anims);

    applyWickPrize(a, b, c);
    $("btn-spin-done").hidden = false;
  }

  function applyWickPrize(a, b, c) {
    const three = a.id === b.id && b.id === c.id;
    const pair = a.id === b.id || b.id === c.id || a.id === c.id;
    let msg = "";
    let prizeId = "empty";

    if (three && a.prize) {
      prizeId = a.prize;
      msg = "Three " + a.label + "! ";
    } else if (pair) {
      msg = "So close — two matched. ";
      prizeId = "near";
    } else {
      msg = "No line. Wick still warm. ";
    }

    if (prizeId === "energy" || prizeId === "energy2") {
      const n = prizeId === "energy2" ? 2 : 1;
      state.energy = Math.min(state.energyMax, state.energy + n);
      msg += "+" + n + " energy.";
    } else if (prizeId === "keepsake") {
      if (state.album < state.albumMax) {
        state.album++;
        msg += "A keepsake slipped free of The Dim.";
      } else {
        msg += "Keepsakes full — +1 energy instead.";
        state.energy = Math.min(state.energyMax, state.energy + 1);
      }
    } else if (prizeId === "streak_safe") {
      msg += "Lantern token — your day-streak is safe tonight (story only).";
    } else if (prizeId === "jackpot") {
      state.energy = Math.min(state.energyMax, state.energy + 2);
      if (state.album < state.albumMax) state.album++;
      msg += "Jackpot glow! Energy + keepsake.";
      showCallout("JACKPOT", "aurora");
    } else if (prizeId === "near") {
      // consolation crumb
      if (Math.random() < 0.4 && state.album < state.albumMax) {
        state.album++;
        msg += "Consolation keepsake.";
      } else {
        msg += "Try again tomorrow — free daily.";
      }
    } else if (prizeId === "empty" && !pair) {
      if (Math.random() < 0.25) {
        state.energy = Math.min(state.energyMax, state.energy + 1);
        msg += "Pity spark +1 ✦.";
      }
    }

    save();
    refreshMetaHud();
    $("spin-result").textContent = msg;
    $("win-album-label").textContent = state.album + "/" + state.albumMax;
    if ($("win-album-fill")) {
      $("win-album-fill").style.width =
        Math.round((state.album / state.albumMax) * 100) + "%";
    }
  }

  function formatRegen() {
    tickEnergy();
    if (state.energy >= state.energyMax) return "Full";
    const ms = Math.max(0, state.energyReadyAt - Date.now());
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function showCallout(text, kind) {
    const el = $("fx-callout");
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.className = "fx-callout show " + (kind || "beam");
    clearTimeout(showCallout._t);
    showCallout._t = setTimeout(() => {
      el.classList.remove("show");
      el.hidden = true;
    }, 700);
  }

  function showCascade(n) {
    const el = $("cascade-meter");
    if (!el) return;
    if (n < 2) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    $("cascade-text").textContent = "Cascade ×" + n;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
    state.peakCascade = Math.max(state.peakCascade, n);
  }

  function shakeTray(intensity) {
    const tray = $("board-tray") || document.querySelector(".board-tray");
    if (!tray) return;
    tray.classList.remove("shake-sm", "shake-lg");
    void tray.offsetWidth;
    tray.classList.add(intensity === "lg" ? "shake-lg" : "shake-sm");
    setTimeout(() => tray.classList.remove("shake-sm", "shake-lg"), 400);
  }

  function cellCenterLocal(r, c) {
    const host = boardFx();
    const cell = cellEl(r, c);
    if (!host || !cell) return null;
    const hostRect = host.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();
    return {
      x: rect.left - hostRect.left + rect.width / 2,
      y: rect.top - hostRect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    };
  }

  async function playDetonateFx(info) {
    const host = boardFx();
    if (!host) return;
    const origin = cellCenterLocal(info.r, info.c);
    if (!origin) return;

    const labels = {
      beam: info.dir === "col" ? "BEAM ↓" : "BEAM →",
      burst: "BURST!",
      prism: "PRISM!",
    };
    if (info.dual) {
      showCallout("AURORA!", "aurora");
      shakeTray("lg");
      flashBoard("flash-special");
    } else {
      showCallout(labels[info.type] || "SPECIAL!", info.type);
      shakeTray(info.type === "prism" ? "lg" : "sm");
      flashBoard("flash-special");
    }

    // Charge flash on origin
    const originMote = moteAt(info.r, info.c);
    if (originMote) originMote.classList.add("special-detonate-charge");

    // Beam line
    if (info.type === "beam" || (info.dual && info.type === "beam")) {
      const line = document.createElement("div");
      line.className = "fx-beam " + (info.dir === "col" ? "col" : "row");
      if (info.dir === "col") {
        line.style.left = origin.x + "px";
        line.style.top = "0";
        line.style.height = "100%";
      } else {
        line.style.top = origin.y + "px";
        line.style.left = "0";
        line.style.width = "100%";
      }
      host.appendChild(line);
      setTimeout(() => line.remove(), 450);
    }

    // Burst ring
    if (info.type === "burst" || info.dual) {
      const ring = document.createElement("div");
      ring.className = "fx-burst-ring";
      ring.style.left = origin.x + "px";
      ring.style.top = origin.y + "px";
      host.appendChild(ring);
      setTimeout(() => ring.remove(), 500);
    }

    // Prism wash
    if (info.type === "prism" || info.dual) {
      const wash = document.createElement("div");
      wash.className = "fx-prism-wash";
      host.appendChild(wash);
      setTimeout(() => wash.remove(), 550);
      // color rain sparks
      for (let i = 0; i < 16; i++) {
        const s = document.createElement("span");
        s.className =
          "spark spark-" +
          ["rose", "citrine", "jade", "sky", "amethyst"][i % 5];
        s.style.left = 10 + Math.random() * 80 + "%";
        s.style.top = 10 + Math.random() * 80 + "%";
        s.style.setProperty("--dx", (Math.random() - 0.5) * 40 + "px");
        s.style.setProperty("--dy", (Math.random() - 0.5) * 40 + "px");
        host.appendChild(s);
        setTimeout(() => s.remove(), 420);
      }
    }

    // Highlight every cleared cell with wave delay
    const keys = info.keys || [];
    keys.forEach((key, i) => {
      const [r, c] = key.split(",").map(Number);
      const m = moteAt(r, c);
      if (!m) return;
      const delay = Math.min(i * 14, 120);
      setTimeout(() => {
        m.classList.add("special-hit");
        const color = [...m.classList].find((x) =>
          ["rose", "citrine", "jade", "sky", "amethyst"].includes(x)
        );
        spawnSparks(r, c, color || "gold", info.type === "prism" ? 7 : 5);
      }, delay);
    });

    await sleep(info.type === "prism" || info.dual ? 320 : 260);

    keys.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const m = moteAt(r, c);
      if (m) {
        m.classList.remove("special-hit", "special-detonate-charge");
        m.classList.add("clearing-special");
      }
    });
    await sleep(180);
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
    const el = $(`screen-${id}`);
    if (el) el.classList.add("active");
    state.screen = id;
  }

  function startStory(sequence, then) {
    state.storyQueue = sequence.slice();
    state.storyIndex = 0;
    state.storyThen = then;
    renderStoryLine();
    showScreen("story");
  }

  function renderStoryLine() {
    const line = state.storyQueue[state.storyIndex];
    if (!line) return;
    $("story-speaker").textContent = line.speaker;
    $("story-text").textContent = line.text;
    $("btn-story-next").textContent =
      state.storyIndex >= state.storyQueue.length - 1 ? "Begin" : "Continue";
  }

  function advanceStory() {
    if (state.storyIndex < state.storyQueue.length - 1) {
      state.storyIndex++;
      renderStoryLine();
      return;
    }
    const then = state.storyThen;
    state.storyThen = null;
    if (then) then();
  }

  function skipStory() {
    const then = state.storyThen;
    state.storyThen = null;
    if (then) then();
  }

  function buildLayout(kind, rows, cols) {
    if (!kind) return null;
    const layout = Array.from({ length: rows }, () => Array(cols).fill(null));
    if (kind === "fogCenter") {
      for (let r = 2; r <= 4; r++) {
        for (let c = 2; c <= 4; c++) {
          layout[r][c] = { fog: 1 };
        }
      }
      // extra fog ring
      layout[1][3] = { fog: 1 };
      layout[5][3] = { fog: 1 };
      layout[3][1] = { fog: 1 };
      layout[3][5] = { fog: 1 };
    }
    if (kind === "blooms") {
      const spots = [
        [1, 1],
        [1, 3],
        [1, 5],
        [3, 0],
        [3, 2],
        [3, 4],
        [3, 6],
        [5, 1],
        [5, 3],
        [5, 5],
      ];
      spots.forEach(([r, c]) => {
        if (layout[r]) layout[r][c] = { bloom: true };
      });
    }
    if (kind === "tutorial") {
      // First-minute board: lots of ♥ almost-matches, not auto-solved
      // Pattern uses R=rose and fillers — no full 3-row at start
      const R = "rose";
      const J = "jade";
      const S = "sky";
      const C = "citrine";
      const grid = [
        [J, R, R, S, C, J],
        [R, S, R, J, R, C],
        [S, R, J, R, R, S],
        [C, J, R, S, J, R],
        [R, R, S, C, R, J],
        [J, S, C, R, J, R],
      ];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          layout[r][c] = { color: grid[r] ? grid[r][c] : J };
        }
      }
    }
    return layout;
  }

  function campaignComplete() {
    return LEVELS.every((l) => state.cleared[l.id]);
  }

  function showCampaignComplete() {
    state.campaignDone = true;
    save();
    const roster = $("saved-roster");
    if (roster) {
      roster.innerHTML = "";
      LEVELS.forEach((l) => {
        if (!l.save) return;
        const el = document.createElement("div");
        el.className = "roster-chip";
        el.innerHTML =
          '<div class="save-avatar char-' +
          l.save.id +
          ' saved sm"></div><span>' +
          l.save.name +
          "</span>";
        roster.appendChild(el);
      });
    }
    $("complete-line").textContent =
      "Pip, Nori, Moss Elder, Kess, and Luma — every name you touched stayed. Act I of the prototype ends.";
    showScreen("complete");
  }

  function goalKey(g) {
    if (g.type === "collect") return `collect:${g.color}`;
    if (g.type === "make") return `make:${g.special}`;
    if (g.type === "fog") return "fog";
    if (g.type === "blooms") return "blooms";
    return g.type;
  }

  function initProgress(level) {
    state.progress = {};
    level.goals.forEach((g) => {
      state.progress[goalKey(g)] = 0;
    });
  }

  function applyStats(stats) {
    if (!stats) return goalsMet();
    const level = LEVELS[state.levelIndex];
    if (!level) return false;
    level.goals.forEach((g) => {
      const key = goalKey(g);
      if (g.type === "collect" && stats.collected) {
        state.progress[key] = Math.min(
          g.need,
          (state.progress[key] || 0) + (stats.collected[g.color] || 0)
        );
      }
      if (g.type === "make" && stats.specialsMade) {
        state.progress[key] = Math.min(
          g.need,
          (state.progress[key] || 0) + (stats.specialsMade[g.special] || 0)
        );
      }
      if (g.type === "fog") {
        state.progress[key] = Math.min(
          g.need,
          (state.progress[key] || 0) + (stats.fogCleared || 0)
        );
      }
      if (g.type === "blooms") {
        state.progress[key] = Math.min(
          g.need,
          (state.progress[key] || 0) + (stats.bloomsLit || 0)
        );
      }
    });
    // Live HUD so 8/8 is visible mid-chain
    if (state.screen === "play") {
      renderGoalChips($("hud-goals"), level, true);
    }
    return goalsMet();
  }

  function goalsMet() {
    const level = LEVELS[state.levelIndex];
    if (!level || !level.goals || !level.goals.length) return false;
    return level.goals.every((g) => {
      const have = Number(state.progress[goalKey(g)]) || 0;
      const need = Number(g.need) || 0;
      return have >= need;
    });
  }

  /** Hard finish — goals done. Safe if called twice. */
  function finishLevel() {
    if (state.levelFinished) return;
    state.levelFinished = true;
    state.busy = true;
    clearTimeout(state.hintTimer);
    try {
      onWin();
    } catch (err) {
      console.error("onWin failed", err);
      // Fallback so the player is never soft-locked on a finished board
      try {
        showScreen("win");
      } catch (_) {
        /* ignore */
      }
    }
  }

  function checkWinAfterStats(stats) {
    if (state.levelFinished) return true;
    if (applyStats(stats) || goalsMet()) {
      finishLevel();
      return true;
    }
    return false;
  }

  /**
   * End of any move: re-apply full stats once from pre-move baseline (no double-count),
   * then win or spend the move.
   */
  function endMove(hooks, stats) {
    if (state.levelFinished) return;
    if (hooks && hooks.baseProgress) {
      state.progress = JSON.parse(JSON.stringify(hooks.baseProgress));
    }
    if (stats) applyStats(stats);
    if (goalsMet()) {
      finishLevel();
      return;
    }
    afterMove();
  }

  function renderGoalChips(container, level, useProgress) {
    container.innerHTML = "";
    level.goals.forEach((g) => {
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (useProgress ? " hud" : "");
      const have = useProgress ? state.progress[goalKey(g)] || 0 : 0;
      let dot = "";
      let label = "";
      if (g.type === "collect") {
        dot = `<span class="dot ${g.color}"></span>`;
        label = useProgress ? `${have}/${g.need}` : `Collect ${g.need}`;
      } else if (g.type === "make") {
        dot = `<span class="dot ${g.special}"></span>`;
        label = useProgress
          ? `${have}/${g.need} ${g.special}`
          : `Create ${g.need} ${g.special}`;
      } else if (g.type === "fog") {
        dot = `<span class="dot fog"></span>`;
        label = useProgress ? `${have}/${g.need} fog` : `Clear ${g.need} fog`;
      } else if (g.type === "blooms") {
        dot = `<span class="dot bloom"></span>`;
        label = useProgress ? `${have}/${g.need}` : `Light ${g.need} blooms`;
      }
      if (useProgress && have >= g.need) chip.classList.add("done");
      chip.innerHTML = `${dot}<span>${label}</span>`;
      container.appendChild(chip);
    });
  }

  function openLevelIntro(index) {
    state.levelIndex = index;
    const level = LEVELS[index];
    refreshMetaHud();
    $("intro-ep").textContent = level.ep;
    $("intro-title").textContent = level.save
      ? "Rescue " + level.save.name
      : level.title;
    $("intro-luma").textContent = level.save
      ? level.save.plea + " — " + level.luma
      : `"${level.luma}"`;
    $("intro-moves").textContent = `${level.moves} moves · 1 ✦ energy · Dim timer still runs`;
    renderGoalChips($("intro-goals"), level, false);
    showScreen("level-intro");
  }

  function startLevel() {
    const level = LEVELS[state.levelIndex];
    tickEnergy();
    // First levels free — first minute must not hit a wall
    if (!level.freeEnergy) {
      if (state.energy <= 0) {
        openEnergyGate();
        return;
      }
      if (!spendEnergy()) {
        openEnergyGate();
        return;
      }
    }

    initProgress(level);
    state.moves = level.moves;
    state.levelStartMoves = level.moves;
    state.selected = null;
    state.busy = false;
    state.levelFinished = false;
    state.peakCascade = 0;
    state.specialsThisLevel = 0;
    clearTimeout(state.hintTimer);

    $("hud-level").textContent = level.save
      ? "Save " + level.save.name
      : `Level ${level.id}`;
    $("hud-moves").textContent = String(state.moves);
    $("luma-tip").textContent =
      level.id === 1
        ? "Pink ♥ — match three. Every clear holds Pip’s name."
        : level.tip;
    $("hint-line").hidden = true;
    const cm = $("cascade-meter");
    if (cm) cm.hidden = true;
    renderGoalChips($("hud-goals"), level, true);
    refreshMetaHud();

    const boardEl = $("board");
    boardEl.style.gridTemplateColumns = `repeat(${level.cols}, var(--cell))`;
    boardEl.style.gridTemplateRows = `repeat(${level.rows}, var(--cell))`;

    state.board = new GlimmerBoard({
      rows: level.rows,
      cols: level.cols,
      colorCount: level.colorCount,
      onChange: () => renderBoard(),
    });

    const layout = buildLayout(level.layout, level.rows, level.cols);
    state.board.init(layout);

    showScreen("play");
    renderBoard();
    scheduleHint();
  }

  function cellSize() {
    const cell = $("board") && $("board").querySelector(".cell");
    if (!cell) {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--cell");
      // fallback approx
      return Math.min(window.innerWidth * 0.115, 52);
    }
    return cell.getBoundingClientRect().width;
  }

  function stepPx() {
    const gap = 4;
    return cellSize() + gap;
  }

  function makeMoteEl(cell) {
    const mote = document.createElement("div");
    mote.className = `mote ${cell.color}`;
    if (cell.id != null) mote.dataset.id = String(cell.id);
    if (cell.special) {
      mote.classList.add(cell.special);
      if (cell.special === "beam") mote.classList.add(cell.dir || "row");
    }
    return mote;
  }

  function renderBoard() {
    const board = state.board;
    if (!board) return;
    const el = $("board");
    el.innerHTML = "";

    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.grid[r][c];
        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;
        if (cell.void) {
          cellEl.classList.add("empty");
        } else {
          if (cell.fog > 0) cellEl.classList.add("has-fog");
          if (cell.bloom) {
            cellEl.classList.add("has-bloom");
            if (cell.bloomLit) cellEl.classList.add("bloom-lit");
          }
          if (cell.color) {
            const mote = makeMoteEl(cell);
            if (
              state.selected &&
              state.selected.r === r &&
              state.selected.c === c
            ) {
              mote.classList.add("selected");
            }
            cellEl.appendChild(mote);
          }
        }
        el.appendChild(cellEl);
      }
    }

    ensureBoardFx();
    bindBoardInput();
  }

  function ensureBoardFx() {
    const tray = document.querySelector(".board-tray");
    if (!tray) return null;
    let fx = tray.querySelector(".board-fx");
    if (!fx) {
      fx = document.createElement("div");
      fx.className = "board-fx";
      fx.setAttribute("aria-hidden", "true");
      tray.appendChild(fx);
    }
    return fx;
  }

  function moteAt(r, c) {
    return $("board").querySelector(`.cell[data-r="${r}"][data-c="${c}"] .mote`);
  }

  function cellEl(r, c) {
    return $("board").querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  }

  function boardFx() {
    return ensureBoardFx();
  }

  function spawnSparks(r, c, color, count) {
    const host = boardFx();
    const cell = cellEl(r, c);
    if (!host || !cell) return;
    const hostRect = host.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();
    const cx = rect.left - hostRect.left + rect.width / 2;
    const cy = rect.top - hostRect.top + rect.height / 2;
    const n = count || 6;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = `spark spark-${color || "gold"}`;
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 18 + Math.random() * 22;
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      p.style.animationDelay = i * 12 + "ms";
      host.appendChild(p);
      setTimeout(() => p.remove(), 420);
    }
  }

  function flashBoard(kind) {
    const tray = document.querySelector(".board-tray");
    if (!tray) return;
    tray.classList.remove("flash-match", "flash-cascade", "flash-special");
    // reflow
    void tray.offsetWidth;
    tray.classList.add(kind || "flash-match");
    setTimeout(() => tray.classList.remove(kind || "flash-match"), 280);
  }

  async function animateSwapVisual(a, b) {
    const ma = moteAt(a.r, a.c);
    const mb = moteAt(b.r, b.c);
    if (!ma || !mb) return;
    const step = stepPx();
    const dx = (b.c - a.c) * step;
    const dy = (b.r - a.r) * step;

    ma.style.zIndex = "5";
    mb.style.zIndex = "5";
    ma.style.transition = "transform 120ms cubic-bezier(0.22, 1, 0.36, 1)";
    mb.style.transition = "transform 120ms cubic-bezier(0.22, 1, 0.36, 1)";
    ma.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
    mb.style.transform = `translate(${-dx}px, ${-dy}px) scale(1.06)`;
    await sleep(125);
    ma.style.transition = "";
    mb.style.transition = "";
    ma.style.transform = "";
    mb.style.transform = "";
    ma.style.zIndex = "";
    mb.style.zIndex = "";
  }

  async function animateSwapFail(a, b) {
    const ma = moteAt(a.r, a.c);
    const mb = moteAt(b.r, b.c);
    if (!ma || !mb) return;
    const step = stepPx();
    const dx = (b.c - a.c) * step * 0.35;
    const dy = (b.r - a.r) * step * 0.35;
    ma.style.zIndex = "5";
    mb.style.zIndex = "5";
    ma.style.transition = "transform 70ms ease-out";
    mb.style.transition = "transform 70ms ease-out";
    ma.style.transform = `translate(${dx}px, ${dy}px)`;
    mb.style.transform = `translate(${-dx}px, ${-dy}px)`;
    await sleep(70);
    ma.style.transition = "transform 110ms cubic-bezier(0.34, 1.4, 0.64, 1)";
    mb.style.transition = "transform 110ms cubic-bezier(0.34, 1.4, 0.64, 1)";
    ma.style.transform = "";
    mb.style.transform = "";
    await sleep(120);
    ma.style.transition = "";
    mb.style.transition = "";
    ma.style.zIndex = "";
    mb.style.zIndex = "";
  }

  function bindBoardInput() {
    const el = $("board");
    let start = null;

    const getRC = (target) => {
      const cell = target.closest(".cell");
      if (!cell) return null;
      return { r: +cell.dataset.r, c: +cell.dataset.c };
    };

    el.onpointerdown = (e) => {
      if (state.busy) return;
      const rc = getRC(e.target);
      if (!rc) return;
      start = { r: rc.r, c: rc.c, x: e.clientX, y: e.clientY };
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    el.onpointerup = async (e) => {
      if (state.busy || !start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const from = { r: start.r, c: start.c };
      start = null;

      // Swipe to neighbour
      if (Math.hypot(dx, dy) > 22) {
        let dr = 0;
        let dc = 0;
        if (Math.abs(dx) > Math.abs(dy)) dc = dx > 0 ? 1 : -1;
        else dr = dy > 0 ? 1 : -1;
        await trySwap(from, { r: from.r + dr, c: from.c + dc });
        return;
      }

      const rc = getRC(e.target) || from;

      // Second tap on adjacent → swap
      if (
        state.selected &&
        (state.selected.r !== rc.r || state.selected.c !== rc.c)
      ) {
        if (state.board.adjacent(state.selected, rc)) {
          const a = state.selected;
          state.selected = null;
          await trySwap(a, rc);
          return;
        }
      }

      // Double-select special → detonate
      const cell = state.board.cell(rc.r, rc.c);
      if (
        state.selected &&
        state.selected.r === rc.r &&
        state.selected.c === rc.c &&
        cell &&
        cell.special
      ) {
        state.selected = null;
        await fireSpecial(rc.r, rc.c);
        return;
      }

      state.selected = rc;
      renderBoard();
    };

    el.onpointercancel = () => {
      start = null;
    };
  }

  async function trySwap(a, b) {
    if (state.busy || state.levelFinished || !state.board) return;
    if (!state.board.cell(b.r, b.c)) {
      state.selected = a;
      renderBoard();
      return;
    }
    if (!state.board.adjacent(a, b)) {
      state.selected = b;
      renderBoard();
      return;
    }

    clearTimeout(state.hintTimer);
    $("hint-line").hidden = true;
    document.querySelectorAll(".mote.hint").forEach((m) => m.classList.remove("hint"));

    state.busy = true;
    state.selected = null;
    document.querySelectorAll(".mote.selected").forEach((m) => m.classList.remove("selected"));

    try {
      const cellA = state.board.grid[a.r][a.c];
      const cellB = state.board.grid[b.r][b.c];
      if (!cellA || !cellB || !cellA.color || !cellB.color) {
        state.busy = false;
        return;
      }
      const aSpec = cellA.special;
      const bSpec = cellB.special;

      // Dual special
      if (aSpec && bSpec) {
        await animateSwapVisual(a, b);
        state.board._swapCells(a, b);
        renderBoard();
        const hooks = uiHooks();
        const stats = await state.board.activateSpecial(b.r, b.c, hooks, {
          dual: true,
        });
        if (stats) state.specialsThisLevel++;
        endMove(hooks, stats);
        return;
      }

      // Swap special with normal → detonate special
      if (aSpec || bSpec) {
        await animateSwapVisual(a, b);
        state.board._swapCells(a, b);
        renderBoard();
        const sr = aSpec ? b.r : a.r;
        const sc = aSpec ? b.c : a.c;
        const hooks = uiHooks();
        const stats = await state.board.activateSpecial(sr, sc, hooks);
        if (stats) state.specialsThisLevel++;
        endMove(hooks, stats);
        return;
      }

      // Preview swap validity
      state.board._swapCells(a, b);
      const matches = state.board.findMatches();
      if (!matches.groups.length) {
        state.board._swapCells(a, b);
        await animateSwapFail(a, b);
        state.busy = false;
        scheduleHint();
        return;
      }

      // Revert → animate → re-swap → resolve with FRESH matches after swap
      state.board._swapCells(a, b);
      await animateSwapVisual(a, b);
      state.board._swapCells(a, b);
      renderBoard();
      await sleep(20);
      const live = state.board.findMatches();
      const hooks = uiHooks();
      const stats = await state.board.resolve(
        live.groups.length ? live : matches,
        hooks
      );
      endMove(hooks, stats);
    } catch (err) {
      console.error("trySwap error", err);
      state.busy = false;
      if (goalsMet()) finishLevel();
      else scheduleHint();
    }
  }

  async function fireSpecial(r, c) {
    if (state.busy || state.levelFinished) return;
    state.busy = true;
    clearTimeout(state.hintTimer);
    try {
      const mote = moteAt(r, c);
      if (mote) {
        mote.classList.add("special-charge");
        await sleep(120);
      }
      const hooks = uiHooks();
      const stats = await state.board.activateSpecial(r, c, hooks);
      if (stats) state.specialsThisLevel++;
      endMove(hooks, stats);
    } catch (err) {
      console.error("fireSpecial error", err);
      state.busy = false;
      if (goalsMet()) finishLevel();
    }
  }

  function uiHooks() {
    // Snapshot progress so cascade partials don't double-count
    const baseProgress = JSON.parse(JSON.stringify(state.progress));
    const hooks = {
      baseProgress,
      /** Peek progress during cascades; final counts applied once in endMove */
      afterCascadeStats: async (stats) => {
        state.progress = JSON.parse(JSON.stringify(baseProgress));
        applyStats(stats);
        if (goalsMet()) {
          // Keep winning progress; endMove will no-op via levelFinished
          finishLevel();
          return true;
        }
        return false;
      },
      animatePulse: async (keys, cascade) => {
        keys.forEach((key, i) => {
          const [r, c] = key.split(",").map(Number);
          const m = moteAt(r, c);
          if (!m) return;
          m.classList.add("match-pulse");
          m.style.animationDelay = Math.min(i * 12, 60) + "ms";
        });
        flashBoard(cascade > 1 ? "flash-cascade" : "flash-match");
        if (cascade > 1) showCascade(cascade);
        await sleep(cascade > 1 ? 70 : 90);
      },

      animateClear: async (keys, meta) => {
        const special = meta && meta.special;
        keys.forEach((key, i) => {
          const [r, c] = key.split(",").map(Number);
          const m = moteAt(r, c);
          if (!m) return;
          const color = [...m.classList].find((x) =>
            ["rose", "citrine", "jade", "sky", "amethyst"].includes(x)
          );
          m.classList.remove("match-pulse");
          m.classList.add(special ? "clearing-special" : "clearing");
          m.style.animationDelay = Math.min(i * 10, 50) + "ms";
          spawnSparks(r, c, color || "gold", special ? 8 : 5);
        });
        if (special) flashBoard("flash-special");
        await sleep(special ? 200 : 160);
      },

      animateDetonate: async (info) => {
        if (info.autoFromMatch) {
          $("luma-tip").textContent =
            info.type === "beam"
              ? "Beam matched — line deploys!"
              : info.type === "burst"
                ? "Burst matched — blast deploys!"
                : info.type === "prism"
                  ? "Prism matched — colour storm!"
                  : "Special matched — auto-deploy!";
        }
        await playDetonateFx(info);
      },

      animateSpecials: async (spawns) => {
        renderBoard();
        for (const s of spawns) {
          const m = moteAt(s.r, s.c);
          if (m) {
            m.classList.add("special-born");
            spawnSparks(s.r, s.c, "gold", 12);
          }
          const name =
            s.type === "beam"
              ? "BEAM FORGED"
              : s.type === "burst"
                ? "BURST FORGED"
                : "PRISM FORGED";
          showCallout(name, s.type);
          shakeTray("sm");
        }
        flashBoard("flash-special");
        $("luma-tip").textContent =
          spawns[0] && spawns[0].type === "beam"
            ? "Beam forged — match more of its colour (or swap it) and it auto-fires."
            : spawns[0] && spawns[0].type === "burst"
              ? "Burst forged — match its colour again and it auto-blasts."
              : "Special forged — match its colour to auto-deploy.";
        await sleep(320);
        document
          .querySelectorAll(".special-born")
          .forEach((m) => m.classList.remove("special-born"));
      },

      animateGravity: async (falls, spawns, cascade) => {
        renderBoard();
        const step = stepPx();
        const movers = [];
        falls.forEach((f) => {
          const m = $("board").querySelector(`.mote[data-id="${f.id}"]`);
          if (!m) return;
          const dist = (f.toR - f.fromR) * step;
          m.style.transition = "none";
          m.style.transform = `translateY(${-dist}px)`;
          m.classList.add("falling");
          movers.push({ m, delay: f.fromR * 12 });
        });

        spawns.forEach((s) => {
          const m = $("board").querySelector(`.mote[data-id="${s.id}"]`);
          if (!m) return;
          const dist = (s.drop + 0.35) * step;
          m.style.transition = "none";
          m.style.transform = `translateY(${-dist}px) scale(0.85)`;
          m.style.opacity = "0.65";
          m.classList.add("spawning");
          movers.push({ m, delay: s.r * 10 + 20, spawn: true });
        });

        void $("board").offsetWidth;

        const fallMs = 170 + Math.min(cascade * 8, 30);
        movers.forEach(({ m, delay, spawn }) => {
          m.style.transition = `transform ${fallMs}ms cubic-bezier(0.22, 1.15, 0.36, 1) ${delay}ms, opacity ${fallMs}ms ease ${delay}ms`;
          m.style.transform = spawn ? "translateY(0) scale(1)" : "translateY(0)";
          m.style.opacity = "1";
        });

        const maxDelay = movers.reduce((n, x) => Math.max(n, x.delay || 0), 0);
        await sleep(fallMs + maxDelay + 30);

        movers.forEach(({ m }) => {
          m.style.transition = "";
          m.style.transform = "";
          m.style.opacity = "";
          m.classList.remove("falling", "spawning");
        });

        falls.forEach((f) => {
          const m = $("board").querySelector(`.mote[data-id="${f.id}"]`);
          if (m) m.classList.add("land");
        });
        spawns.forEach((s) => {
          const m = $("board").querySelector(`.mote[data-id="${s.id}"]`);
          if (m) m.classList.add("land");
        });
        await sleep(90);
        document.querySelectorAll(".mote.land").forEach((m) => m.classList.remove("land"));
      },
    };
    return hooks;
  }

  function openEnergyGate() {
    refreshMetaHud();
    $("energy-line").textContent =
      "Out of energy. Timer is real. Optional ad or wait — no fake countdown.";
    $("energy-timer").textContent = "Next ✦ in " + formatRegen();
    $("overlay-energy").hidden = false;
    const tick = setInterval(() => {
      if ($("overlay-energy").hidden) {
        clearInterval(tick);
        return;
      }
      tickEnergy();
      $("energy-timer").textContent =
        state.energy >= state.energyMax
          ? "Energy full"
          : "Next ✦ in " + formatRegen();
      refreshMetaHud();
      if (state.energy > 0) {
        // soft auto-close when full enough
      }
    }, 500);
    openEnergyGate._tick = tick;
  }

  function closeEnergyGate() {
    $("overlay-energy").hidden = true;
    if (openEnergyGate._tick) clearInterval(openEnergyGate._tick);
  }

  function goalProgressRatio() {
    const level = LEVELS[state.levelIndex];
    let total = 0;
    let have = 0;
    level.goals.forEach((g) => {
      total += g.need;
      have += Math.min(g.need, state.progress[goalKey(g)] || 0);
    });
    return total ? have / total : 0;
  }

  function nearMissMessage() {
    const level = LEVELS[state.levelIndex];
    const parts = [];
    level.goals.forEach((g) => {
      const have = state.progress[goalKey(g)] || 0;
      const left = Math.max(0, g.need - have);
      if (left <= 0) return;
      if (g.type === "collect") parts.push(left + " " + g.color);
      else if (g.type === "make") parts.push(left + " " + g.special);
      else if (g.type === "fog") parts.push(left + " fog");
      else if (g.type === "blooms") parts.push(left + " blooms");
    });
    if (!parts.length) return "Moves ran out at the finish line.";
    return "Only " + parts.join(", ") + " short. That itch is intentional.";
  }

  function afterMove() {
    if (state.levelFinished) return;

    // Win always wins — even if this was the last move
    if (goalsMet()) {
      finishLevel();
      return;
    }

    state.moves = Math.max(0, state.moves - 1);
    const movesEl = $("hud-moves");
    if (movesEl) movesEl.textContent = String(state.moves);
    renderGoalChips($("hud-goals"), LEVELS[state.levelIndex], true);
    renderBoard();
    state.busy = false;

    // Re-check after HUD refresh (belt and braces)
    if (goalsMet()) {
      finishLevel();
      return;
    }
    if (state.moves <= 0) {
      onLose();
      return;
    }
    scheduleHint();
  }

  function scheduleHint() {
    clearTimeout(state.hintTimer);
    state.hintTimer = setTimeout(() => {
      if (state.busy || state.screen !== "play") return;
      const hint = state.board.findHint();
      if (!hint) {
        $("hint-line").hidden = false;
        $("hint-line").textContent = "No moves — reshuffling is a full-game feature.";
        return;
      }
      $("hint-line").hidden = false;
      $("hint-line").textContent = "Hint: try these two…";
      const m1 = $("board").querySelector(
        `.cell[data-r="${hint.a.r}"][data-c="${hint.a.c}"] .mote`
      );
      const m2 = $("board").querySelector(
        `.cell[data-r="${hint.b.r}"][data-c="${hint.b.c}"] .mote`
      );
      if (m1) m1.classList.add("hint");
      if (m2) m2.classList.add("hint");
    }, 5000);
  }

  function starCount() {
    const used = state.levelStartMoves - state.moves;
    const ratio = used / state.levelStartMoves;
    if (ratio < 0.45) return 3;
    if (ratio < 0.7) return 2;
    return 1;
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
  }

  function onWin() {
    clearTimeout(state.hintTimer);
    state.busy = true;
    const level = LEVELS[state.levelIndex];
    if (!level) {
      showScreen("win");
      return;
    }
    const stars = starCount();
    state.cleared[level.id] = Math.max(state.cleared[level.id] || 0, stars);
    state.maxUnlocked = Math.max(state.maxUnlocked, state.levelIndex + 1);
    state.groveLevel = Math.max(state.groveLevel, state.levelIndex + 1);
    state.dimPressureEndsAt = Date.now() + DIM_PRESSURE_MS;

    const day = todayKey();
    if (state.lastWinDay !== day) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yKey =
        y.getFullYear() + "-" + (y.getMonth() + 1) + "-" + y.getDate();
      state.streak = state.lastWinDay === yKey ? state.streak + 1 : 1;
      state.lastWinDay = day;
    }

    let gotKeep = false;
    if (state.album < state.albumMax) {
      state.album = Math.min(state.albumMax, state.album + 1);
      gotKeep = true;
    }

    if (campaignComplete()) {
      state.campaignDone = true;
    }

    state.winSpinUsed = false;
    save();
    refreshMetaHud();

    // First-minute payoff
    if (state.levelIndex === 0 && level.save) {
      const av = $("reveal-avatar");
      if (av) {
        av.className = "save-avatar char-" + level.save.id + " saved big";
      }
      setText("reveal-name", level.save.name + " is safe");
      setText("reveal-line", level.save.saved);
      showScreen("save-reveal");
      return;
    }

    const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
    setText("win-stars", starStr.split("").join(" "));
    setText(
      "win-title",
      level.save ? level.save.name + " held on" : "Something stayed"
    );
    setText(
      "win-line",
      level.save
        ? level.save.saved
        : "One star is enough — The Dim still lost a little."
    );

    const streakChip = $("win-streak-chip");
    if (streakChip) {
      streakChip.innerHTML =
        '<span class="ico-lantern sm"></span> Lantern ×' + state.streak;
    }
    const albumChip = $("win-album-chip");
    if (albumChip) {
      albumChip.innerHTML =
        state.album >= state.albumMax
          ? '<span class="ico-keepsake sm"></span> All keepsakes safe'
          : '<span class="ico-keepsake sm"></span> Keepsake +1';
    }
    setText("win-album-label", state.album + "/" + state.albumMax);
    const fill = $("win-album-fill");
    if (fill) {
      fill.style.width =
        Math.round((state.album / state.albumMax) * 100) + "%";
    }

    const kLine = $("win-keepsake-line");
    if (kLine) {
      if (gotKeep && GlimmerStory.keepsakeLines) {
        const line =
          GlimmerStory.keepsakeLines[
            (state.album - 1) % GlimmerStory.keepsakeLines.length
          ];
        kLine.hidden = false;
        kLine.textContent = "“" + line + "” — Luma";
      } else {
        kLine.hidden = true;
      }
    }

    const remaining = LEVELS.filter((l) => !state.cleared[l.id]).length;
    setText(
      "win-one-more",
      remaining > 0
        ? remaining + " soul(s) still in the mist. Don’t stop."
        : "Every name on this Path is safe. The prototype ends."
    );

    const spinBtn = $("btn-win-spin");
    if (spinBtn) {
      spinBtn.hidden = !!level.finale || campaignComplete();
      spinBtn.disabled = false;
      spinBtn.textContent = "Lucky Wick · free spin";
    }

    const nextBtn = $("btn-win-next");
    if (nextBtn) {
      nextBtn.textContent = campaignComplete()
        ? "Finish the Path"
        : level.save
          ? "Rescue next"
          : "One more level";
    }

    const gf = $("grove-flash");
    if (gf) {
      gf.hidden = false;
      const mg = $("mini-grove");
      if (mg) {
        mg.className = "mini-grove lit-" + Math.min(3, state.groveLevel);
      }
    }

    showScreen("win");
  }

  function onLose() {
    clearTimeout(state.hintTimer);
    const ratio = goalProgressRatio();
    const pct = Math.round(ratio * 100);
    const free = refundEnergyOnce();
    refreshMetaHud();
    save();

    $("lose-title").textContent =
      ratio >= 0.7 ? "So close it hurts" : ratio >= 0.4 ? "Almost…" : "Light dims… for now";
    $("lose-line").textContent = nearMissMessage();
    $("lose-sub").textContent = free
      ? "First fail today: energy refunded (loss aversion softener). Try again while the board is still in your head."
      : "−1 ✦ spent. Next free energy in " + formatRegen() + " — or optional labeled ad.";

    const nm = $("near-miss");
    if (ratio > 0.15) {
      nm.hidden = false;
      $("near-miss-pct").textContent = pct + "%";
      $("near-miss-fill").style.width = pct + "%";
    } else {
      nm.hidden = true;
    }

    showScreen("lose");
  }

  function afterWinFlow() {
    const idx = state.levelIndex;

    // Hard end — no infinite loop
    if (campaignComplete() || (LEVELS[idx] && LEVELS[idx].finale && state.cleared[LEVELS[idx].id])) {
      startStory(GlimmerStory.afterFinale, () => showCampaignComplete());
      return;
    }

    const next = idx + 1;
    const goNext = () => {
      if (next < LEVELS.length) {
        // Skip long intro cards after first — speed
        if (LEVELS[next].skipIntro) {
          state.levelIndex = next;
          startLevel();
        } else {
          openLevelIntro(next);
        }
      } else {
        showCampaignComplete();
      }
    };

    if (idx === 0) {
      startStory(GlimmerStory.afterFirstWin, () => {
        openGrove();
      });
      return;
    }
    if (idx === 1) {
      startStory(GlimmerStory.afterBeam, goNext);
      return;
    }
    if (idx === 2) {
      startStory(GlimmerStory.afterFog, goNext);
      return;
    }
    if (idx === 3) {
      startStory(GlimmerStory.afterBurst, goNext);
      return;
    }
    goNext();
  }

  function openGrove() {
    $("grove-blurb").textContent =
      state.groveLevel === 1
        ? "Your first light took root. This glade is yours — it densifies as you clear path nodes."
        : `Light stage ${state.groveLevel}. In the full game: cosmetics, seasons, and Circle goals land here.`;
    showScreen("grove");
    requestAnimationFrame(() => {
      $("grove-lantern").classList.add("bright");
      const flora = $("grove-flora");
      flora.innerHTML = "";
      const n = Math.min(8, 2 + state.groveLevel * 2);
      for (let i = 0; i < n; i++) {
        const d = document.createElement("div");
        d.className = "flora-dot";
        d.style.left = 15 + Math.random() * 70 + "%";
        d.style.bottom = 25 + Math.random() * 35 + "%";
        d.style.background = ["#3dbf8c", "#f2a6c8", "#5bb8f5", "#f0c14a"][i % 4];
        flora.appendChild(d);
        setTimeout(() => d.classList.add("show"), 80 + i * 100);
      }
    });
  }

  function ensureDimPressure() {
    const allClear = LEVELS.every((l) => state.cleared[l.id]);
    if (allClear) {
      state.dimPressureEndsAt = 0;
      return;
    }
    if (!state.dimPressureEndsAt || state.dimPressureEndsAt < Date.now()) {
      // Fresh real window when expired or first open
      if (!state.dimPressureEndsAt || state.dimPressureEndsAt < Date.now() - 1000) {
        state.dimPressureEndsAt = Date.now() + DIM_PRESSURE_MS;
        save();
      }
    }
  }

  function msToClock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function msUntilMidnight() {
    const n = new Date();
    const end = new Date(n);
    end.setHours(24, 0, 0, 0);
    return end - n;
  }

  function pathD() {
    // Smooth-ish polyline through PATH_NODES
    let d = "";
    PATH_NODES.forEach((p, i) => {
      if (i === 0) d += "M " + p.x + " " + p.y;
      else {
        const prev = PATH_NODES[i - 1];
        const cx = (prev.x + p.x) / 2;
        d += " Q " + cx + " " + prev.y + " " + p.x + " " + p.y;
      }
    });
    return d;
  }

  function updateMapTimers() {
    if (state.screen !== "map" && !$("screen-map").classList.contains("active")) {
      return;
    }
    tickEnergy();
    ensureDimPressure();

    // Dim pressure
    const dimEl = $("timer-dim-value");
    const dimFill = $("timer-dim-fill");
    if (dimEl) {
      if (!state.dimPressureEndsAt) {
        dimEl.textContent = "Safe";
        if (dimFill) dimFill.style.width = "100%";
        $("timer-dim").classList.remove("critical");
      } else {
        const left = state.dimPressureEndsAt - Date.now();
        dimEl.textContent = left <= 0 ? "Thickening!" : msToClock(left);
        const pct = Math.max(0, Math.min(100, (left / DIM_PRESSURE_MS) * 100));
        if (dimFill) dimFill.style.width = pct + "%";
        $("timer-dim").classList.toggle("critical", left < 90000 && left > 0);
        $("timer-dim").classList.toggle("expired", left <= 0);
        if (left <= 0) {
          // Soft visual pressure only — reset window so it's real urgency cycle not softlock
          state.dimPressureEndsAt = Date.now() + DIM_PRESSURE_MS;
          save();
        }
      }
    }

    // Energy restore
    const eVal = $("timer-energy-value");
    const eFill = $("timer-energy-fill");
    if (eVal) {
      if (state.energy >= state.energyMax) {
        eVal.textContent = "Full " + state.energy + "/" + state.energyMax;
        if (eFill) eFill.style.width = "100%";
      } else {
        eVal.textContent = state.energy + "/" + state.energyMax + " · " + formatRegen();
        const ms = Math.max(0, state.energyReadyAt - Date.now());
        const pct = 100 - Math.min(100, (ms / ENERGY_REGEN_MS) * 100);
        if (eFill) eFill.style.width = pct + "%";
      }
    }

    // Lantern day (until midnight)
    const sVal = $("timer-streak-value");
    const sFill = $("timer-streak-fill");
    if (sVal) {
      const untilMid = msUntilMidnight();
      const wonToday = state.lastWinDay === todayKey();
      sVal.textContent = wonToday
        ? "Safe · " + state.streak + "d"
        : "Win · " + msToClock(untilMid);
      if (sFill) {
        const dayMs = 24 * 60 * 60 * 1000;
        sFill.style.width = wonToday ? "100%" : Math.max(5, (untilMid / dayMs) * 100) + "%";
      }
      $("timer-streak").classList.toggle("critical", !wonToday && untilMid < 2 * 60 * 60 * 1000);
    }

    // Luma mood
    const mood = $("map-luma-mood");
    if (mood) {
      const next = Math.min(state.maxUnlocked, LEVELS.length - 1);
      const left = state.dimPressureEndsAt - Date.now();
      if (LEVELS.every((l) => state.cleared[l.id])) {
        mood.textContent = "Wick steady. You saved us.";
      } else if (left < 90000) {
        mood.textContent = "Hurry — names are slipping!";
      } else if (state.energy <= 0) {
        mood.textContent = "Rest a moment… then come back.";
      } else {
        const who = LEVELS[next] && LEVELS[next].save;
        mood.textContent = who
          ? who.name + " still waits in the mist"
          : "Stay with me on the Path";
      }
    }

    refreshMetaHud();
  }

  function startMapTimers() {
    if (state.mapTimerId) clearInterval(state.mapTimerId);
    updateMapTimers();
    state.mapTimerId = setInterval(updateMapTimers, 500);
  }

  function spawnMapFireflies() {
    const host = $("map-fireflies");
    if (!host) return;
    host.innerHTML = "";
    const n = 10 + state.groveLevel * 2;
    for (let i = 0; i < n; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = Math.random() * 100 + "%";
      f.style.top = Math.random() * 100 + "%";
      f.style.animationDelay = Math.random() * 4 + "s";
      f.style.animationDuration = 3 + Math.random() * 4 + "s";
      host.appendChild(f);
    }
  }

  function openMap() {
    refreshMetaHud();
    ensureDimPressure();
    spawnMapFireflies();

    const d = pathD();
    const trailDim = $("path-trail-dim");
    const trailLit = $("path-trail-lit");
    if (trailDim) trailDim.setAttribute("d", d);
    if (trailLit) trailLit.setAttribute("d", d);

    // Lit path length by progress
    const clearedCount = LEVELS.filter((l) => state.cleared[l.id]).length;
    const progress = clearedCount / LEVELS.length;
    if (trailLit) {
      const len = 900; // approx path length in user units
      trailLit.style.strokeDasharray = String(len);
      trailLit.style.strokeDashoffset = String(len * (1 - progress));
    }

    const path = $("map-path");
    path.innerHTML = "";
    path.style.height = "720px";

    LEVELS.forEach((level, i) => {
      const pos = PATH_NODES[i];
      const cleared = !!state.cleared[level.id];
      const unlocked = i <= state.maxUnlocked;
      const current =
        unlocked &&
        !cleared &&
        i === Math.min(state.maxUnlocked, LEVELS.length - 1);
      const save = level.save || {};

      const node = document.createElement("div");
      node.className =
        "path-node" +
        (cleared ? " cleared" : "") +
        (current ? " current" : "") +
        (unlocked ? " unlocked" : " locked") +
        (state.dimPressureEndsAt &&
        state.dimPressureEndsAt - Date.now() < 90000 &&
        !cleared &&
        unlocked
          ? " dim-threat"
          : "");
      node.style.left = (pos.x / 320) * 100 + "%";
      node.style.top = (pos.y / 720) * 100 + "%";

      const char = document.createElement("div");
      char.className = "path-char char-" + (save.id || "pip") + (cleared ? " saved" : " endangered");
      char.setAttribute("aria-hidden", "true");

      const pulse = document.createElement("div");
      pulse.className = "path-pulse";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "path-node-btn";
      btn.disabled = !unlocked;
      btn.innerHTML =
        '<span class="path-node-ring"></span>' +
        '<span class="path-node-face">' +
        (cleared ? "✓" : level.id) +
        "</span>" +
        '<span class="path-node-label">' +
        (save.name || level.title) +
        "</span>" +
        '<span class="path-node-sub">' +
        (cleared
          ? "Saved · " + "★".repeat(state.cleared[level.id] || 1)
          : unlocked
            ? "Tap to rescue"
            : "Lost in mist") +
        "</span>";

      btn.addEventListener("click", () => {
        if (!unlocked) return;
        openLevelIntro(i);
      });

      node.appendChild(pulse);
      node.appendChild(char);
      node.appendChild(btn);
      path.appendChild(node);
    });

    // Walker glows on current rescue target
    const walker = $("path-walker");
    const nextI = Math.min(state.maxUnlocked, PATH_NODES.length - 1);
    const np = PATH_NODES[nextI];
    if (walker && np) {
      walker.setAttribute("cx", np.x);
      walker.setAttribute("cy", np.y);
    }

    // Banner: who to save
    const focusIdx = Math.min(state.maxUnlocked, LEVELS.length - 1);
    const focus = LEVELS[focusIdx];
    const savedAll = LEVELS.every((l) => state.cleared[l.id]);
    if (focus && focus.save) {
      const av = $("save-avatar");
      if (av) {
        av.dataset.who = focus.save.id;
        av.className =
          "save-avatar char-" +
          focus.save.id +
          (state.cleared[focus.id] ? " saved" : " endangered");
      }
      $("save-who").textContent = savedAll
        ? "Everyone we reached is safe — for now"
        : "Save " + focus.save.name + " · " + focus.save.role;
      $("save-plea").textContent = state.cleared[focus.id]
        ? focus.save.saved
        : focus.save.plea;
    }

    const next = Math.min(state.maxUnlocked, LEVELS.length - 1);
    $("btn-map-play").onclick = () => {
      if (savedAll || state.campaignDone) {
        showCampaignComplete();
        return;
      }
      openLevelIntro(next);
    };
    const playLabel = $("map-play-label");
    if (playLabel) {
      playLabel.textContent = savedAll
        ? "Path complete"
        : "Rescue " + (LEVELS[next].save ? LEVELS[next].save.name : "next");
    }

    showScreen("map");
    startMapTimers();

    // If everything saved, push ending (no infinite map loop)
    if (savedAll && !state.campaignDone) {
      state.campaignDone = true;
      save();
    }

    // Animate path draw
    if (trailLit) {
      trailLit.classList.remove("draw");
      void trailLit.offsetWidth;
      trailLit.classList.add("draw");
    }
  }

  function starsLabel(n) {
    return "★".repeat(n || 1) + " · cleared";
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function beginNewPath() {
    state.levelIndex = 0;
    state.maxUnlocked = 0;
    state.cleared = {};
    state.groveLevel = 0;
    state.seenIntro = false;
    state.campaignDone = false;
    state.energy = ENERGY_MAX;
    state.energyReadyAt = 0;
    state.streak = 0;
    state.lastWinDay = "";
    state.album = 0;
    state.dailyPrismClaimedDay = "";
    state.firstFailFreeDay = "";
    state.dimPressureEndsAt = Date.now() + DIM_PRESSURE_MS;
    save();
    // First minute: 1 line → BOARD. No walls of text.
    startStory(GlimmerStory.coldOpen, () => {
      state.seenIntro = true;
      save();
      state.levelIndex = 0;
      startLevel(); // free energy, tutorial board, play NOW
    });
  }

  function boot() {
    load();
    setTimeout(() => {
      showScreen("title");
      const cont = $("btn-continue");
      if (state.campaignDone) {
        cont.hidden = false;
        cont.textContent = "View ending";
      } else if (state.seenIntro || state.maxUnlocked > 0) {
        cont.hidden = false;
        cont.textContent = "Continue path";
      } else {
        cont.hidden = true;
      }
      refreshMetaHud();
    }, 700);

    // energy regen ticker
    setInterval(() => {
      const before = state.energy;
      tickEnergy();
      if (state.energy !== before) {
        save();
        refreshMetaHud();
      }
    }, 1000);

    $("btn-new-path").addEventListener("click", beginNewPath);
    $("btn-continue").addEventListener("click", () => {
      if (!state.seenIntro) {
        beginNewPath();
        return;
      }
      if (state.campaignDone || campaignComplete()) {
        showCampaignComplete();
        return;
      }
      openMap();
    });
    $("btn-reset").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      state.levelIndex = 0;
      state.maxUnlocked = 0;
      state.cleared = {};
      state.groveLevel = 0;
      state.seenIntro = false;
      state.campaignDone = false;
      state.energy = ENERGY_MAX;
      state.streak = 0;
      state.album = 0;
      $("btn-continue").hidden = true;
      beginNewPath();
    });

    $("btn-story-next").addEventListener("click", advanceStory);
    $("btn-story-skip").addEventListener("click", skipStory);
    $("btn-play-level").addEventListener("click", startLevel);

    $("btn-pause").addEventListener("click", () => {
      $("overlay-pause").hidden = false;
    });
    $("btn-resume").addEventListener("click", () => {
      $("overlay-pause").hidden = true;
    });
    $("btn-quit-level").addEventListener("click", () => {
      $("overlay-pause").hidden = true;
      openMap();
    });

    $("btn-win-next").addEventListener("click", afterWinFlow);
    const winMap = $("btn-win-map");
    if (winMap) {
      winMap.addEventListener("click", () => {
        if (campaignComplete()) showCampaignComplete();
        else openMap();
      });
    }
    const revealBtn = $("btn-reveal-continue");
    if (revealBtn) {
      revealBtn.addEventListener("click", () => {
        startStory(GlimmerStory.afterFirstWin, () => openGrove());
      });
    }
    const winSpin = $("btn-win-spin");
    if (winSpin) {
      winSpin.addEventListener("click", () => {
        if (state.winSpinUsed) {
          $("spin-result").textContent = "Already spun this win — daily Wick still free once.";
          openLuckyWick("win");
          $("btn-spin-pull").hidden = true;
          $("btn-spin-done").hidden = false;
          return;
        }
        openLuckyWick("win");
      });
    }
    $("btn-spin-pull").addEventListener("click", () => {
      if (state.spinSource === "daily") {
        state.dailyPrismClaimedDay = todayKey();
        save();
      }
      if (state.spinSource === "win") state.winSpinUsed = true;
      runLuckyWickSpin();
    });
    $("btn-spin-done").addEventListener("click", () => {
      closeLuckyWick();
      if (state.screen === "win" || $("screen-win").classList.contains("active")) {
        // remain on win to choose next
        refreshMetaHud();
      }
    });

    $("btn-retry").addEventListener("click", () => openLevelIntro(state.levelIndex));
    $("btn-lose-map").addEventListener("click", openMap);
    $("btn-grove-continue").addEventListener("click", () => {
      openMap(); // Nori waits on map — character pull
    });
    $("btn-map-grove").addEventListener("click", openGrove);
    $("btn-replay").addEventListener("click", beginNewPath);
    $("btn-complete-map").addEventListener("click", () => openMap());

    $("btn-energy-wait").addEventListener("click", () => {
      // Instant prototype mercy: grant 1 after acknowledging wait (still shows timer truth)
      // Full game: wait only. Here: if any energy regen tick, close; else +1 after "patience"
      tickEnergy();
      if (state.energy <= 0) {
        state.energy = 1;
        state.energyReadyAt = Date.now() + ENERGY_REGEN_MS;
        save();
      }
      closeEnergyGate();
      refreshMetaHud();
      openLevelIntro(state.levelIndex);
    });
    $("btn-energy-ad").addEventListener("click", () => {
      // Labeled optional reward — no real ad in prototype
      state.energy = Math.min(state.energyMax, state.energy + 1);
      save();
      closeEnergyGate();
      refreshMetaHud();
      openLevelIntro(state.levelIndex);
    });
    $("btn-energy-map").addEventListener("click", () => {
      closeEnergyGate();
      openMap();
    });

    const dailyBtn = $("btn-daily-prism");
    if (dailyBtn) {
      dailyBtn.addEventListener("click", () => {
        if (state.dailyPrismClaimedDay === todayKey()) return;
        openLuckyWick("daily");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
