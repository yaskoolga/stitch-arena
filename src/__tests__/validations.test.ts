import { describe, it, expect } from "vitest";
import {
  registerSchema,
  projectCreateSchema,
  projectUpdateSchema,
  logCreateSchema,
  logUpdateSchema,
  profileUpdateSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  it("accepts valid data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "123456",
      name: "Test",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });
});

describe("projectCreateSchema", () => {
  it("accepts valid project", () => {
    const result = projectCreateSchema.safeParse({
      title: "My Project",
      totalStitches: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(false);
    }
  });

  it("rejects empty title", () => {
    const result = projectCreateSchema.safeParse({
      title: "",
      totalStitches: 5000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative stitches", () => {
    const result = projectCreateSchema.safeParse({
      title: "Test",
      totalStitches: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string stitches to number", () => {
    const result = projectCreateSchema.safeParse({
      title: "Test",
      totalStitches: "5000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalStitches).toBe(5000);
    }
  });
});

describe("projectUpdateSchema", () => {
  it("accepts partial update", () => {
    const result = projectUpdateSchema.safeParse({ title: "New Title" });
    expect(result.success).toBe(true);
  });

  it("accepts valid status", () => {
    const result = projectUpdateSchema.safeParse({ status: "completed" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = projectUpdateSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts empty object", () => {
    const result = projectUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("logCreateSchema", () => {
  it("accepts valid log", () => {
    const result = logCreateSchema.safeParse({
      date: "2026-01-31",
      stitches: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date", () => {
    const result = logCreateSchema.safeParse({
      date: "not-a-date",
      stitches: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero stitches", () => {
    const result = logCreateSchema.safeParse({
      date: "2026-01-31",
      stitches: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("logUpdateSchema", () => {
  it("accepts partial update", () => {
    const result = logUpdateSchema.safeParse({ stitches: 200 });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = logUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("profileUpdateSchema", () => {
  it("accepts valid profile update", () => {
    const result = profileUpdateSchema.safeParse({
      name: "New Name",
      bio: "Hello world",
    });
    expect(result.success).toBe(true);
  });

  it("rejects too long bio", () => {
    const result = profileUpdateSchema.safeParse({
      bio: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("allows nullable fields", () => {
    const result = profileUpdateSchema.safeParse({
      name: null,
      bio: null,
      avatar: null,
    });
    expect(result.success).toBe(true);
  });
});
