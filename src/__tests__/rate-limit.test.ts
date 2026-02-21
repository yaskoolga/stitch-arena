import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 3, 60000)).toBe(true);
    expect(rateLimit(key, 3, 60000)).toBe(true);
    expect(rateLimit(key, 3, 60000)).toBe(true);
  });

  it("blocks requests over limit", () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);
    expect(rateLimit(key, 2, 60000)).toBe(false);
  });

  it("resets after window expires", () => {
    const key = `test-reset-${Date.now()}`;
    rateLimit(key, 1, 1); // 1ms window
    // Wait for window to expire
    const start = Date.now();
    while (Date.now() - start < 5) {} // busy wait 5ms
    expect(rateLimit(key, 1, 1)).toBe(true);
  });
});
