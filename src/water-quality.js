/* ===================================
   SmartFarm AI — Water Quality Page
   Design: matches Home.css Deep Ocean
   Mobile-first, production-grade
   =================================== */

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap');

:root {
  --ink:         #0d1b2a;
  --ink-soft:    #1e3a5f;
  --teal-deep:   #0a6b5c;
  --teal:        #0d9488;
  --teal-bright: #14b8a6;
  --teal-glow:   #5eead4;
  --teal-pale:   #ccfbf1;
  --sky:         #38bdf8;
  --amber:       #f59e0b;
  --rose:        #f43f5e;
  --green:       #22c55e;

  --bg:          #f0faf8;
  --surface:     #ffffff;
  --border:      #d1faf4;
  --border-soft: #e6f7f5;

  --text:        #0d1b2a;
  --text-2:      #334e5e;
  --text-muted:  #6b8fa3;

  --shadow-card: 0 2px 12px rgba(13,27,42,0.07);
  --shadow-md:   0 4px 20px rgba(13,155,136,0.10);

  --radius-sm:   12px;
  --radius-md:   18px;
  --radius-lg:   24px;
  --radius-pill: 999px;

  --font-display: 'Outfit', sans-serif;
  --font-body:    'Noto Sans Thai', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }

body {
  background: var(--bg);
  font-family: var(--font-body);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* ─── Page shell ─────────────────────────────────────────────────────────────── */
.wq-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ─── Header (matches Home header) ──────────────────────────────────────────── */
.wq-header {
  background: var(--ink);
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.wq-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.wq-back-btn {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.wq-back-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

.wq-page-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Device selector in header */
.wq-device-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--radius-pill);
  padding: 7px 14px;
  flex-shrink: 0;
  transition: background 0.2s;
}
.wq-device-pill:hover { background: rgba(255,255,255,0.15); }

.wq-device-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--teal-glow);
  box-shadow: 0 0 5px var(--teal-glow);
  animation: pulse-dot 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse-dot {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.5; transform:scale(0.85); }
}

