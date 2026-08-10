function buildSessionSeries(sets) {
  const byDate = {};
  sets.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = { date: s.date, maxWeight: null, maxReps: null };
    if (s.weight !== null && (byDate[s.date].maxWeight === null || s.weight > byDate[s.date].maxWeight)) {
      byDate[s.date].maxWeight = s.weight;
    }
    if (s.reps !== null && (byDate[s.date].maxReps === null || s.reps > byDate[s.date].maxReps)) {
      byDate[s.date].maxReps = s.reps;
    }
  });
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

function formatShortDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildLineSvg(points, key) {
  const width = 300;
  const height = 140;
  const padX = 24;
  const padY = 24;

  const values = points.map((p) => p[key]);
  let minV = Math.min(...values);
  let maxV = Math.max(...values);
  if (minV === maxV) {
    minV -= 1;
    maxV += 1;
  }

  const stepX = (width - padX * 2) / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: padX + stepX * i,
    y: height - padY - ((p[key] - minV) / (maxV - minV)) * (height - padY * 2),
    value: p[key],
    date: p.date,
  }));

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const dots = coords.map((c) => `<circle cx="${c.x}" cy="${c.y}" r="3.5" fill="var(--accent)" />`).join("");

  const first = coords[0];
  const last = coords[coords.length - 1];

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="none">
      <polyline points="${polylinePoints}" fill="none" stroke="var(--accent)" stroke-width="2" />
      ${dots}
      <text x="${last.x}" y="${last.y - 8}" font-size="11" fill="var(--text)" text-anchor="end" font-weight="700">${last.value}</text>
      <text x="${first.x}" y="${height - 6}" font-size="9" fill="var(--text-secondary)" text-anchor="start">${formatShortDate(first.date)}</text>
      <text x="${last.x}" y="${height - 6}" font-size="9" fill="var(--text-secondary)" text-anchor="end">${formatShortDate(last.date)}</text>
    </svg>
  `;
}

function buildChartBlock(title, series, key) {
  const wrap = document.createElement("div");
  wrap.className = "chart-card";

  const heading = document.createElement("h3");
  heading.className = "chart-title";
  heading.textContent = title;
  wrap.appendChild(heading);

  const points = series.filter((p) => p[key] !== null);

  if (points.length < 2) {
    const msg = document.createElement("p");
    msg.className = "chart-empty";
    msg.textContent = points.length === 0 ? "No data yet." : "Log one more session to see a trend.";
    wrap.appendChild(msg);
    return wrap;
  }

  wrap.innerHTML += buildLineSvg(points, key);
  return wrap;
}

function renderProgressCharts(container, sets) {
  const series = buildSessionSeries(sets);

  const section = document.createElement("div");
  section.className = "charts-section";
  section.appendChild(buildChartBlock("Weight Progress", series, "maxWeight"));
  section.appendChild(buildChartBlock("Reps Progress", series, "maxReps"));

  container.appendChild(section);
}
