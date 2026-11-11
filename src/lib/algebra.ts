import { Fraction } from "./fraction";
import { formatMinus, normalizeMinuses } from "./integers";
import type {
  AlgebraResult,
  MathStep,
  NumberLineInterval,
  NumberLinePoint,
  NumberLineVisualData,
  Universe,
} from "./types";
import { MathError } from "./types";

export type RelOp = "<" | "<=" | ">" | ">=" | "=";

export interface LinearTerm {
  coeff: Fraction; // coefficient of variable
  constant: Fraction; // constant term
}

/**
 * Parses a linear arithmetic expression into coeff * x + constant.
 * Handles implicit multiplication (e.g. 2x, 3(x-1)), fractions, decimals with comma.
 */
export function parseLinearExpression(
  exprStr: string,
  variable: string
): LinearTerm {
  let s = normalizeMinuses(exprStr).trim();
  // Replace comma decimal with dot
  s = s.replace(/(\d+),(\d+)/g, "$1.$2");
  // Replace multiplication symbols
  s = s.replace(/[\u00d7*]/g, "*");
  s = s.replace(/:/g, "/");

  // Tokenizer / recursive descent parser for linear expressions
  let pos = 0;

  function peek(): string {
    return pos < s.length ? (s[pos] ?? "") : "";
  }

  function get(): string {
    return pos < s.length ? (s[pos++] ?? "") : "";
  }

  function skipWhitespace() {
    while (pos < s.length && /\s/.test(s[pos] ?? "")) {
      pos++;
    }
  }

  function parsePrimary(): LinearTerm {
    skipWhitespace();
    const ch = peek();

    if (ch === "+") {
      get();
      return parsePrimary();
    }
    if (ch === "-") {
      get();
      const inner = parsePrimary();
      return {
        coeff: inner.coeff.negate(),
        constant: inner.constant.negate(),
      };
    }
    if (ch === "(") {
      get(); // '('
      const inner = parseAddSub();
      skipWhitespace();
      if (get() !== ")") {
        throw new MathError("errUnpairedParentheses");
      }
      return inner;
    }

    if (ch.toLowerCase() === variable.toLowerCase()) {
      get();
      return { coeff: new Fraction(1), constant: new Fraction(0) };
    }

    // Number (integer or decimal or fraction)
    let numStr = "";
    while (pos < s.length && /[0-9.]/.test(s[pos] ?? "")) {
      numStr += get();
    }

    if (!numStr) {
      throw new MathError("errInvalidExpression");
    }

    const val = Fraction.fromString(numStr);
    skipWhitespace();

    // Check if directly followed by variable (implicit mul: 2x)
    if (peek().toLowerCase() === variable.toLowerCase()) {
      get();
      return { coeff: val, constant: new Fraction(0) };
    }

    // Check if directly followed by '(' (implicit mul: 2(x+1))
    if (peek() === "(") {
      const paren = parsePrimary();
      return {
        coeff: paren.coeff.mul(val),
        constant: paren.constant.mul(val),
      };
    }

    return { coeff: new Fraction(0), constant: val };
  }

  function parseMulDiv(): LinearTerm {
    let left = parsePrimary();

    while (true) {
      skipWhitespace();
      const ch = peek();

      // Check for implicit multiplication: e.g. (x+1)(2) or 2(x+1)
      if (ch === "(" || ch.toLowerCase() === variable.toLowerCase()) {
        const right = parsePrimary();
        // Since we only support linear equations, at most one can have non-zero coeff!
        if (!left.coeff.isZero() && !right.coeff.isZero()) {
          throw new MathError("errNonLinear");
        }
        if (!left.coeff.isZero()) {
          left = {
            coeff: left.coeff.mul(right.constant),
            constant: left.constant.mul(right.constant),
          };
        } else {
          left = {
            coeff: right.coeff.mul(left.constant),
            constant: right.constant.mul(left.constant),
          };
        }
        continue;
      }

      if (ch === "*") {
        get();
        const right = parsePrimary();
        if (!left.coeff.isZero() && !right.coeff.isZero()) {
          throw new MathError("errNonLinear");
        }
        if (!left.coeff.isZero()) {
          left = {
            coeff: left.coeff.mul(right.constant),
            constant: left.constant.mul(right.constant),
          };
        } else {
          left = {
            coeff: right.coeff.mul(left.constant),
            constant: right.constant.mul(left.constant),
          };
        }
      } else if (ch === "/") {
        get();
        const right = parsePrimary();
        if (!right.coeff.isZero()) {
          throw new MathError("errVariableInDenominator");
        }
        if (right.constant.isZero()) {
          throw new MathError("errDivisionByZero");
        }
        left = {
          coeff: left.coeff.div(right.constant),
          constant: left.constant.div(right.constant),
        };
      } else {
        break;
      }
    }

    return left;
  }

  function parseAddSub(): LinearTerm {
    let left = parseMulDiv();

    while (true) {
      skipWhitespace();
      const ch = peek();
      if (ch === "+") {
        get();
        const right = parseMulDiv();
        left = {
          coeff: left.coeff.add(right.coeff),
          constant: left.constant.add(right.constant),
        };
      } else if (ch === "-") {
        get();
        const right = parseMulDiv();
        left = {
          coeff: left.coeff.sub(right.coeff),
          constant: left.constant.sub(right.constant),
        };
      } else {
        break;
      }
    }

    return left;
  }

  const result = parseAddSub();
  skipWhitespace();
  if (pos < s.length) {
    throw new MathError("errInvalidExpression");
  }

  return result;
}

