import { normalizeMinuses } from "./integers";
import type { Topic } from "./types";

/**
 * Detects the most appropriate topic based on input expression.
 * - Contains relation (<, >, ≤, ≥, <=, >=): linear_ineq
 * - Contains = and a variable letter or algebra structure: linear_eq
 * - Contains commas/semicolons and numbers (no letters/relations): integers_order
 * - Otherwise: integers_ops
 */
export function detectTopicFromInput(input: string): Topic {
  const raw = normalizeMinuses(input).trim();
  if (!raw) return "integers_ops";

  // Check inequality relations
  if (/[<>≤≥]|<=|>=/.test(raw)) {
    return "linear_ineq";
  }

  // Check equation relations
  if (raw.includes("=")) {
    return "linear_eq";
  }

  // If contains letters without relations, could be linear equation in progress or ineq
  if (/[a-zA-Z]/.test(raw)) {
    return "linear_eq";
  }

  // Check lists of numbers separated by commas or semicolons
  if (/[,;]/.test(raw)) {
    return "integers_order";
  }

  // Default to integer operations (e.g. -3 + 5)
  return "integers_ops";
}

/**
 * Checks whether the current input is valid / compatible with the given topic.
 */
export function isInputCompatibleWithTopic(input: string, topic: Topic): boolean {
  const raw = normalizeMinuses(input).trim();
  if (!raw) return true;

  const detected = detectTopicFromInput(input);
  return detected === topic;
}
