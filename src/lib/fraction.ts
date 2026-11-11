/**
 * Exact Fraction class for linear algebra and exact calculations
 */

export class Fraction {
  readonly num: number;
  readonly den: number;

  constructor(numerator: number, denominator = 1) {
    if (denominator === 0) {
      throw new Error("Denominator cannot be zero");
    }
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
      // In case floating numbers are passed, normalize them
      const factor = Math.max(
        Fraction.getDecimalPlaces(numerator),
        Fraction.getDecimalPlaces(denominator)
      );
      const mult = Math.pow(10, factor);
      numerator = Math.round(numerator * mult);
      denominator = Math.round(denominator * mult);
    }

    const divisor = Fraction.gcd(Math.abs(numerator), Math.abs(denominator));
    let n = numerator / divisor;
    let d = denominator / divisor;

    if (d < 0) {
      n = -n;
      d = -d;
    }

    this.num = n === 0 ? 0 : n;
    this.den = n === 0 ? 1 : d;
  }

  private static getDecimalPlaces(n: number): number {
    const s = n.toString();
    const idx = s.indexOf(".");
    return idx === -1 ? 0 : s.length - idx - 1;
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  static fromNumber(n: number): Fraction {
    if (Number.isInteger(n)) {
      return new Fraction(n, 1);
    }
    const s = n.toString();
    const idx = s.indexOf(".");
    if (idx === -1) return new Fraction(n, 1);
    const dec = s.length - idx - 1;
    const mult = Math.pow(10, dec);
    return new Fraction(Math.round(n * mult), mult);
  }

  static fromString(str: string): Fraction {
    const trimmed = str.trim().replace(/,/g, ".");
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      if (parts.length === 2) {
        const num = parseFloat(parts[0]!.trim());
        const den = parseFloat(parts[1]!.trim());
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return new Fraction(num).div(new Fraction(den));
        }
      }
    }
    const val = parseFloat(trimmed);
    if (isNaN(val)) {
      throw new Error(`Invalid number: ${str}`);
    }
    return Fraction.fromNumber(val);
  }

  add(other: Fraction | number): Fraction {
    const o = typeof other === "number" ? Fraction.fromNumber(other) : other;
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(other: Fraction | number): Fraction {
    const o = typeof other === "number" ? Fraction.fromNumber(other) : other;
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(other: Fraction | number): Fraction {
    const o = typeof other === "number" ? Fraction.fromNumber(other) : other;
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(other: Fraction | number): Fraction {
    const o = typeof other === "number" ? Fraction.fromNumber(other) : other;
    if (o.num === 0) {
      throw new Error("Division by zero");
    }
    return new Fraction(this.num * o.den, this.den * o.num);
  }

  negate(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  abs(): Fraction {
    return new Fraction(Math.abs(this.num), this.den);
  }

  isZero(): boolean {
    return this.num === 0;
  }

  isPositive(): boolean {
    return this.num > 0;
  }

  isNegative(): boolean {
    return this.num < 0;
  }

  isInteger(): boolean {
    return this.den === 1;
  }

  toNumber(): number {
    return this.num / this.den;
  }

  compare(other: Fraction | number): number {
    const o = typeof other === "number" ? Fraction.fromNumber(other) : other;
    const diff = this.num * o.den - o.num * this.den;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
    return 0;
  }

  equals(other: Fraction | number): boolean {
    return this.compare(other) === 0;
  }

  toFractionString(): string {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  toApproxString(locale?: string, maxDecimals = 2): string {
    const val = this.toNumber();
    if (Number.isInteger(val)) {
      return val.toString();
    }
    const formatted = val.toFixed(maxDecimals);
    const decimalSeparator = locale?.startsWith("id") ? "," : ".";
    return formatted.replace(".", decimalSeparator);
  }

  /**
   * Formats for display: e.g. "3" or "7/3 ≈ 2.33" (or 2,33 for id locale)
   */
  format(locale?: string): string {
    if (this.den === 1) {
      return `${this.num}`;
    }
    const approx = this.toApproxString(locale, 2);
    return `${this.toFractionString()} ≈ ${approx}`;
  }
}
