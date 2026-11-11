import { Fraction } from "../fraction";

describe("Fraction Class Tests", () => {
  it("should create whole numbers correctly", () => {
    const f = new Fraction(5);
    expect(f.num).toBe(5);
    expect(f.den).toBe(1);
    expect(f.isInteger()).toBe(true);
    expect(f.toNumber()).toBe(5);
    expect(f.toFractionString()).toBe("5");
    expect(f.format()).toBe("5");
  });

  it("should reduce fractions automatically", () => {
    const f = new Fraction(6, 8);
    expect(f.num).toBe(3);
    expect(f.den).toBe(4);
    expect(f.toFractionString()).toBe("3/4");
    expect(f.toNumber()).toBe(0.75);
  });

  it("should handle negative signs correctly", () => {
    const f1 = new Fraction(3, -4);
    expect(f1.num).toBe(-3);
    expect(f1.den).toBe(4);

    const f2 = new Fraction(-6, -8);
    expect(f2.num).toBe(3);
    expect(f2.den).toBe(4);
  });

  it("should add, subtract, multiply, and divide fractions", () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 3);

    const sum = a.add(b);
    expect(sum.toFractionString()).toBe("5/6");

    const diff = a.sub(b);
    expect(diff.toFractionString()).toBe("1/6");

    const prod = a.mul(b);
    expect(prod.toFractionString()).toBe("1/6");

    const quot = a.div(b);
    expect(quot.toFractionString()).toBe("3/2");
  });

  it("should format inexact fractions with approx string", () => {
    const f = new Fraction(7, 3);
    expect(f.format("en-US")).toBe("7/3 ≈ 2.33");
    expect(f.format("id-ID")).toBe("7/3 ≈ 2,33");
  });

  it("should parse string decimals and fractions", () => {
    const f1 = Fraction.fromString("0.5");
    expect(f1.toFractionString()).toBe("1/2");

    const f2 = Fraction.fromString("7/3");
    expect(f2.num).toBe(7);
    expect(f2.den).toBe(3);

    const f3 = Fraction.fromString("2,5");
    expect(f3.toFractionString()).toBe("5/2");
  });

  it("should throw on division by zero", () => {
    expect(() => new Fraction(1, 0)).toThrow();
    const f = new Fraction(1, 2);
    expect(() => f.div(new Fraction(0))).toThrow();
  });
});
