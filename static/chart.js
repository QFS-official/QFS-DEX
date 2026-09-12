/* QFS Swap — static price chart
 * Renders a self-contained SVG area chart with a seeded random-walk price series.
 * No external dependencies — works on plain GitHub Pages.
 */
(function () {
  "use strict";

  // ─── Price catalog (mock values matching the app) ──────────────────────
  const PRICES = {
    QFS: 1.0,
    USDC: 1.0,
    USDT: 1.0,
    ETH: 2350.0,
    BNB: 580.0,
    POL: 0.42,
    SOL: 145.0,
    ALARAB: 1.0,
    GCRM: 0.5,
    TRAEX: 0.25,
  };

  // ─── Range configs ─────────────────────────────────────────────────────
  const RANGES = {
    "1h": { points: 60, bucketMs: 60_000, volatility: 0.008 },
    "24h": { points: 96, bucketMs: 15 * 60_000, volatility: 0.012 },
    "7d": { points: 168, bucketMs: 60 * 60_000, volatility: 0.04 },
    "30d": { points: 120, bucketMs: 6 * 60 * 60_000, volatility: 0.08 },
  };

  // ─── Seeded RNG (FNV-1a + mulberry32) ─────────────────────────────────
  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) >>> 0;
  }
  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ─── Generate price series ─────────────────────────────────────────────
  function generateSeries(pairKey, range, currentPrice) {
    const rand = mulberry32(hashString(pairKey));
    const now = Date.now();
    const total = [];
    let price = currentPrice * (1 - range.volatility * 3);
    for (let i = range.points; i > 0; i--) {
      const drift = (currentPrice - price) * 0.05;
      const noise = (rand() - 0.5) * 2 * range.volatility * price;
      price = Math.max(price + drift + noise, currentPrice * 0.5);
      total.push({ t: now - i * range.bucketMs, p: price });
    }
    total.push({ t: now, p: currentPrice });
    return total;
  }

  // ─── Format helpers ────────────────────────────────────────────────────
  function formatPrice(p) {
    if (p >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (p >= 1) return p.toFixed(2);
    if (p >= 0.01) return p.toFixed(4);
    if (p >= 0.0001) return p.toFixed(6);
    return p.toExponential(2);
  }
  function formatTime(t, rangeId) {
    const d = new Date(t);
    if (rangeId === "1h" || rangeId === "24h") {
      return d.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }
  function formatAxisTime(t, rangeId) {
    const d = new Date(t);
    if (rangeId === "1h" || rangeId === "24h") {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // ─── SVG chart rendering ───────────────────────────────────────────────
  const W = 800;
  const H = 240;
  const PADDING = { top: 10, right: 50, bottom: 20, left: 4 };

  function renderChart(data, isUp, rangeId) {
    const svg = document.getElementById("chart");
    svg.innerHTML = "";

    const min = Math.min.apply(null, data.map((d) => d.p));
    const max = Math.max.apply(null, data.map((d) => d.p));
    const yPad = (max - min) * 0.1 || max * 0.01;
    const yMin = min - yPad;
    const yMax = max + yPad;

    const plotW = W - PADDING.left - PADDING.right;
    const plotH = H - PADDING.top - PADDING.bottom;

    const xScale = (i) =>
      PADDING.left + (i / (data.length - 1)) * plotW;
    const yScale = (p) =>
      PADDING.top + (1 - (p - yMin) / (yMax - yMin)) * plotH;

    const lineColor = isUp ? "#14F195" : "#ef4444";
    const fillId = "priceFill-" + Math.random().toString(36).slice(2, 8);

    // Build smooth path
    let linePath = "M " + xScale(0) + " " + yScale(data[0].p);
    for (let i = 1; i < data.length; i++) {
      linePath += " L " + xScale(i) + " " + yScale(data[i].p);
    }
    let areaPath =
      linePath +
      " L " + xScale(data.length - 1) + " " + (H - PADDING.bottom) +
      " L " + xScale(0) + " " + (H - PADDING.bottom) +
      " Z";

    // Grid lines (horizontal, 4 lines)
    let gridLines = "";
    for (let i = 0; i <= 4; i++) {
      const y = PADDING.top + (i / 4) * plotH;
      gridLines +=
        '<line x1="' + PADDING.left + '" y1="' + y + '" x2="' + (W - PADDING.right) + '" y2="' + y +
        '" stroke="rgba(255,255,255,0.04)" stroke-dasharray="3 3" stroke-width="1" />';
    }

    // Y-axis labels (right side)
    let yLabels = "";
    for (let i = 0; i <= 4; i++) {
      const ratio = i / 4;
      const y = PADDING.top + ratio * plotH;
      const p = yMax - ratio * (yMax - yMin);
      yLabels +=
        '<text x="' + (W - PADDING.right + 8) + '" y="' + (y + 3) +
        '" fill="rgba(255,255,255,0.4)" font-size="10" font-family="sans-serif">' +
        formatPrice(p) + "</text>";
    }

    // X-axis labels (5 ticks)
    let xLabels = "";
    const xTickStep = Math.max(1, Math.floor(data.length / 5));
    for (let i = 0; i < data.length; i += xTickStep) {
      const x = xScale(i);
      xLabels +=
        '<text x="' + x + '" y="' + (H - 4) + '" fill="rgba(255,255,255,0.4)" ' +
        'font-size="10" font-family="sans-serif" text-anchor="middle">' +
        formatAxisTime(data[i].t, rangeId) + "</text>";
    }

    // Vertical crosshair (hidden until hover)
    const crosshair =
      '<line id="crosshair" x1="0" y1="' + PADDING.top + '" x2="0" y2="' +
      (H - PADDING.bottom) + '" stroke="rgba(255,255,255,0.25)" stroke-width="1" visibility="hidden" />';
    const dot =
      '<circle id="crosshair-dot" cx="0" cy="0" r="4" fill="' + lineColor +
      '" stroke="#0b0a1f" stroke-width="2" visibility="hidden" />';

    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="' + fillId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + lineColor + '" stop-opacity="0.35" />' +
      '<stop offset="100%" stop-color="' + lineColor + '" stop-opacity="0" />' +
      "</linearGradient>" +
      "</defs>" +
      gridLines +
      xLabels +
      yLabels +
      '<path d="' + areaPath + '" fill="url(#' + fillId + ')" />' +
      '<path d="' + linePath + '" fill="none" stroke="' + lineColor +
      '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />' +
      crosshair +
      dot;

    // Wire hover
    const tooltip = document.getElementById("tooltip");
    const crosshairEl = document.getElementById("crosshair");
    const dotEl = document.getElementById("crosshair-dot");
    const wrap = document.querySelector(".chart-wrap");
    const rect = wrap.getBoundingClientRect();

    svg.addEventListener("mousemove", (ev) => {
      const rect = svg.getBoundingClientRect();
      const xPx = ev.clientX - rect.left;
      const ratio = xPx / rect.width;
      const idx = Math.max(0, Math.min(data.length - 1, Math.floor(ratio * data.length)));
      const point = data[idx];
      const svgX = xScale(idx);
      const svgY = yScale(point.p);
      // Convert SVG coords to pixel coords (viewBox is 800x240)
      const pxX = (svgX / W) * rect.width;
      const pxY = (svgY / H) * rect.height;
      crosshairEl.setAttribute("x1", svgX);
      crosshairEl.setAttribute("x2", svgX);
      crosshairEl.setAttribute("visibility", "visible");
      dotEl.setAttribute("cx", svgX);
      dotEl.setAttribute("cy", svgY);
      dotEl.setAttribute("visibility", "visible");
      tooltip.hidden = false;
      tooltip.style.left = pxX + "px";
      tooltip.style.top = (pxY - 12) + "px";
      tooltip.innerHTML =
        '<div class="tooltip-time">' + formatTime(point.t, rangeId) + "</div>" +
        '<div class="tooltip-price">' + formatPrice(point.p) + " " + currentToSymbol + "</div>";
    });
    svg.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
      crosshairEl.setAttribute("visibility", "hidden");
      dotEl.setAttribute("visibility", "hidden");
    });
  }

  // ─── State ─────────────────────────────────────────────────────────────
  let currentPair = "QFS-USDC";
  let currentRange = "1h";
  let currentToSymbol = "USDC";

  function render() {
    const [from, to] = currentPair.split("-");
    const fromPrice = PRICES[from] || 1;
    const toPrice = PRICES[to] || 1;
    const ratio = toPrice > 0 ? fromPrice / toPrice : 0;
    currentToSymbol = to;

    const range = RANGES[currentRange];
    const pairKey = currentPair + "-" + currentRange;
    const data = generateSeries(pairKey, range, ratio);

    const first = data[0].p;
    const last = data[data.length - 1].p;
    const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
    const isUp = changePct >= 0;

    // Update header
    document.getElementById("pair-label").textContent = from + "/" + to;
    document.getElementById("price-current").textContent = formatPrice(last);
    const changeEl = document.getElementById("price-change");
    changeEl.textContent = (isUp ? "▲ +" : "▼ ") + changePct.toFixed(2) + "%";
    changeEl.className = "change " + (isUp ? "up" : "down");

    // Update stats
    const min = Math.min.apply(null, data.map((d) => d.p));
    const max = Math.max.apply(null, data.map((d) => d.p));
    document.getElementById("stat-min").textContent = formatPrice(min);
    document.getElementById("stat-max").textContent = formatPrice(max);
    document.getElementById("stat-vol").textContent =
      (Math.abs(changePct) * 0.6).toFixed(2) + "%";

    // Render chart
    renderChart(data, isUp, currentRange);
  }

  // ─── Wire up controls ──────────────────────────────────────────────────
  document.getElementById("pair-select").addEventListener("change", (ev) => {
    currentPair = ev.target.value;
    render();
  });
  document.querySelectorAll("#range-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#range-tabs button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentRange = btn.getAttribute("data-range");
      render();
    });
  });

  // Initial render
  render();
})();
