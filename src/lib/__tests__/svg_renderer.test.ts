import { solveIntegersOps } from "../integers";
import { renderNumberLineSvg } from "../svg_renderer";
import type { NumberLineSettings } from "../types";

describe("SVG Renderer Tests", () => {
  const defaultSettings: NumberLineSettings = {
    topic: "integers_ops",
    autoScale: true,
    manualMin: -10,
    manualMax: 10,
    manualStep: 1,
    solutionColor: "#3B82F6",
    axisColor: "#333333",
    backgroundMode: "white",
    backgroundColor: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
    showSteps: true,
    showLabels: true,
    showTitle: true,
    universe: "real",
    worksheetMode: false,
  };

  it("should render SVG with axis, ticks and jumps", () => {
    const res = solveIntegersOps("-3 + 5");
    const { svg, textBoxes } = renderNumberLineSvg({
      visual: res.visual,
      settings: defaultSettings,
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("<line");
    expect(svg).toContain("<path"); // Jump arc
    expect(textBoxes).toHaveLength(0); // Text is inside SVG
  });

  it("should separate text when separateText is true", () => {
    const res = solveIntegersOps("-3 + 5");
    const { svg, textBoxes } = renderNumberLineSvg({
      visual: res.visual,
      settings: defaultSettings,
      separateText: true,
    });

    expect(textBoxes.length).toBeGreaterThan(0);
    // SVG should not contain label text directly
    expect(svg).not.toContain(`<text`);
  });

  it("should hide solution when worksheet mode is active", () => {
    const res = solveIntegersOps("-3 + 5");
    const worksheetSettings = { ...defaultSettings, worksheetMode: true };
    const { svg } = renderNumberLineSvg({
      visual: res.visual,
      settings: worksheetSettings,
    });

    // Jumps should be hidden
    expect(svg).not.toContain("marker-jump");
    expect(svg).toContain("……");
  });
});