export function detectVariable(input: string): string {
  const normalized = normalizeMinuses(input);
  const match = normalized.match(/[a-zA-Z]/);
  return match ? (match[0] ?? "x") : "x";
}

/**
 * Solves a single linear equation or inequality: LHS relOp RHS
 */
export function solveSingleLinear(
  lhsStr: string,
  relOp: RelOp,
  rhsStr: string,
  variable: string,
  stepsCollector: MathStep[]
): {
  variable: string;
  relOp: RelOp;
  value?: Fraction;
  isIdentity: boolean;
  isContradiction: boolean;
} {
  const lhs = parseLinearExpression(lhsStr, variable);
  const rhs = parseLinearExpression(rhsStr, variable);

  // Initial simplified form
  stepsCollector.push({
    code: "stepAlgebraInitial",
    params: {
      equation: `${formatMinus(lhsStr)} ${formatRelOp(relOp)} ${formatMinus(rhsStr)}`,
    },
  });

  // Collect variable to LHS: a*x + b relOp c*x + d => (a - c)*x relOp d - b
  const netCoeff = lhs.coeff.sub(rhs.coeff);
  const netConst = rhs.constant.sub(lhs.constant);

  // If both sides needed regrouping
  if (!lhs.coeff.equals(netCoeff) || !rhs.constant.equals(netConst)) {
    stepsCollector.push({
      code: "stepAlgebraCollectTerms",
      params: {
        varTerm: `${formatMinus(netCoeff.toFractionString())}${variable}`,
        constTerm: formatMinus(netConst.toFractionString()),
        relOp: formatRelOp(relOp),
      },
    });
  }

  // Check identity or contradiction
  if (netCoeff.isZero()) {
    const diff = netConst.toNumber();
    let isTrue = false;
    if (relOp === "=") isTrue = netConst.isZero();
    else if (relOp === "<") isTrue = 0 < diff;
    else if (relOp === "<=") isTrue = 0 <= diff;
    else if (relOp === ">") isTrue = 0 > diff;
    else if (relOp === ">=") isTrue = 0 >= diff;

    if (isTrue) {
      stepsCollector.push({
        code: "stepAlgebraIdentity",
        params: {},
      });
      return { variable, relOp, isIdentity: true, isContradiction: false };
    } else {
      stepsCollector.push({
        code: "stepAlgebraContradiction",
        params: {},
      });
      return { variable, relOp, isIdentity: false, isContradiction: true };
    }
  }

  // Divide by netCoeff
  let finalRelOp = relOp;
  let flipped = false;

  if (netCoeff.isNegative() && relOp !== "=") {
    // Flip relation operator!
    flipped = true;
    if (relOp === "<") finalRelOp = ">";
    else if (relOp === "<=") finalRelOp = ">=";
    else if (relOp === ">") finalRelOp = "<";
    else if (relOp === ">=") finalRelOp = "<=";

    stepsCollector.push({
      code: "stepAlgebraDivideNegativeFlip",
      params: {
        divisor: formatMinus(netCoeff.toFractionString()),
        variable,
        relOp: formatRelOp(finalRelOp),
      },
      flip: true,
    });
  } else {
    stepsCollector.push({
      code: "stepAlgebraDivideCoeff",
      params: {
        divisor: formatMinus(netCoeff.toFractionString()),
        variable,
      },
    });
  }

  const solution = netConst.div(netCoeff);

  stepsCollector.push({
    code: relOp === "=" ? "stepAlgebraSolutionEq" : "stepAlgebraSolutionIneq",
    params: {
      variable,
      relOp: formatRelOp(finalRelOp),
      solution: formatMinus(solution.format()),
    },
    flip: flipped,
  });

  return {
    variable,
    relOp: finalRelOp,
    value: solution,
    isIdentity: false,
    isContradiction: false,
  };
}

