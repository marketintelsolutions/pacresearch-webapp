// Validated categorical palette (dataviz skill, light surface #ffffff).
// Worst adjacent CVD ΔE 21.6 (tritan) — well clear of the ≥12 target.
// Aqua/yellow sit below 3:1 contrast, so every chart ships visible labels.
export const CHART = {
  // categorical slots, in fixed order (never cycle past the end)
  blue: "#2a78d6",
  aqua: "#1baf7a",
  yellow: "#eda100",
  red: "#e34948",
  violet: "#4a3aa7",

  // ink & chrome (text wears text tokens, never a series color)
  ink: "#15284A", // brand navy, used for primary chart text
  secondaryInk: "#52514e",
  muted: "#898781",
  grid: "#e6e8ee",
  axis: "#c3c2b7",
  surface: "#ffffff",
};

// Fixed categorical order for multi-series charts.
export const CATEGORICAL = [
  CHART.blue,
  CHART.aqua,
  CHART.yellow,
  CHART.red,
  CHART.violet,
];

// Brand colour reserved for Ziltch1 across the admin graphs.
export const ZILTCH1_COLOR = "rgb(242, 104, 54)";

// Shared recharts axis/tick styling.
export const axisTick = { fill: CHART.muted, fontSize: 12 };
export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: "0",
  vertical: false,
};