.wq-device-select {
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  outline: none;
  cursor: pointer;
  appearance: none;
  max-width: 120px;
}
.wq-device-select option { background: var(--ink); color: #fff; }

/* ─── Body ───────────────────────────────────────────────────────────────────── */
.wq-body {
  flex: 1;
  padding: 20px 16px 40px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* ─── Section label (same as Home) ──────────────────────────────────────────── */
.wq-section-label {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 12px;
  margin-top: 24px;
  padding-left: 2px;
}
.wq-section-label:first-child { margin-top: 0; }

/* ─── Error banner ───────────────────────────────────────────────────────────── */
.wq-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff1f3;
  border: 1px solid #fecdd3;
  color: var(--rose);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}

/* ─── Stat cards (mini, 4-up) ────────────────────────────────────────────────── */
.wq-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
@media (min-width: 480px) {
  .wq-stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.wq-stat-card {
  background: var(--surface);
  border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 14px 12px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.wq-stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.wq-stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 14px; bottom: 14px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: #e2e8f0;
}
.wq-stat-card.ok::before   { background: var(--green); }
.wq-stat-card.warn::before { background: var(--amber); }
.wq-stat-card.bad::before  { background: var(--rose); }
.wq-stat-card.warn { background: #fffdf7; border-color: rgba(245,158,11,0.2); }
.wq-stat-card.bad  { background: #fff6f8; border-color: rgba(244,63,94,0.15); }
.wq-stat-card.ok   { border-color: rgba(34,197,94,0.15); }

.wq-stat-lbl {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}
.wq-stat-val {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1px;
  line-height: 1;
}
.wq-stat-unit { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-left: 2px; }
.wq-stat-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  margin-top: 6px;
  background: #f1f5f9;
  color: var(--text-muted);
}
.wq-stat-card.ok   .wq-stat-badge { background: #dcfce7; color: #166534; }
.wq-stat-card.warn .wq-stat-badge { background: #fef9c3; color: #854d0e; }
.wq-stat-card.bad  .wq-stat-badge { background: #ffe4e6; color: #9f1239; }

/* ─── Range toggle (all / day) ───────────────────────────────────────────────── */
.wq-range-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.wq-range-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-soft);
  background: var(--surface);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s;
  -webkit-tap-highlight-color: transparent;
}

.wq-range-btn:hover {
  border-color: var(--teal-bright);
  color: var(--teal);
  background: var(--teal-pale);
}

.wq-range-btn.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
  box-shadow: 0 4px 14px rgba(13,27,42,0.2);
}

/* ─── Calendar ───────────────────────────────────────────────────────────────── */
.wq-cal-box {
  background: var(--surface);
  border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 14px 14px 10px;
  box-shadow: var(--shadow-card);
  /* Cap width so cells never grow too tall on wide screens */
  max-width: 420px;
}

.wq-cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.wq-cal-month {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.wq-cal-arrow {
  width: 28px; height: 28px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.wq-cal-arrow:hover { background: var(--teal-pale); color: var(--teal); border-color: var(--teal-bright); }

.wq-cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 2px;
}
.wq-cal-wday {
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  padding: 2px 0 4px;
  font-family: var(--font-display);
}

.wq-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

/* Fixed height cells — no aspect-ratio which causes tall cells on wide screens */
.wq-cal-day {
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.wq-cal-day:hover:not(.empty):not(.future) { background: var(--teal-pale); border-color: var(--teal-bright); }

.wq-cal-day .dn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
}
.wq-cal-day.empty { cursor: default; }
.wq-cal-day.future .dn { color: #c8d8e4; }
.wq-cal-day.future { cursor: default; }

/* dot indicator */
.wq-cal-day .ddot {
  width: 4px; height: 4px;
  border-radius: 50%;
  margin-top: 2px;
}
.wq-cal-day.has-ok   .ddot { background: var(--green); }
.wq-cal-day.has-warn .ddot { background: var(--amber); }
.wq-cal-day.has-bad  .ddot { background: var(--rose); }

/* selected */
.wq-cal-day.selected {
  background: var(--teal);
  border-color: var(--teal-deep);
}
.wq-cal-day.selected .dn { color: #fff; }
.wq-cal-day.selected .ddot { background: rgba(255,255,255,0.7); }

/* today (not selected) */
.wq-cal-day.today:not(.selected) {
  border-color: var(--teal-bright);
  background: var(--teal-pale);
}
.wq-cal-day.today:not(.selected) .dn { color: var(--teal-deep); }

/* ─── Analysis box ───────────────────────────────────────────────────────────── */
.wq-analysis {
  background: var(--surface);
  border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 20px 18px;
  box-shadow: var(--shadow-card);
}

/* Tab bar */
.wq-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  padding: 4px;
  border-radius: var(--radius-sm);
  width: fit-content;
  margin-bottom: 20px;
}

.wq-tab {
  padding: 7px 16px;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s;
  -webkit-tap-highlight-color: transparent;
}
.wq-tab.active {
  background: var(--surface);
  color: var(--teal);
  box-shadow: var(--shadow-card);
}

/* Param select */
.wq-param-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}
.wq-param-select {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.wq-param-select:focus { border-color: var(--teal-bright); }

.wq-chart-wrap { height: 280px; width: 100%; }

/* ─── Table ──────────────────────────────────────────────────────────────────── */
.wq-table-wrap {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  overflow: auto;
  max-height: 460px;
}

.wq-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}

.wq-table th, .wq-table td {
  padding: 11px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border-soft);
  font-size: 13px;
}

.wq-table th {
  background: var(--bg);
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 5;
}

.wq-table tr:last-child td { border-bottom: none; }
.wq-table tbody tr:hover { background: var(--bg); }

.wq-alert-chip {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  margin: 1px 2px;
}
.wq-chip-ok   { background: #dcfce7; color: #166534; }
.wq-chip-warn { background: #fef9c3; color: #854d0e; }
.wq-chip-bad  { background: #ffe4e6; color: #9f1239; }

/* ─── Pagination ─────────────────────────────────────────────────────────────── */
.wq-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 2px 0;
  border-top: 1px solid var(--border-soft);
  margin-top: 8px;
}
.wq-page-info {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.wq-page-btns { display: flex; gap: 6px; }
.wq-page-btn {
  width: 32px; height: 32px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.wq-page-btn:hover:not(:disabled) { background: var(--teal-pale); border-color: var(--teal-bright); color: var(--teal); }
.wq-page-btn:disabled { opacity: 0.35; cursor: default; }

/* ─── Empty / loading state ─────────────────────────────────────────────────── */
.wq-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-muted);
  gap: 10px;
  font-size: 14px;
}
.wq-empty-icon { font-size: 36px; }

/* ─── Responsive ─────────────────────────────────────────────────────────────── */
@media (min-width: 480px) {
  .wq-body { padding: 24px 24px 48px; }
}
@media (min-width: 680px) {
  .wq-body { max-width: 860px; }
  .wq-device-select { max-width: 180px; }
}
@media (max-width: 400px) {
  .wq-cal-day .dn { font-size: 11px; }
  .wq-cal-day .ddot { width: 4px; height: 4px; }
  .wq-header { padding: 0 14px; }
  .wq-page-title { font-size: 15px; }
}