export function formatRelOp(op: RelOp): string {
  if (op === "<=") return "≤";
  if (op === ">=") return "≥";
  return op;
}

/**
 * Normalizes relational operators from input string
 */
function normalizeOperators(str: string): string {
  return str.replace(/<=/g, "≤").replace(/>=/g, "≥");
}

/**
 * Main solver for linear equations and linear inequalities
 */
export function solveAlgebra(
  input: string,
  universe: Universe = "real",
  locale?: string
): AlgebraResult {
  const raw = normalizeMinuses(input).trim();
  if (!raw) {
    throw new MathError("errEmptyInput");
  }

  const normalized = normalizeOperators(raw);
  const variable = detectVariable(normalized);

  const relRegex = /(<=|>=|≤|≥|=|<|>)/g;
  const matches = [...normalized.matchAll(relRegex)];

  if (matches.length === 0) {
    throw new MathError("errNoRelationSymbol");
  }

  if (matches.length > 2) {
    throw new MathError("errTooManyRelations");
  }

  const isEquation = matches.length === 1 && matches[0]?.[0] === "=";
  const topic = isEquation ? "linear_eq" : "linear_ineq";
  const steps: MathStep[] = [];

  if (matches.length === 1) {
    // Single equation or inequality
    const m = matches[0]!;
    const op = (m[0] === "≤" ? "<=" : m[0] === "≥" ? ">=" : m[0]) as RelOp;
    const matchIdx = m.index ?? 0;
    const lhsStr = normalized.substring(0, matchIdx).trim();
    const rhsStr = normalized.substring(matchIdx + m[0].length).trim();

    if (!lhsStr || !rhsStr) {
      throw new MathError("errInvalidExpression");
    }

    const res = solveSingleLinear(lhsStr, op, rhsStr, variable, steps);

    if (res.isIdentity) {
      const solutionSet =
        universe === "real"
          ? `{${variable} | ${variable} ∈ ℝ}`
          : `{${variable} | ${variable} ∈ ℤ}`;
      return buildAlgebraResult(
        topic,
        variable,
        universe,
        steps,
        true,
        false,
        undefined,
        [{ from: undefined, to: undefined }],
        undefined,
        solutionSet,
        normalized,
        locale
      );
    }

    if (res.isContradiction) {
      return buildAlgebraResult(
        topic,
        variable,
        universe,
        steps,
        false,
        true,
        undefined,
        [],
        [],
        "∅",
        normalized,
        locale
      );
    }

    const sol = res.value!;

    if (res.relOp === "=") {
      // Equation
      const solutionSet = `{${formatMinus(sol.format(locale))}}`;
      return buildAlgebraResult(
        "linear_eq",
        variable,
        universe,
        steps,
        false,
        false,
        sol,
        [],
        [sol.toNumber()],
        solutionSet,
        normalized,
        locale
      );
    } else {
      // Single inequality
      const singleOp = res.relOp;
      const numVal = sol.toNumber();
      let intervals: NumberLineInterval[] = [];

      if (singleOp === "<") {
        intervals = [{ to: numVal, toInclusive: false }];
      } else if (singleOp === "<=") {
        intervals = [{ to: numVal, toInclusive: true }];
      } else if (singleOp === ">") {
        intervals = [{ from: numVal, fromInclusive: false }];
      } else if (singleOp === ">=") {
        intervals = [{ from: numVal, fromInclusive: true }];
      }

      const notation = formatInequalityNotation(variable, singleOp, sol, universe, locale);
      return buildAlgebraResult(
        "linear_ineq",
        variable,
        universe,
        steps,
        false,
        false,
        sol,
        intervals,
        undefined,
        notation,
        normalized,
        locale
      );
    }
  } else {
    // Compound inequality: Part1 op1 Part2 op2 Part3
    const m1 = matches[0]!;
    const m2 = matches[1]!;

    const op1 = (m1[0] === "≤" ? "<=" : m1[0] === "≥" ? ">=" : m1[0]) as RelOp;
    const op2 = (m2[0] === "≤" ? "<=" : m2[0] === "≥" ? ">=" : m2[0]) as RelOp;

    if (op1 === "=" || op2 === "=") {
      throw new MathError("errCompoundInequalityInvalid");
    }

    const idx1 = m1.index ?? 0;
    const idx2 = m2.index ?? 0;
    const part1 = normalized.substring(0, idx1).trim();
    const part2 = normalized.substring(idx1 + m1[0].length, idx2).trim();
    const part3 = normalized.substring(idx2 + m2[0].length).trim();

    steps.push({
      code: "stepAlgebraCompoundSplit",
      params: {
        ineq1: `${part1} ${formatRelOp(op1)} ${part2}`,
        ineq2: `${part2} ${formatRelOp(op2)} ${part3}`,
      },
    });

    const steps1: MathStep[] = [];
    const steps2: MathStep[] = [];

    const res1 = solveSingleLinear(part1, op1, part2, variable, steps1);
    const res2 = solveSingleLinear(part2, op2, part3, variable, steps2);

    steps.push(...steps1);
    steps.push(...steps2);

    if (res1.isContradiction || res2.isContradiction) {
      return buildAlgebraResult(
        "linear_ineq",
        variable,
        universe,
        steps,
        false,
        true,
        undefined,
        [],
        [],
        "∅",
        normalized,
        locale
      );
    }

    // Intersect res1 and res2
    const int1 = toInterval(res1.relOp, res1.value!.toNumber());
    const int2 = toInterval(res2.relOp, res2.value!.toNumber());

    const intersection = intersectIntervals(int1, int2);

    if (!intersection) {
      steps.push({ code: "stepAlgebraIntersectionEmpty", params: {} });
      return buildAlgebraResult(
        "linear_ineq",
        variable,
        universe,
        steps,
        false,
        true,
        undefined,
        [],
        [],
        "∅",
        normalized,
        locale
      );
    }

    // Format compound notation
    const notation = formatCompoundNotation(
      variable,
      intersection,
      res1.value!,
      res2.value!,
      universe,
      locale
    );

    steps.push({
      code: "stepAlgebraIntersectionResult",
      params: { result: notation },
    });

    return buildAlgebraResult(
      "linear_ineq",
      variable,
      universe,
      steps,
      false,
      false,
      undefined,
      [intersection],
      undefined,
      notation,
      normalized,
      locale
    );
  }
}

