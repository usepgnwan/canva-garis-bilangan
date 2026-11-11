import type { FontRef, ImageRef} from "@canva/asset";
import { upload } from "@canva/asset";
import type {
  AppElementClient,
  GroupContentAtPoint} from "@canva/design";
import {
  addElementAtCursor,
  addElementAtPoint,
  initAppElement,
} from "@canva/design";
import { layoutTextBoxes } from "./lib/canva_text";
import { detectTopicFromInput } from "./lib/detection";
import type { CanvaTextBox, NumberLineSettings, Topic } from "./lib/types";

export const DATA_VERSION = 2;
export const MAX_DATA_BYTES = 5120; // 5 KB

export interface NumberLineData extends Record<string, any> {
  version: number;
  topic: Topic;
  input: string;
  imageRef: ImageRef;
  width: number;
  height: number;
  settings: NumberLineSettings;
  textBoxes?: CanvaTextBox[];
  canvaFontRef?: FontRef;
  altText: string;
}

export type SelectedAppElement = {
  data: NumberLineData;
  version: number;
  update(options: { data: NumberLineData }): Promise<void>;
};

/**
 * Builds the elements array for an app element.
 * Pure function: depends only on data.
 */
export function buildNumberLineContent(data: NumberLineData): GroupContentAtPoint[] {
  const content: GroupContentAtPoint[] = [
    {
      type: "image",
      ref: data.imageRef,
      top: 0,
      left: 0,
      width: data.width,
      height: data.height,
      altText: {
        text: data.altText || "Number line",
        decorative: false,
      },
    },
  ];

  // If Canva font is used with separate text boxes
  if (data.textBoxes && data.textBoxes.length > 0) {
    const textElements = layoutTextBoxes(data.textBoxes);
    textElements.forEach((te) => {
      content.push({
        type: "text",
        children: te.children,
        top: te.top,
        left: te.left,
        width: te.width,
      });
    });
  }

  return content;
}

let appElementClientInstance: AppElementClient<NumberLineData> | null = null;

export function resetAppElementClientForTesting(): void {
  appElementClientInstance = null;
}

export function getAppElementClient(): AppElementClient<NumberLineData> {
  if (!appElementClientInstance) {
    appElementClientInstance = initAppElement<NumberLineData>({
      render: buildNumberLineContent,
    });
  }
  return appElementClientInstance;
}

/**
 * Validates that JSON data size is under 5 KB
 */
export function validateDataSize(data: NumberLineData): boolean {
  const str = JSON.stringify(data);
  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(str).length
      : typeof Buffer !== "undefined"
      ? Buffer.from(str, "utf8").length
      : str.length;
  return bytes <= MAX_DATA_BYTES;
}

/**
 * Backwards compatibility loader for version 1 and version 2 data
 */
export function loadCompatibleData(raw: Partial<NumberLineData>): {
  topic: Topic;
  input: string;
  settings: Partial<NumberLineSettings>;
} {
  const input = raw.input || "";
  const topic: Topic = raw.topic || detectTopicFromInput(input);

  const defaultSettings: Partial<NumberLineSettings> = {
    topic,
    autoScale: true,
    manualMin: -10,
    manualMax: 10,
    manualStep: 1,
    solutionColor: "#3B82F6",
    axisColor: "#333333",
    backgroundMode: "white",
    backgroundColor: "#FDFBF7",
    fontFamily: "Arial, sans-serif",
    showSteps: true,
    showLabels: true,
    showTitle: true,
    universe: "real",
    worksheetMode: false,
  };

  const settings = {
    ...defaultSettings,
    ...(raw.settings || {}),
  };

  return {
    topic,
    input,
    settings,
  };
}

/**
 * Converts SVG string to PNG data URL at 3x resolution using HTML Canvas
 */
export async function renderSvgToPng3x(
  svgString: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    // In node/jest test environments without real image rendering, mock fallback
    if (typeof Image === "undefined" || typeof document === "undefined") {
      resolve(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      );
      return;
    }

    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      // jsdom environment fallback
    }

    if (!ctx) {
      resolve(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      );
      return;
    }

    // Scale drawing context for 3x sharpness
    ctx.scale(scale, scale);

    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      try {
        const pngDataUrl = canvas.toDataURL("image/png");
        resolve(pngDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG into Image: " + e));
    };

    img.src = url;
  });
}

/**
 * Uploads PNG data to Canva media library via private asset upload
 */
export async function uploadPngAsset(pngDataUrl: string): Promise<ImageRef> {
  const result = await upload({
    type: "image",
    mimeType: "image/png",
    url: pngDataUrl,
    thumbnailUrl: pngDataUrl,
    aiDisclosure: "none",
  });

  return result.ref;
}

/**
 * Fallback insertion as standard image when app element is not supported
 */
export async function insertAsPlainImage(
  imageRef: ImageRef,
  isSupported?: (fn: any) => boolean
): Promise<boolean> {
  const addFn = [addElementAtPoint, addElementAtCursor].find((fn) =>
    isSupported ? isSupported(fn) : true
  );

  if (!addFn) return false;

  await addFn({
    type: "image",
    ref: imageRef,
    altText: {
      text: "Number line image",
      decorative: false,
    },
  });
  return true;
}

/**
 * Inserts solution steps as text element into Canva canvas
 */
export async function insertStepsAsText(
  stepsText: string,
  isSupported?: (fn: any) => boolean
): Promise<boolean> {
  const addFn = [addElementAtPoint, addElementAtCursor].find((fn) =>
    isSupported ? isSupported(fn) : true
  );

  if (!addFn) return false;

  await addFn({
    type: "text",
    children: [stepsText],
  });
  return true;
}
