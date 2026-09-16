import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isRateLimited, recordAttempt } from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows attempts under the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 4; i++) {
      expect(isRateLimited(key)).toBe(false);
      recordAttempt(key);
    }
  });

  it("blocks after the limit is reached", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) recordAttempt(key);
    expect(isRateLimited(key)).toBe(true);
  });

  it("resets after the window passes", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) recordAttempt(key);
    expect(isRateLimited(key)).toBe(true);

    vi.advanceTimersByTime(16 * 60 * 1000);
    expect(isRateLimited(key)).toBe(false);
  });

  it("tracks different keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    for (let i = 0; i < 5; i++) recordAttempt(keyA);
    expect(isRateLimited(keyA)).toBe(true);
    expect(isRateLimited(keyB)).toBe(false);
  });
});