function toInterval(op: RelOp, val: number): NumberLineInterval {
  if (op === "<") return { to: val, toInclusive: false };
  if (op === "<=") return { to: val, toInclusive: true };
  if (op === ">") return { from: val, fromInclusive: false };
  if (op === ">=") return { from: val, fromInclusive: true };
  return {};
}

function intersectIntervals(
  i1: NumberLineInterval,
  i2: NumberLineInterval
): NumberLineInterval | null {
  let from = i1.from;
  let fromInc = i1.fromInclusive;

  if (i2.from !== undefined) {
    if (from === undefined || i2.from > from) {
      from = i2.from;
      fromInc = i2.fromInclusive;
    } else if (i2.from === from) {
      fromInc = fromInc && i2.fromInclusive;
    }
  }

  let to = i1.to;
  let toInc = i1.toInclusive;

  if (i2.to !== undefined) {
    if (to === undefined || i2.to < to) {
      to = i2.to;
      toInc = i2.toInclusive;
    } else if (i2.to === to) {
      toInc = toInc && i2.toInclusive;
    }
  }

  if (from !== undefined && to !== undefined) {
    if (from > to) return null;
    if (from === to && (!fromInc || !toInc)) return null;
  }

  return { from, to, fromInclusive: fromInc, toInclusive: toInc };
}

function formatInequalityNotation(
  v: string,
  op: RelOp,
  val: Fraction,
  universe: Universe,
  locale?: string
): string {
  const formattedVal = formatMinus(val.format(locale));
  const relStr = formatRelOp(op);
  if (universe === "real") {
    return `{${v} | ${v} ${relStr} ${formattedVal}, ${v} ∈ ℝ}`;
  } else {
    // Universe integer
    const n = val.toNumber();
    if (op === "<" || op === "<=") {
      const top = op === "<=" ? Math.floor(n) : Math.ceil(n - 1);
      return `{..., ${formatMinus(top - 2)}, ${formatMinus(top - 1)}, ${formatMinus(top)}}`;
    } else {
      const bot = op === ">=" ? Math.ceil(n) : Math.floor(n + 1);
      return `{${formatMinus(bot)}, ${formatMinus(bot + 1)}, ${formatMinus(bot + 2)}, ...}`;
    }
  }
}

