import { detectTopicFromInput, isInputCompatibleWithTopic } from "../detection";

describe("Topic Detection Tests", () => {
  it("should detect linear inequality when relational signs are present", () => {
    expect(detectTopicFromInput("x + 4 < 8")).toBe("linear_ineq");
    expect(detectTopicFromInput("2x >= 6")).toBe("linear_ineq");
    expect(detectTopicFromInput("-3 < x <= 4")).toBe("linear_ineq");
  });

  it("should detect linear equation when = or variables without ineq are present", () => {
    expect(detectTopicFromInput("2x + 1 = 7")).toBe("linear_eq");
    expect(detectTopicFromInput("3(x - 2) = 5")).toBe("linear_eq");
  });

  it("should detect integers order when lists of numbers with comma or semicolon", () => {
    expect(detectTopicFromInput("-5, 3, 0, -1")).toBe("integers_order");
    expect(detectTopicFromInput("2; -4; 6")).toBe("integers_order");
  });

  it("should detect integers ops for arithmetic without letters or relations", () => {
    expect(detectTopicFromInput("-3 + 5")).toBe("integers_ops");
    expect(detectTopicFromInput("4 - (-2)")).toBe("integers_ops");
    expect(detectTopicFromInput("2 + (-6) - 3")).toBe("integers_ops");
  });

  it("should verify topic compatibility correctly", () => {
    expect(isInputCompatibleWithTopic("-3 + 5", "integers_ops")).toBe(true);
    expect(isInputCompatibleWithTopic("x + 2 = 5", "integers_ops")).toBe(false);
    expect(isInputCompatibleWithTopic("x + 2 = 5", "linear_eq")).toBe(true);
  });
});
