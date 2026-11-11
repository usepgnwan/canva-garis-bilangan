import type { CanvaTextBox } from "./types";

export interface CanvaTextElementConfig {
  type: "text";
  children: string[];
  top: number;
  left: number;
  width: number;
  color?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "start" | "center" | "end";
}

/**
 * Transforms layout text boxes into Canva app element text configs.
 */
export function layoutTextBoxes(
  textBoxes: CanvaTextBox[],
  scaleRatio = 1
): CanvaTextElementConfig[] {
  return textBoxes.map((tb) => {
    let left = tb.x;
    if (tb.align === "center") {
      left = tb.x - tb.width / 2;
    } else if (tb.align === "right") {
      left = tb.x - tb.width;
    }

    const fontSize = Math.round((tb.fontSize || 14) * scaleRatio);
    const top = Math.round(tb.y * scaleRatio);
    const scaledLeft = Math.round(left * scaleRatio);
    const scaledWidth = Math.round(tb.width * scaleRatio);

    return {
      type: "text",
      children: [tb.text],
      top,
      left: scaledLeft,
      width: scaledWidth,
      color: tb.color,
      fontSize,
      fontWeight: tb.fontWeight,
      textAlign: tb.align === "center" ? "center" : tb.align === "right" ? "end" : "start",
    };
  });
}
