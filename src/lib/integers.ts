import type {
  IntegerJump,
  IntegersOpsResult,
  IntegersOrderResult,
  MathStep,
  NumberLinePoint,
  NumberLineVisualData,
} from "./types";
import { MathError } from "./types";

/**
 * Normalizes minus signs (e.g. unicode minus −, en-dash –, etc.) to standard '-'
 */
export function normalizeMinuses(str: string): string {
  return str.replace(/[\u2212\u2013\u2014]/g, "-");
}

export function formatMinus(n: number | string): string {
  const s = n.toString();
  return s.replace(/-/g, "−");
}

/**
 * Parses integer operations: e.g. "-3 + 5", "4 - (-2)", "2 + (-6) - 3"
 */
export function solveIntegersOps(input: string): IntegersOpsResult {
  const raw = normalizeMinuses(input).trim();
  if (!raw) {
    throw new MathError("errEmptyInput");
  }

  // Check for disallowed characters
  if (/[a-zA-Z]/.test(raw)) {
    throw new MathError("errContainsLetters");
  }
  if (/[=<>≤≥]/.test(raw)) {
    throw new MathError("errContainsRelations");
  }
  if (/[*×÷/:]/.test(raw)) {
    throw new MathError("errContainsMulDiv");
  }
  if (/[,.]/.test(raw)) {
    // Comma or dot in operations is invalid (no decimals allowed)
    throw new MathError("errContainsDecimals");
  }

  // Check balanced parentheses
  let parenCount = 0;
  for (const ch of raw) {
    if (ch === "(") parenCount++;
    if (ch === ")") parenCount--;
    if (parenCount < 0) throw new MathError("errUnpairedParentheses");
  }
  if (parenCount !== 0) throw new MathError("errUnpairedParentheses");

  // Tokenize signed numbers and operators
  const cleaned = raw.replace(/\s+/g, "");

  const tokens: { op: "+" | "-"; val: number; rawNum: number }[] = [];
  let i = 0;
  let currentOp: "+" | "-" = "+";

  while (i < cleaned.length) {
    const char = cleaned[i];

    if (char === "+") {
      currentOp = "+";
      i++;
      continue;
    } else if (char === "-") {
      currentOp = "-";
      i++;
      continue;
    } else if (char === "(") {
      // Find matching ')'
      let depth = 1;
      let j = i + 1;
      while (j < cleaned.length && depth > 0) {
        if (cleaned[j] === "(") depth++;
        if (cleaned[j] === ")") depth--;
        j++;
      }
      const inside = cleaned.substring(i + 1, j - 1);
      const innerVal = parseInt(inside, 10);
      if (isNaN(innerVal)) {
        throw new MathError("errInvalidExpression");
      }
      tokens.push({
        op: currentOp,
        val: currentOp === "-" ? -innerVal : innerVal,
        rawNum: innerVal,
      });
      i = j;
      currentOp = "+";
    } else {
      // Read number
      let numStr = "";
      if (char === "-" || char === "+") {
        numStr += char;
        i++;
      }
      while (i < cleaned.length && /[0-9]/.test(cleaned[i] ?? "")) {
        numStr += cleaned[i];
        i++;
      }
      const val = parseInt(numStr, 10);
      if (isNaN(val)) {
        throw new MathError("errInvalidExpression");
      }
      tokens.push({
        op: currentOp,
        val: currentOp === "-" ? -val : val,
        rawNum: val,
      });
      currentOp = "+";
    }
  }

  if (tokens.length === 0) {
    throw new MathError("errEmptyInput");
  }

  if (tokens.length > 6) {
    throw new MathError("errTooManyNumbers", { max: 6 });
  }

  for (const t of tokens) {
    if (Math.abs(t.rawNum) > 1000 || Math.abs(t.val) > 1000) {
      throw new MathError("errNumberTooLarge", { min: -1000, max: 1000 });
    }
  }

  // Calculate jumps and rewriting
  const numbers: number[] = tokens.map((t) => (t.op === "-" ? -t.rawNum : t.rawNum));
  const rewrittenNumbers: number[] = tokens.map((t) => t.val);

  const steps: MathStep[] = [];

  // Step 1: Rewrite subtractions as addition of opposites if any subtraction exists
  const hasSubtraction = tokens.some((t) => t.op === "-");
  if (hasSubtraction) {
    const originalExpr = tokens
      .map((t, idx) => {
        const signedVal = t.op === "-" ? -t.rawNum : t.rawNum;
        if (idx === 0) return formatMinus(signedVal);
        return `${t.op} ${t.rawNum < 0 ? `(${formatMinus(t.rawNum)})` : formatMinus(t.rawNum)}`;
      })
      .join(" ");

    const rewrittenExpr = rewrittenNumbers
      .map((n, idx) => {
        if (idx === 0) return formatMinus(n);
        return `+ ${n < 0 ? `(${formatMinus(n)})` : formatMinus(n)}`;
      })
      .join(" ");

    steps.push({
      code: "stepIntRewriteSubtraction",
      params: { original: originalExpr, rewritten: rewrittenExpr },
    });
  }

  // Panah lompatan bertingkat di atas garis.
  // Panah pertama SELALU dimulai dari 0.
  const jumps: IntegerJump[] = [];
  let currentPos = 0;

  rewrittenNumbers.forEach((delta, index) => {
    const from = currentPos;
    const to = currentPos + delta;
    const level = index + 1;
    const label = delta > 0 ? `+${delta}` : formatMinus(delta);

    jumps.push({
      from,
      to,
      delta,
      level,
      label,
    });

    const dirCode = delta >= 0 ? "right" : "left";
    steps.push({
      code: "stepIntJump",
      params: {
        from: formatMinus(from),
        to: formatMinus(to),
        units: Math.abs(delta),
        direction: dirCode,
        stepNumber: index + 1,
      },
    });

    currentPos = to;
  });

  const finalResult = currentPos;

  // Final step
  const equationString = `${tokens
    .map((t, idx) => {
      const signedVal = t.op === "-" ? -t.rawNum : t.rawNum;
      if (idx === 0) return formatMinus(signedVal);
      return `${t.op} ${t.rawNum < 0 ? `(${formatMinus(t.rawNum)})` : formatMinus(t.rawNum)}`;
    })
    .join(" ")} = ${formatMinus(finalResult)}`;

  steps.push({
    code: "stepIntResult",
    params: { result: formatMinus(finalResult), equation: equationString },
  });

  // Calculate scale
  const allPositions = [0, finalResult, ...jumps.map((j) => j.from), ...jumps.map((j) => j.to)];
  const minPos = Math.min(...allPositions);
  const maxPos = Math.max(...allPositions);

  // Pad by at least 1-2 units
  const range = maxPos - minPos;
  const padding = Math.max(1, Math.ceil(range * 0.15));
  let scaleMin = minPos - padding;
  let scaleMax = maxPos + padding;

  // Determine suitable step
  const totalRange = scaleMax - scaleMin;
  let step = 1;
  if (totalRange > 40) step = 5;
  if (totalRange > 100) step = 10;
  if (totalRange > 250) step = 25;
  if (totalRange > 500) step = 50;

  scaleMin = Math.floor(scaleMin / step) * step;
  scaleMax = Math.ceil(scaleMax / step) * step;

  // Visual points: dot at 0 and dot at result
  const points: NumberLinePoint[] = [
    { value: 0, label: "0", filled: true },
    { value: finalResult, label: formatMinus(finalResult), filled: true },
  ];

  const altText = `Number line showing integer operation ${equationString} with jumps starting from 0 to ${formatMinus(finalResult)}.`;
  const worksheetAltText = `Number line worksheet for integer operation ${equationString.split("=")[0]?.trim() ?? ""} with hidden solution.`;

  const visual: NumberLineVisualData = {
    topic: "integers_ops",
    min: scaleMin,
    max: scaleMax,
    step,
    points,
    intervals: [],
    jumps,
    title: equationString,
    solutionFormula: equationString,
    worksheetFormula: `${equationString.split("=")[0]?.trim() ?? ""} = ……`,
    altText,
    worksheetAltText,
  };

  return {
    numbers,
    rewrittenNumbers,
    jumps,
    finalResult,
    equationString,
    steps,
    visual,
  };
}

