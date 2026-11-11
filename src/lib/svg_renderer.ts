import type { CanvaTextBox, NumberLineSettings, NumberLineVisualData } from "./types";

export interface RenderSvgOptions {
  visual: NumberLineVisualData;
  settings: NumberLineSettings;
  separateText?: boolean; // If true, omit text elements from SVG and return them separately
  width?: number;
  height?: number;
}

export interface RenderSvgResult {
  svg: string;
  textBoxes: CanvaTextBox[];
  width: number;
  height: number;
}

export function renderNumberLineSvg(options: RenderSvgOptions): RenderSvgResult {
  const { visual, settings, separateText = false } = options;
  const isOps = visual.topic === "integers_ops" && visual.jumps && visual.jumps.length > 0;
  const width = options.width || 800;
  const height = options.height || (isOps ? 300 : 200);

  const textBoxes: CanvaTextBox[] = [];

  // Determine actual min, max, step
  const min = settings.autoScale ? visual.min : settings.manualMin;
  const max = settings.autoScale ? visual.max : settings.manualMax;
  const step = settings.autoScale ? visual.step : Math.max(1, settings.manualStep);

  const range = Math.max(1, max - min);

  // Coordinate mapping
  const marginX = 60;
  const plotWidth = width - marginX * 2;
  const axisY = isOps ? 190 : 115;

  const toX = (val: number): number => {
    return marginX + ((val - min) / range) * plotWidth;
  };

  const axisColor = settings.axisColor;
  const solColor = settings.solutionColor;
  const fontFamily = settings.fontFamily || "sans-serif";

  // Build SVG elements
  const svgElements: string[] = [];

  // 1. Background
  if (settings.backgroundMode === "color") {
    svgElements.push(
      `<rect width="${width}" height="${height}" fill="${settings.backgroundColor}" rx="8" />`
    );
  } else if (settings.backgroundMode === "white") {
    svgElements.push(
      `<rect width="${width}" height="${height}" fill="#ffffff" rx="8" />`
    );
  } // transparent leaves no rect

  // 2. Title / Equation on top (if enabled)
  if (settings.showTitle && visual.title) {
    const titleText = settings.worksheetMode
      ? visual.worksheetFormula || visual.title
      : visual.title;

    if (separateText) {
      textBoxes.push({
        text: titleText,
        x: width / 2,
        y: 20,
        width: width - 40,
        height: 36,
        fontSize: 20,
        fontWeight: "bold",
        align: "center",
        color: axisColor,
      });
    } else {
      svgElements.push(
        `<text x="${width / 2}" y="36" font-family="${fontFamily}" font-size="20" font-weight="bold" fill="${axisColor}" text-anchor="middle">${titleText}</text>`
      );
    }
  }

  // Defs for markers (arrows)
  const defs = `
    <defs>
      <marker id="arrow-axis-end" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${axisColor}" />
      </marker>
      <marker id="arrow-axis-start" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="${axisColor}" />
      </marker>
      <marker id="arrow-jump" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${solColor}" />
      </marker>
      <marker id="arrow-jump-left" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="${solColor}" />
      </marker>
      <marker id="arrow-interval-right" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${solColor}" />
      </marker>
      <marker id="arrow-interval-left" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="${solColor}" />
      </marker>
    </defs>
  `;
  svgElements.push(defs);

  // 3. Axis line with start and end arrows
  const axisStartX = marginX - 25;
  const axisEndX = width - marginX + 25;
  svgElements.push(
    `<line x1="${axisStartX}" y1="${axisY}" x2="${axisEndX}" y2="${axisY}" stroke="${axisColor}" stroke-width="3" stroke-linecap="round" marker-start="url(#arrow-axis-start)" marker-end="url(#arrow-axis-end)" />`
  );

  // 4. Axis ticks and number labels
  const tickStartY = axisY - 8;
  const tickEndY = axisY + 8;

  // Generate tick values from min to max
  const tickValues: number[] = [];
  const firstTick = Math.ceil(min / step) * step;
  for (let t = firstTick; t <= max; t += step) {
    tickValues.push(t);
  }

  tickValues.forEach((val) => {
    const x = toX(val);
    if (x >= marginX - 5 && x <= width - marginX + 5) {
      svgElements.push(
        `<line x1="${x}" y1="${tickStartY}" x2="${x}" y2="${tickEndY}" stroke="${axisColor}" stroke-width="2" />`
      );

      const labelStr = val.toString().replace(/-/g, "−");
      if (separateText) {
        textBoxes.push({
          text: labelStr,
          x,
          y: axisY + 12,
          width: 50,
          height: 24,
          fontSize: 14,
          align: "center",
          color: axisColor,
        });
      } else {
        svgElements.push(
          `<text x="${x}" y="${axisY + 28}" font-family="${fontFamily}" font-size="14" fill="${axisColor}" text-anchor="middle">${labelStr}</text>`
        );
      }
    }
  });

  // 5. Worksheet mode check for hiding solutions
  const hideAnswer = settings.worksheetMode;

  // 6. Intervals for inequalities
  if (!hideAnswer && visual.intervals && visual.intervals.length > 0) {
    visual.intervals.forEach((interval) => {
      let x1 = interval.from !== undefined ? toX(interval.from) : marginX - 20;
      let x2 = interval.to !== undefined ? toX(interval.to) : width - marginX + 20;

      // Ensure x1 <= x2
      if (x1 > x2) {
        const temp = x1;
        x1 = x2;
        x2 = temp;
      }

      // Shaded line / interval ray
      const markerStart =
        interval.from === undefined ? `marker-start="url(#arrow-interval-left)"` : "";
      const markerEnd =
        interval.to === undefined ? `marker-end="url(#arrow-interval-right)"` : "";

      svgElements.push(
        `<line x1="${x1}" y1="${axisY}" x2="${x2}" y2="${axisY}" stroke="${solColor}" stroke-width="7" stroke-linecap="round" opacity="0.8" ${markerStart} ${markerEnd} />`
      );
    });
  }

  // 7. Jumps for integer operations
  if (!hideAnswer && visual.topic === "integers_ops" && visual.jumps.length > 0) {
    visual.jumps.forEach((jump) => {
      const xFrom = toX(jump.from);
      const xTo = toX(jump.to);
      const level = jump.level;
      const jumpHeight = 36 + (level - 1) * 32;
      const apexY = axisY - jumpHeight;

      // Dashed projection line from toX to axis
      svgElements.push(
        `<line x1="${xTo}" y1="${axisY}" x2="${xTo}" y2="${apexY}" stroke="${axisColor}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" />`
      );
      if (level === 1) {
        // From 0 dashed line
        svgElements.push(
          `<line x1="${xFrom}" y1="${axisY}" x2="${xFrom}" y2="${apexY}" stroke="${axisColor}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" />`
        );
      }

      // Curved jump arc
      // Bezier curve: M from,axisY C from,apexY to,apexY to,axisY
      // or quadratic curve
      const isRight = xTo >= xFrom;
      const marker = isRight ? `marker-end="url(#arrow-jump)"` : `marker-end="url(#arrow-jump-left)"`;

      const path = `M ${xFrom} ${axisY} Q ${(xFrom + xTo) / 2} ${apexY - 10} ${xTo} ${axisY}`;
      svgElements.push(
        `<path d="${path}" fill="none" stroke="${solColor}" stroke-width="3" ${marker} />`
      );

      // Label above arc
      const labelX = (xFrom + xTo) / 2;
      const labelY = apexY - 14;
      if (settings.showLabels) {
        if (separateText) {
          textBoxes.push({
            text: jump.label,
            x: labelX,
            y: labelY - 12,
            width: 60,
            height: 20,
            fontSize: 13,
            fontWeight: "bold",
            align: "center",
            color: solColor,
          });
        } else {
          svgElements.push(
            `<text x="${labelX}" y="${labelY}" font-family="${fontFamily}" font-size="13" font-weight="bold" fill="${solColor}" text-anchor="middle">${jump.label}</text>`
          );
        }
      }
    });
  }

  // 8. Points (dots) on number line
  if (!hideAnswer && visual.points && visual.points.length > 0) {
    visual.points.forEach((pt) => {
      const x = toX(pt.value);
      if (x >= marginX - 15 && x <= width - marginX + 15) {
        const dotRadius = 6;
        const ptColor = pt.color || solColor;
        const fill =
          pt.filled !== false
            ? ptColor
            : settings.backgroundMode === "color"
            ? settings.backgroundColor
            : "#ffffff";

        svgElements.push(
          `<circle cx="${x}" cy="${axisY}" r="${dotRadius}" fill="${fill}" stroke="${ptColor}" stroke-width="2.5" />`
        );

        // Value label above or below point if enabled
        if (settings.showLabels && pt.label && visual.topic !== "integers_ops") {
          const lblY = axisY - 14;
          if (separateText) {
            textBoxes.push({
              text: pt.label,
              x,
              y: lblY - 14,
              width: 50,
              height: 20,
              fontSize: 13,
              fontWeight: "bold",
              align: "center",
              color: ptColor,
            });
          } else {
            svgElements.push(
              `<text x="${x}" y="${lblY}" font-family="${fontFamily}" font-size="13" font-weight="bold" fill="${ptColor}" text-anchor="middle">${pt.label}</text>`
            );
          }
        }
      }
    });
  }

  // 9. Bottom solution formula / worksheet formula
  if (settings.showLabels) {
    const bottomFormula = hideAnswer
      ? visual.worksheetFormula || "……"
      : visual.solutionFormula || "";

    if (bottomFormula) {
      const bottomY = height - 25;
      if (separateText) {
        textBoxes.push({
          text: bottomFormula,
          x: width / 2,
          y: bottomY - 15,
          width: width - 40,
          height: 30,
          fontSize: 16,
          fontWeight: "bold",
          align: "center",
          color: axisColor,
        });
      } else {
        svgElements.push(
          `<text x="${width / 2}" y="${bottomY}" font-family="${fontFamily}" font-size="16" font-weight="bold" fill="${axisColor}" text-anchor="middle">${bottomFormula}</text>`
        );
      }
    }
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="width: 100%; height: auto; max-width: 100%; display: block;">
      ${svgElements.join("\n")}
    </svg>
  `.trim();

  return {
    svg: svgContent,
    textBoxes,
    width,
    height,
  };
}
