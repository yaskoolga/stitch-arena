import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StatsCards } from "@/components/dashboard/stats-cards";

afterEach(cleanup);

describe("StatsCards", () => {
  it("renders progress percentage", () => {
    render(
      <StatsCards
        completedStitches={500}
        totalStitches={1000}
        logsCount={5}
        firstLogDate="2026-01-01"
      />
    );
    expect(screen.getByText("Progress")).toBeDefined();
    expect(screen.getByText(/500/)).toBeDefined();
  });

  it("renders all four cards", () => {
    render(
      <StatsCards
        completedStitches={100}
        totalStitches={1000}
        logsCount={2}
        firstLogDate="2026-01-01"
      />
    );
    expect(screen.getByText("Progress")).toBeDefined();
    expect(screen.getByText("Sessions")).toBeDefined();
    expect(screen.getByText("Avg / Day")).toBeDefined();
    expect(screen.getByText("Est. Days Left")).toBeDefined();
  });
});
