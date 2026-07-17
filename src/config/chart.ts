export const CHART_MARGIN = { top: 20, right: 50, bottom: 40, left: 50 };
export const CONTENT_MAX_WIDTH = 920;

// Horizontal padding + border of DayLengthChart's .panel (src/viz/DayLengthChart.module.css) — kept
// as a JS constant so the SVG width can be sized to fit exactly inside it. Update both together.
export const CHART_PANEL_INSET = 16 * 2 + 1 * 2;