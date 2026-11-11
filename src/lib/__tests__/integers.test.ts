import { solveIntegersOps, solveIntegersOrder } from "../integers";

describe("Integers Engine Tests", () => {
  describe("solveIntegersOps", () => {
    it("should solve simple addition starting jumps from 0", () => {
      const res = solveIntegersOps("-3 + 5");
      expect(res.finalResult).toBe(2);
      expect(res.jumps).toHaveLength(2);
      // First jump always starts from 0
      expect(res.jumps[0]).toEqual({
        from: 0,
        to: -3,
        delta: -3,
        level: 1,
        label: "−3",
      });
      // Second jump starts from -3 to 2
      expect(res.jumps[1]).toEqual({
        from: -3,
        to: 2,
        delta: 5,
        level: 2,
        label: "+5",
      });
      expect(res.equationString).toBe("−3 + 5 = 2");
    });

    it("should rewrite subtraction as addition of opposite", () => {
      const res = solveIntegersOps("4 - (-2)");
      expect(res.finalResult).toBe(6);
      expect(res.jumps[0]?.from).toBe(0);
      expect(res.jumps[0]?.to).toBe(4);
      expect(res.jumps[1]?.from).toBe(4);
      expect(res.jumps[1]?.to).toBe(6);

      // Check step for rewriting subtraction
      const rewriteStep = res.steps.find(
        (s) => s.code === "stepIntRewriteSubtraction"
      );
      expect(rewriteStep).toBeDefined();
    });

    it("should handle chained operations up to 6 numbers", () => {
      const res = solveIntegersOps("2 + (-6) - 3");
      expect(res.finalResult).toBe(-7);
      expect(res.jumps).toHaveLength(3);
      expect(res.jumps[0]?.from).toBe(0);
      expect(res.jumps[0]?.to).toBe(2);
      expect(res.jumps[1]?.from).toBe(2);
      expect(res.jumps[1]?.to).toBe(-4);
      expect(res.jumps[2]?.from).toBe(-4);
      expect(res.jumps[2]?.to).toBe(-7);
    });

    it("should reject disallowed inputs", () => {
      // Letters
      expect(() => solveIntegersOps("x + 5")).toThrow();
      // Decimals
      expect(() => solveIntegersOps("2.5 + 1")).toThrow();
      // Relations
      expect(() => solveIntegersOps("2 + 3 = 5")).toThrow();
      // Multiplication / division
      expect(() => solveIntegersOps("2 * 3")).toThrow();
      // Unpaired parentheses
      expect(() => solveIntegersOps("2 + (3")).toThrow();
      // Too many numbers (> 6)
      expect(() => solveIntegersOps("1 + 2 + 3 + 4 + 5 + 6 + 7")).toThrow();
      // Number too large (> 1000)
      expect(() => solveIntegersOps("2000 + 1")).toThrow();
    });
  });

  describe("solveIntegersOrder", () => {
    it("should order and compare numbers with < and >", () => {
      const res = solveIntegersOrder("-5, 3, 0, -1");
      expect(res.sortedAsc).toEqual([-5, -1, 0, 3]);
      expect(res.sortedDesc).toEqual([3, 0, -1, -5]);
      expect(res.ascString).toBe("−5 < −1 < 0 < 3");
      expect(res.descString).toBe("3 > 0 > −1 > −5");
    });

    it("should handle duplicates with =", () => {
      const res = solveIntegersOrder("-2, 3, -2, 5");
      expect(res.ascString).toBe("−2 = −2 < 3 < 5");
    });

    it("should reject fewer than 2 or more than 10 numbers", () => {
      expect(() => solveIntegersOrder("5")).toThrow();
      expect(() => solveIntegersOrder("1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11")).toThrow();
    });
  });
});
