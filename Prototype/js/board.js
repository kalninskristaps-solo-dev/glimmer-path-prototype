/**
 * Glimmer Path — match-3 board engine (prototype)
 */
(function (global) {
  const COLORS = ["rose", "citrine", "jade", "sky", "amethyst"];

  function randColor(palette) {
    const p = palette || COLORS;
    return p[(Math.random() * p.length) | 0];
  }

  let _nextId = 1;
  function nextId() {
    return _nextId++;
  }

  function emptyCell() {
    return {
      id: null,
      color: null,
      special: null,
      dir: null,
      fog: 0,
      bloom: false,
      bloomLit: false,
    };
  }

  class Board {
    constructor(opts) {
      this.rows = opts.rows || 7;
      this.cols = opts.cols || 7;
      this.palette = opts.palette || COLORS.slice(0, opts.colorCount || 5);
      this.grid = [];
      this.locked = false;
      this.onChange = opts.onChange || (() => {});
      this.onTip = opts.onTip || (() => {});
    }

    init(layout) {
      this.grid = [];
      for (let r = 0; r < this.rows; r++) {
        const row = [];
        for (let c = 0; c < this.cols; c++) {
          const cell = emptyCell();
          if (layout && layout[r] && layout[r][c]) {
            const L = layout[r][c];
            if (L === "void") {
              cell.void = true;
              cell.color = null;
            } else {
              if (L.color) cell.color = L.color;
              if (L.fog) cell.fog = L.fog;
              if (L.bloom) cell.bloom = true;
              if (L.special) {
                cell.special = L.special;
                cell.dir = L.dir || "row";
              }
            }
          }
          row.push(cell);
        }
        this.grid.push(row);
      }
      // Fill empties without starting matches (simple retries)
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.grid[r][c];
          if (cell.void) continue;
          if (!cell.color) {
            cell.color = this._safeColor(r, c);
            cell.id = nextId();
          } else if (!cell.id) {
            cell.id = nextId();
          }
        }
      }
      // Clear accidental matches at start
      let guard = 0;
      while (this.findMatches().groups.length && guard++ < 40) {
        const { groups } = this.findMatches();
        for (const g of groups) {
          for (const { r, c } of g.cells) {
            if (!this.grid[r][c].void) {
              this.grid[r][c].color = this._safeColor(r, c);
              this.grid[r][c].special = null;
              this.grid[r][c].id = nextId();
            }
          }
        }
      }
      this.onChange();
    }

    _safeColor(r, c) {
      let tries = 0;
      while (tries++ < 20) {
        const col = randColor(this.palette);
        if (!this._wouldMatchAt(r, c, col)) return col;
      }
      return randColor(this.palette);
    }

    _wouldMatchAt(r, c, color) {
      // horizontal
      let left = 0;
      for (let cc = c - 1; cc >= 0; cc--) {
        const cell = this.grid[r][cc];
        if (cell && !cell.void && cell.color === color) left++;
        else break;
      }
      let right = 0;
      for (let cc = c + 1; cc < this.cols; cc++) {
        const cell = this.grid[r][cc];
        if (cell && !cell.void && cell.color === color) right++;
        else break;
      }
      if (left + right >= 2) return true;
      // vertical
      let up = 0;
      for (let rr = r - 1; rr >= 0; rr--) {
        const cell = this.grid[rr][c];
        if (cell && !cell.void && cell.color === color) up++;
        else break;
      }
      let down = 0;
      for (let rr = r + 1; rr < this.rows; rr++) {
        const cell = this.grid[rr][c];
        if (cell && !cell.void && cell.color === color) down++;
        else break;
      }
      return up + down >= 2;
    }

    cell(r, c) {
      if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return null;
      return this.grid[r][c];
    }

    adjacent(a, b) {
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
    }

    swap(a, b) {
      const ca = this.grid[a.r][a.c];
      const cb = this.grid[b.r][b.c];
      if (!ca || !cb || ca.void || cb.void) return false;
      if (!ca.color || !cb.color) return false;

      // Special + special / special activation on swap
      const specialCombo = ca.special || cb.special;
      this._swapCells(a, b);

      if (ca.special && cb.special) {
        return { ok: true, specialActivate: { a, b, dual: true } };
      }
      if (specialCombo && (ca.special || cb.special)) {
        // Swapping special with normal can detonate special at new pos
        // Only auto-detonate if no match formed? CCS detonates on special+special mainly.
        // Prototype: if swap creates no match but one is special, still check matches first.
      }

      const matches = this.findMatches();
      if (!matches.groups.length && !(ca.special && cb.special)) {
        // Check if either side is special swapped intentionally — allow beam detonate by double-tap only.
        this._swapCells(a, b); // revert
        return { ok: false };
      }
      return { ok: true, matches };
    }

    _swapCells(a, b) {
      const ca = this.grid[a.r][a.c];
      const cb = this.grid[b.r][b.c];
      const keys = ["id", "color", "special", "dir"];
      for (const k of keys) {
        const t = ca[k];
        ca[k] = cb[k];
        cb[k] = t;
      }
    }

    findMatches() {
      const marked = Array.from({ length: this.rows }, () =>
        Array(this.cols).fill(null)
      );
      const groups = [];

      // Horizontal runs
      for (let r = 0; r < this.rows; r++) {
        let run = 1;
        for (let c = 1; c <= this.cols; c++) {
          const prev = this.grid[r][c - 1];
          const cur = c < this.cols ? this.grid[r][c] : null;
          const same =
            cur &&
            prev &&
            !prev.void &&
            !cur.void &&
            prev.color &&
            prev.color === cur.color;
          if (same) {
            run++;
          } else {
            if (run >= 3 && prev && prev.color) {
              const cells = [];
              for (let k = 0; k < run; k++) {
                cells.push({ r, c: c - 1 - k });
              }
              groups.push({
                color: prev.color,
                cells,
                orient: "row",
                len: run,
              });
              cells.forEach((p) => {
                marked[p.r][p.c] = marked[p.r][p.c] || { color: prev.color, orients: [] };
                marked[p.r][p.c].orients.push("row");
                marked[p.r][p.c].len = Math.max(marked[p.r][p.c].len || 0, run);
              });
            }
            run = 1;
          }
        }
      }

      // Vertical runs
      for (let c = 0; c < this.cols; c++) {
        let run = 1;
        for (let r = 1; r <= this.rows; r++) {
          const prev = this.grid[r - 1][c];
          const cur = r < this.rows ? this.grid[r][c] : null;
          const same =
            cur &&
            prev &&
            !prev.void &&
            !cur.void &&
            prev.color &&
            prev.color === cur.color;
          if (same) {
            run++;
          } else {
            if (run >= 3 && prev && prev.color) {
              const cells = [];
              for (let k = 0; k < run; k++) {
                cells.push({ r: r - 1 - k, c });
              }
              groups.push({
                color: prev.color,
                cells,
                orient: "col",
                len: run,
              });
              cells.forEach((p) => {
                marked[p.r][p.c] = marked[p.r][p.c] || { color: prev.color, orients: [] };
                marked[p.r][p.c].orients.push("col");
                marked[p.r][p.c].len = Math.max(marked[p.r][p.c].len || 0, run);
              });
            }
            run = 1;
          }
        }
      }

      return { groups, marked };
    }

    /**
     * Expand match clears when existing specials are part of the match.
     * Specials auto-deploy (beam/burst/prism) instead of vanishing as normals.
     * Chains into other specials hit by the blast.
     */
    _expandMatchWithSpecials(matchKeys) {
      const toClear = new Set(matchKeys);
      const autoSpecials = [];
      const detonated = new Set();
      const queue = [];

      for (const key of matchKeys) {
        const [r, c] = key.split(",").map(Number);
        const cell = this.grid[r][c];
        if (cell && cell.special) {
          queue.push({
            r,
            c,
            type: cell.special,
            dir: cell.dir || "row",
            color: cell.color,
          });
        }
      }

      while (queue.length) {
        const s = queue.shift();
        const sk = `${s.r},${s.c}`;
        if (detonated.has(sk)) continue;
        detonated.add(sk);
        autoSpecials.push(s);

        const blast = this.detonateAt(s.r, s.c);
        for (const p of blast) {
          const pk = `${p.r},${p.c}`;
          toClear.add(pk);
          const other = this.grid[p.r][p.c];
          if (
            other &&
            other.special &&
            !detonated.has(pk) &&
            !queue.some((q) => q.r === p.r && q.c === p.c)
          ) {
            queue.push({
              r: p.r,
              c: p.c,
              type: other.special,
              dir: other.dir || "row",
              color: other.color,
            });
          }
        }
      }

      return { toClear, autoSpecials, detonated };
    }

    /**
     * Resolve matches: clear, auto-fire specials in matches, create specials, gravity, refill.
     * uiHooks: animatePulse, animateClear, animateDetonate, animateSpecials, animateGravity
     */
    async resolve(matches, uiHooks) {
      const stats = {
        collected: {},
        bloomsLit: 0,
        fogCleared: 0,
        specialsMade: { beam: 0, burst: 0, prism: 0 },
        specialsFired: 0,
        cascades: 0,
      };
      COLORS.forEach((c) => (stats.collected[c] = 0));

      let current = matches || this.findMatches();
      if (!current.groups.length) return stats;

      let cascade = 0;
      while (current.groups.length) {
        cascade++;
        if (cascade > 1) stats.cascades++;

        const matchKeys = new Set();
        for (const g of current.groups) {
          for (const p of g.cells) matchKeys.add(`${p.r},${p.c}`);
        }

        // Existing specials in a color match → auto-deploy (not plain clear)
        const { toClear, autoSpecials, detonated } =
          this._expandMatchWithSpecials(matchKeys);

        // Forge new specials from this match (not on cells that just detonated)
        let spawnSpecials = this._planSpecials(current).filter(
          (s) => !detonated.has(`${s.r},${s.c}`)
        );

        const fogHits = new Set();
        for (const key of toClear) {
          const [r, c] = key.split(",").map(Number);
          fogHits.add(key);
          [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1],
          ].forEach(([rr, cc]) => {
            const cell = this.cell(rr, cc);
            if (cell && cell.fog > 0) fogHits.add(`${rr},${cc}`);
          });
        }

        const clearKeys = [...toClear];

        if (autoSpecials.length) {
          stats.specialsFired += autoSpecials.length;
          // Lead with the first matched special's FX; include full clear set
          const lead = autoSpecials[0];
          if (uiHooks && uiHooks.animateDetonate) {
            await uiHooks.animateDetonate({
              r: lead.r,
              c: lead.c,
              type: lead.type,
              dir: lead.dir,
              color: lead.color,
              dual: autoSpecials.length > 1,
              chained: autoSpecials.slice(1),
              keys: clearKeys,
              autoFromMatch: true,
            });
          } else if (uiHooks && uiHooks.animateClear) {
            await uiHooks.animateClear(clearKeys, {
              cascade,
              special: true,
              type: lead.type,
            });
          }
        } else {
          if (uiHooks && uiHooks.animatePulse) {
            await uiHooks.animatePulse(clearKeys, cascade);
          }
          if (uiHooks && uiHooks.animateClear) {
            await uiHooks.animateClear(clearKeys, { cascade, special: false });
          }
        }

        const specialSpawnPayload = [];
        for (const key of toClear) {
          const [r, c] = key.split(",").map(Number);
          const cell = this.grid[r][c];
          if (!cell || cell.void) continue;
          if (cell.color && stats.collected[cell.color] !== undefined) {
            stats.collected[cell.color]++;
          }
          if (cell.bloom && !cell.bloomLit) {
            cell.bloomLit = true;
            stats.bloomsLit++;
          }
          const spawn = spawnSpecials.find((s) => s.r === r && s.c === c);
          if (spawn) {
            // New special forged from match pattern — stays on board (does not auto-fire yet)
            cell.color = spawn.color;
            cell.special = spawn.type;
            cell.dir = spawn.dir || "row";
            cell.id = nextId();
            specialSpawnPayload.push({
              r,
              c,
              type: spawn.type,
              color: spawn.color,
              dir: cell.dir,
              id: cell.id,
            });
            if (spawn.type === "beam") stats.specialsMade.beam++;
            if (spawn.type === "burst") stats.specialsMade.burst++;
            if (spawn.type === "prism") stats.specialsMade.prism++;
          } else {
            cell.color = null;
            cell.special = null;
            cell.dir = null;
            cell.id = null;
          }
        }

        for (const key of fogHits) {
          const [r, c] = key.split(",").map(Number);
          const cell = this.grid[r][c];
          if (cell && cell.fog > 0) {
            cell.fog--;
            stats.fogCleared++;
          }
        }

        if (uiHooks && uiHooks.animateSpecials && specialSpawnPayload.length) {
          await uiHooks.animateSpecials(specialSpawnPayload);
        }

        const falls = this._gravity();
        const spawns = this._refill();

        if (uiHooks && uiHooks.animateGravity) {
          await uiHooks.animateGravity(falls, spawns, cascade);
        } else {
          this.onChange();
        }

        // Let UI apply partial stats / abort cascades once goals are met
        if (uiHooks && uiHooks.afterCascadeStats) {
          const stop = await uiHooks.afterCascadeStats(stats);
          if (stop) break;
        }

        current = this.findMatches();
      }

      return stats;
    }

    _planSpecials(matchResult) {
      // For each match group, if len>=4 or L/T intersection, spawn special
      const spawns = [];
      const used = new Set();

      // First: detect L/T by cells with both row and col orients
      const { marked, groups } = matchResult;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const m = marked[r][c];
          if (!m) continue;
          const orients = m.orients || [];
          const hasRow = orients.includes("row");
          const hasCol = orients.includes("col");
          if (hasRow && hasCol) {
            const key = `${r},${c}`;
            if (!used.has(key)) {
              used.add(key);
              spawns.push({ r, c, type: "burst", color: m.color });
            }
          }
        }
      }

      for (const g of groups) {
        if (g.len >= 5) {
          // prism at middle
          const mid = g.cells[(g.cells.length / 2) | 0];
          const key = `${mid.r},${mid.c}`;
          if (!used.has(key)) {
            used.add(key);
            spawns.push({
              r: mid.r,
              c: mid.c,
              type: "prism",
              color: g.color,
              dir: g.orient,
            });
          }
        } else if (g.len === 4) {
          const mid = g.cells[1];
          const key = `${mid.r},${mid.c}`;
          if (!used.has(key)) {
            used.add(key);
            spawns.push({
              r: mid.r,
              c: mid.c,
              type: "beam",
              color: g.color,
              dir: g.orient === "col" ? "col" : "row",
            });
          }
        }
      }

      return spawns;
    }

    /** @returns {{id,fromR,toR,c,color,special,dir}[]} */
    _gravity() {
      const falls = [];
      for (let c = 0; c < this.cols; c++) {
        let write = this.rows - 1;
        for (let r = this.rows - 1; r >= 0; r--) {
          const cell = this.grid[r][c];
          if (cell.void) {
            write = r - 1;
            continue;
          }
          if (cell.color) {
            if (write !== r) {
              const dest = this.grid[write][c];
              dest.id = cell.id;
              dest.color = cell.color;
              dest.special = cell.special;
              dest.dir = cell.dir;
              falls.push({
                id: dest.id,
                fromR: r,
                toR: write,
                c,
                color: dest.color,
                special: dest.special,
                dir: dest.dir,
              });
              cell.id = null;
              cell.color = null;
              cell.special = null;
              cell.dir = null;
            }
            write--;
          }
        }
      }
      return falls;
    }

    /** @returns {{id,r,c,color,drop}[]} */
    _refill() {
      const spawns = [];
      for (let c = 0; c < this.cols; c++) {
        let drop = 0;
        for (let r = 0; r < this.rows; r++) {
          const cell = this.grid[r][c];
          if (cell.void) continue;
          if (!cell.color) {
            drop++;
            cell.color = randColor(this.palette);
            cell.special = null;
            cell.dir = null;
            cell.id = nextId();
            spawns.push({
              id: cell.id,
              r,
              c,
              color: cell.color,
              drop,
            });
          }
        }
      }
      return spawns;
    }

    /** Detonate special at r,c — returns positions cleared */
    detonateAt(r, c) {
      const cell = this.grid[r][c];
      if (!cell || !cell.special) return [];
      const positions = [];
      const type = cell.special;
      const color = cell.color;

      if (type === "beam") {
        if (cell.dir === "col") {
          for (let rr = 0; rr < this.rows; rr++) positions.push({ r: rr, c });
        } else {
          for (let cc = 0; cc < this.cols; cc++) positions.push({ r, c: cc });
        }
      } else if (type === "burst") {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (this.cell(rr, cc) && !this.cell(rr, cc).void) {
              positions.push({ r: rr, c: cc });
            }
          }
        }
      } else if (type === "prism") {
        for (let rr = 0; rr < this.rows; rr++) {
          for (let cc = 0; cc < this.cols; cc++) {
            const t = this.grid[rr][cc];
            if (t && !t.void && t.color === color) positions.push({ r: rr, c: cc });
          }
        }
        // always include self
        positions.push({ r, c });
      }

      return positions;
    }

    async activateSpecial(r, c, uiHooks, opts) {
      const origin = this.grid[r][c];
      if (!origin || !origin.special) return null;
      const type = origin.special;
      const dir = origin.dir || "row";
      const color = origin.color;
      const positions = this.detonateAt(r, c);
      if (!positions.length) return null;

      const stats = {
        collected: {},
        bloomsLit: 0,
        fogCleared: 0,
        specialsMade: { beam: 0, burst: 0, prism: 0 },
        specialsFired: 1,
        cascades: 0,
        lastSpecial: type,
      };
      COLORS.forEach((col) => (stats.collected[col] = 0));

      const toClear = new Set(positions.map((p) => `${p.r},${p.c}`));
      // Chain: if clearing hits other specials, add their patterns (simple 1-depth)
      const chained = [];
      for (const key of [...toClear]) {
        const [rr, cc] = key.split(",").map(Number);
        const cell = this.grid[rr][cc];
        if (cell && cell.special && !(rr === r && cc === c)) {
          chained.push({ r: rr, c: cc, type: cell.special, dir: cell.dir });
          this.detonateAt(rr, cc).forEach((p) => toClear.add(`${p.r},${p.c}`));
        }
      }

      const detonateInfo = {
        r,
        c,
        type,
        dir,
        color,
        dual: !!(opts && opts.dual),
        chained,
        keys: [...toClear],
      };

      if (uiHooks && uiHooks.animateDetonate) {
        await uiHooks.animateDetonate(detonateInfo);
      } else {
        if (uiHooks && uiHooks.animatePulse) {
          await uiHooks.animatePulse([...toClear], 1);
        }
        if (uiHooks && uiHooks.animateClear) {
          await uiHooks.animateClear([...toClear], { cascade: 1, special: true, type });
        }
      }

      for (const key of toClear) {
        const [rr, cc] = key.split(",").map(Number);
        const cell = this.grid[rr][cc];
        if (!cell || cell.void) continue;
        if (cell.color && stats.collected[cell.color] !== undefined) {
          stats.collected[cell.color]++;
        }
        if (cell.bloom && !cell.bloomLit) {
          cell.bloomLit = true;
          stats.bloomsLit++;
        }
        if (cell.fog > 0) {
          cell.fog = 0;
          stats.fogCleared++;
        }
        cell.color = null;
        cell.special = null;
        cell.dir = null;
        cell.id = null;
      }

      const falls = this._gravity();
      const spawns = this._refill();
      if (uiHooks && uiHooks.animateGravity) {
        await uiHooks.animateGravity(falls, spawns, 1);
      } else {
        this.onChange();
      }

      const follow = await this.resolve(this.findMatches(), uiHooks);
      this._mergeStats(stats, follow);
      return stats;
    }

    _mergeStats(a, b) {
      if (!b) return;
      for (const k of Object.keys(b.collected || {})) {
        a.collected[k] = (a.collected[k] || 0) + b.collected[k];
      }
      a.bloomsLit += b.bloomsLit || 0;
      a.fogCleared += b.fogCleared || 0;
      a.specialsFired += b.specialsFired || 0;
      a.cascades += b.cascades || 0;
      if (b.specialsMade) {
        a.specialsMade.beam += b.specialsMade.beam || 0;
        a.specialsMade.burst += b.specialsMade.burst || 0;
        a.specialsMade.prism += b.specialsMade.prism || 0;
      }
    }

    findHint() {
      // Brute: try every adjacent swap
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const neighbors = [
            { r, c: c + 1 },
            { r: r + 1, c },
          ];
          for (const n of neighbors) {
            if (!this.cell(n.r, n.c)) continue;
            const a = { r, c };
            this._swapCells(a, n);
            const m = this.findMatches();
            const sa = this.grid[a.r][a.c].special;
            const sn = this.grid[n.r][n.c].special;
            this._swapCells(a, n);
            if (m.groups.length || (sa && sn)) {
              return { a, b: n };
            }
          }
        }
      }
      return null;
    }

    bloomsRemaining() {
      let n = 0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.grid[r][c];
          if (cell.bloom && !cell.bloomLit) n++;
        }
      }
      return n;
    }

    fogRemaining() {
      let n = 0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          n += this.grid[r][c].fog || 0;
        }
      }
      return n;
    }
  }

  global.GlimmerBoard = Board;
  global.GLIMMER_COLORS = COLORS;
})(window);