function formatCompoundNotation(
  v: string,
  interval: NumberLineInterval,
  _val1: Fraction,
  _val2: Fraction,
  universe: Universe,
  locale?: string
): string {
  const fromStr =
    interval.from !== undefined
      ? formatMinus(Fraction.fromNumber(interval.from).format(locale))
      : "";
  const toStr =
    interval.to !== undefined
      ? formatMinus(Fraction.fromNumber(interval.to).format(locale))
      : "";

  const op1 = interval.fromInclusive ? "≤" : "<";
  const op2 = interval.toInclusive ? "≤" : "<";

  if (universe === "real") {
    return `{${v} | ${fromStr} ${op1} ${v} ${op2} ${toStr}, ${v} ∈ ℝ}`;
  } else {
    // Discrete integers
    const start = interval.fromInclusive
      ? Math.ceil(interval.from ?? 0)
      : Math.floor((interval.from ?? 0) + 1);
    const end = interval.toInclusive
      ? Math.floor(interval.to ?? 0)
      : Math.ceil((interval.to ?? 0) - 1);

    const list: string[] = [];
    for (let i = start; i <= end; i++) {
      list.push(formatMinus(i));
    }
    return `{${list.join(", ")}}`;
  }
}

function buildAlgebraResult(
  topic: "linear_eq" | "linear_ineq",
  variable: string,
  universe: Universe,
  steps: MathStep[],
  isIdentity: boolean,
  isContradiction: boolean,
  solutionFraction: Fraction | undefined,
  intervals: NumberLineInterval[],
  discretePoints: number[] | undefined,
  solutionSetString: string,
  titleStr: string,
  locale?: string
): AlgebraResult {
  const points: NumberLinePoint[] = [];

  if (topic === "linear_eq" && solutionFraction) {
    points.push({
      value: solutionFraction.toNumber(),
      label: formatMinus(solutionFraction.format(locale)),
      filled: true,
    });
  } else if (topic === "linear_ineq") {
    if (universe === "real") {
      intervals.forEach((int) => {
        if (int.from !== undefined) {
          const f = Fraction.fromNumber(int.from);
          points.push({
            value: int.from,
            label: formatMinus(f.format(locale)),
            filled: !!int.fromInclusive,
          });
        }
        if (int.to !== undefined) {
          const f = Fraction.fromNumber(int.to);
          points.push({
            value: int.to,
            label: formatMinus(f.format(locale)),
            filled: !!int.toInclusive,
          });
        }
      });
    } else {
      // Discrete points for universe integer
      if (intervals.length > 0) {
        const int = intervals[0]!;
        const from = int.from !== undefined ? int.from : -5;
        const to = int.to !== undefined ? int.to : 5;
        const start = Math.ceil(from);
        const end = Math.floor(to);
        const pts: number[] = [];
        for (let k = start; k <= end; k++) {
          if (
            (int.from === undefined ||
              (int.fromInclusive ? k >= int.from : k > int.from)) &&
            (int.to === undefined ||
              (int.toInclusive ? k <= int.to : k < int.to))
          ) {
            pts.push(k);
            points.push({
              value: k,
              label: formatMinus(k),
              filled: true,
            });
          }
        }
        discretePoints = pts;
      }
    }
  }

  // Calculate suitable min/max/step for number line
  const refValues: number[] = [0];
  if (solutionFraction) refValues.push(solutionFraction.toNumber());
  points.forEach((p) => refValues.push(p.value));
  intervals.forEach((i) => {
    if (i.from !== undefined) refValues.push(i.from);
    if (i.to !== undefined) refValues.push(i.to);
  });

  const minVal = Math.min(...refValues);
  const maxVal = Math.max(...refValues);
  const span = Math.max(2, maxVal - minVal);
  const padding = Math.max(2, Math.ceil(span * 0.4));

  let scaleMin = Math.floor(minVal - padding);
  let scaleMax = Math.ceil(maxVal + padding);

  let step = 1;
  const totalRange = scaleMax - scaleMin;
  if (totalRange > 40) step = 5;
  if (totalRange > 100) step = 10;
  if (totalRange > 250) step = 25;
  if (totalRange > 500) step = 50;

  scaleMin = Math.floor(scaleMin / step) * step;
  scaleMax = Math.ceil(scaleMax / step) * step;

  const altText = `Number line showing solution for ${titleStr}: ${solutionSetString}`;
  const worksheetAltText = `Number line worksheet for ${titleStr} with hidden solution.`;

  const visual: NumberLineVisualData = {
    topic,
    min: scaleMin,
    max: scaleMax,
    step,
    points,
    intervals,
    jumps: [],
    title: titleStr,
    solutionFormula: `Solution set = ${solutionSetString}`,
    worksheetFormula: `Solution set = ……`,
    altText,
    worksheetAltText,
  };

  return {
    variable,
    topic,
    universe,
    steps,
    isIdentity,
    isContradiction,
    solutionFraction,
    intervals,
    discretePoints,
    solutionSetString,
    worksheetSolutionSetString: "……",
    visual,
  };
}
