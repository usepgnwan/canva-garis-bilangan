import type { Fraction } from "./fraction";

export class MathError extends Error {
  readonly code: string;
  readonly params?: Record<string, string | number>;

  constructor(code: string, params?: Record<string, string | number>) {
    super(code);
    this.name = "MathError";
    this.code = code;
    this.params = params;
  }
}

export type Topic =
  | "integers_ops"
  | "integers_order"
  | "linear_eq"
  | "linear_ineq";

export type Universe = "real" | "integer";

export type BackgroundMode = "white" | "transparent" | "color";

export interface MathStep {
  code: string;
  params: Record<string, string | number>;
  flip?: boolean;
}

export interface IntegerJump {
  from: number;
  to: number;
  delta: number;
  level: number;
  label: string;
}

export interface NumberLinePoint {
  value: number;
  label?: string;
  filled?: boolean; // true = solid dot, false = open circle
  color?: string;
}

export interface NumberLineInterval {
  from?: number; // undefined means -Infinity
  to?: number;   // undefined means +Infinity
  fromInclusive?: boolean;
  toInclusive?: boolean;
  color?: string;
}

export interface NumberLineVisualData {
  topic: Topic;
  min: number;
  max: number;
  step: number;
  points: NumberLinePoint[];
  intervals: NumberLineInterval[];
  jumps: IntegerJump[];
  title?: string;
  solutionFormula?: string;
  worksheetFormula?: string;
  altText: string;
  worksheetAltText: string;
}

export interface IntegersOpsResult {
  numbers: number[];
  rewrittenNumbers: number[];
  jumps: IntegerJump[];
  finalResult: number;
  equationString: string;
  steps: MathStep[];
  visual: NumberLineVisualData;
}

export interface IntegersOrderResult {
  numbers: number[];
  sortedAsc: number[];
  sortedDesc: number[];
  ascString: string;
  descString: string;
  steps: MathStep[];
  visual: NumberLineVisualData;
}

export interface AlgebraResult {
  variable: string;
  topic: "linear_eq" | "linear_ineq";
  universe: Universe;
  steps: MathStep[];
  isIdentity: boolean;
  isContradiction: boolean;
  solutionFraction?: Fraction;
  // For inequalities: interval representation
  intervals?: NumberLineInterval[];
  discretePoints?: number[];
  solutionSetString: string;
  worksheetSolutionSetString: string;
  visual: NumberLineVisualData;
}

export type CalculationResult =
  | { type: "integers_ops"; data: IntegersOpsResult }
  | { type: "integers_order"; data: IntegersOrderResult }
  | { type: "algebra"; data: AlgebraResult };

export interface NumberLineSettings {
  topic: Topic;
  autoScale: boolean;
  manualMin: number;
  manualMax: number;
  manualStep: number;
  solutionColor: string;
  axisColor: string;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  fontFamily: string;
  canvaFont?: {
    id: string;
    name: string;
  };
  showSteps: boolean;
  showLabels: boolean;
  showTitle: boolean;
  universe: Universe;
  worksheetMode: boolean;
}

export interface CanvaTextBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight?: "normal" | "bold";
  align?: "left" | "center" | "right";
  color?: string;
}
