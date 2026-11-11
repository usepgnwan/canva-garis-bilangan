import { solveAlgebra } from "../algebra";

describe("Algebra Engine Tests (PLSV & PtLSV)", () => {
  describe("Linear Equations (PLSV)", () => {
    it("should solve simple linear equation", () => {
      const res = solveAlgebra("x + 2 = 5");
      expect(res.topic).toBe("linear_eq");
      expect(res.solutionFraction?.toNumber()).toBe(3);
      expect(res.solutionSetString).toBe("{3}");
    });

    it("should solve equations with exact fractions", () => {
      const res = solveAlgebra("3x = 7");
      expect(res.solutionFraction?.toFractionString()).toBe("7/3");
      expect(res.solutionFraction?.toNumber()).toBeCloseTo(2.333, 2);
    });

    it("should solve equations with parentheses", () => {
      const res = solveAlgebra("3(x - 2) = 2x + 1");
      // 3x - 6 = 2x + 1 => x = 7
      expect(res.solutionFraction?.toNumber()).toBe(7);
    });

    it("should solve division and fractions in input", () => {
      const res = solveAlgebra("x/2 + 1 = 4");
      // x/2 = 3 => x = 6
      expect(res.solutionFraction?.toNumber()).toBe(6);
    });

    it("should identify identity equation", () => {
      const res = solveAlgebra("2x + 4 = 2(x + 2)");
      expect(res.isIdentity).toBe(true);
      expect(res.solutionSetString).toContain("∈ ℝ");
    });

    it("should identify contradiction equation", () => {
      const res = solveAlgebra("x + 1 = x + 2");
      expect(res.isContradiction).toBe(true);
      expect(res.solutionSetString).toBe("∅");
    });
  });

  describe("Linear Inequalities (PtLSV)", () => {
    it("should solve simple inequality", () => {
      const res = solveAlgebra("x + 4 < 8");
      expect(res.topic).toBe("linear_ineq");
      expect(res.solutionSetString).toContain("x < 4");
    });

    it("should automatically flip inequality sign when dividing by negative number", () => {
      const res = solveAlgebra("-2x + 1 > 7");
      // -2x > 6 => x < -3 (sign flipped!)
      const flipStep = res.steps.find((s) => s.flip === true);
      expect(flipStep).toBeDefined();
      expect(res.solutionSetString).toContain("x < −3");
    });

    it("should handle compound inequalities", () => {
      const res = solveAlgebra("-3 < x <= 4");
      expect(res.intervals).toHaveLength(1);
      expect(res.intervals?.[0]?.from).toBe(-3);
      expect(res.intervals?.[0]?.to).toBe(4);
      expect(res.intervals?.[0]?.fromInclusive).toBe(false);
      expect(res.intervals?.[0]?.toInclusive).toBe(true);
      expect(res.solutionSetString).toContain("−3 < x ≤ 4");
    });

    it("should support universe integer", () => {
      const res = solveAlgebra("2x - 1 < 7", "integer");
      // 2x < 8 => x < 4 => {..., 1, 2, 3}
      expect(res.universe).toBe("integer");
      expect(res.solutionSetString).toContain("3");
    });
  });
});