/**
 * Parses and solves comparing and ordering integers
 * e.g. "-5, 3, 0, -1" (2–10 numbers)
 */
export function solveIntegersOrder(input: string): IntegersOrderResult {
  const raw = normalizeMinuses(input).trim();
  if (!raw) {
    throw new MathError("errEmptyInput");
  }

  if (/[a-zA-Z]/.test(raw)) {
    throw new MathError("errContainsLetters");
  }
  if (/[=<>≤≥]/.test(raw)) {
    throw new MathError("errContainsRelations");
  }
  if (/[*×÷/:]/.test(raw)) {
    throw new MathError("errContainsMulDiv");
  }

  // Split by comma, semicolon, or whitespace
  const rawParts = raw.split(/[,;\s]+/).filter((p) => p.length > 0);
  if (rawParts.length < 2) {
    throw new MathError("errOrderTooFewNumbers", { min: 2 });
  }
  if (rawParts.length > 10) {
    throw new MathError("errOrderTooManyNumbers", { max: 10 });
  }

  const numbers: number[] = [];
  for (const part of rawParts) {
    const val = parseInt(part, 10);
    if (isNaN(val)) {
      throw new MathError("errInvalidExpression");
    }
    if (Math.abs(val) > 1000) {
      throw new MathError("errNumberTooLarge", { min: -1000, max: 1000 });
    }
    numbers.push(val);
  }

  // Sort ascending and descending
  const sortedAsc = [...numbers].sort((a, b) => a - b);
  const sortedDesc = [...numbers].sort((a, b) => b - a);

  // Build comparison strings: duplicates use '='
  const buildComparison = (arr: number[], rel: "<" | ">") => {
    let res = formatMinus(arr[0] ?? 0);
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1] ?? 0;
      const curr = arr[i] ?? 0;
      const sym = curr === prev ? " = " : ` ${rel} `;
      res += `${sym}${formatMinus(curr)}`;
    }
    return res;
  };

  const ascString = buildComparison(sortedAsc, "<");
  const descString = buildComparison(sortedDesc, ">");

  const steps: MathStep[] = [
    {
      code: "stepOrderPlot",
      params: { list: numbers.map(formatMinus).join(", ") },
    },
    {
      code: "stepOrderAsc",
      params: { result: ascString },
    },
    {
      code: "stepOrderDesc",
      params: { result: descString },
    },
  ];

  // Visual points: unique values with labels
  const points: NumberLinePoint[] = sortedAsc.map((val) => ({
    value: val,
    label: formatMinus(val),
    filled: true,
  }));

  const minVal = sortedAsc[0] ?? 0;
  const maxVal = sortedAsc[sortedAsc.length - 1] ?? 0;
  const range = maxVal - minVal;
  const padding = Math.max(1, Math.ceil(range * 0.2));
  let scaleMin = minVal - padding;
  let scaleMax = maxVal + padding;

  let step = 1;
  const totalRange = scaleMax - scaleMin;
  if (totalRange > 40) step = 5;
  if (totalRange > 100) step = 10;
  if (totalRange > 250) step = 25;
  if (totalRange > 500) step = 50;

  scaleMin = Math.floor(scaleMin / step) * step;
  scaleMax = Math.ceil(scaleMax / step) * step;

  const altText = `Number line showing ordered integers: ${ascString}`;
  const worksheetAltText = `Number line worksheet for ordering integers: ${numbers.map(formatMinus).join(", ")}`;

  // Worksheet string e.g. "…… < …… < ……"
  const worksheetFormula = sortedAsc
    .map((_, idx) => (idx === 0 ? "……" : "< ……"))
    .join(" ");

  const visual: NumberLineVisualData = {
    topic: "integers_order",
    min: scaleMin,
    max: scaleMax,
    step,
    points,
    intervals: [],
    jumps: [],
    title: ascString,
    solutionFormula: ascString,
    worksheetFormula,
    altText,
    worksheetAltText,
  };

  return {
    numbers,
    sortedAsc,
    sortedDesc,
    ascString,
    descString,
    steps,
    visual,
  };
}
