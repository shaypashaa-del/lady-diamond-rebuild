import { describe, it, expect } from "vitest";
import { isValidEmail, truncate } from "./validation";

describe("isValidEmail", () => {
  it("accepts normal-looking emails", () => {
    expect(isValidEmail("shay@example.com")).toBe(true);
    expect(isValidEmail("a.b+c@sub.example.co.il")).toBe(true);
  });

  it("rejects obviously malformed input", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("@")).toBe(false);
    expect(isValidEmail("a@")).toBe(false);
    expect(isValidEmail("no-at-sign")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false); // no TLD
    expect(isValidEmail("a b@example.com")).toBe(false); // space
  });
});

describe("truncate", () => {
  it("leaves short strings unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("cuts strings longer than the limit", () => {
    expect(truncate("a".repeat(20), 5)).toBe("aaaaa");
  });
});
