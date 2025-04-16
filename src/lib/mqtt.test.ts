import { describe, test, expect } from "vitest";
import { matches } from "./mqtt";

describe("MQTT pattern matching", () => {
  test("exact topic matches", () => {
    expect(matches("a/b/c", "a/b/c")).toBe(true);
    expect(matches("a/b/c", "a/b/d")).toBe(false);
    expect(matches("a/b", "a/b/c")).toBe(false);
    expect(matches("a/b/c/d", "a/b/c")).toBe(false);
  });

  test("wildcard + matches", () => {
    expect(matches("a/+/c", "a/b/c")).toBe(true);
    expect(matches("a/+/c", "a/xyz/c")).toBe(true);
    expect(matches("a/+/c", "a/b/d")).toBe(false);
    expect(matches("a/+/+", "a/b/c")).toBe(true);
    expect(matches("+/+/+", "a/b/c")).toBe(true);
  });

  test("wildcard # matches", () => {
    expect(matches("a/b/#", "a/b/c")).toBe(true);
    expect(matches("a/b/#", "a/b/c/d")).toBe(true);
    expect(matches("a/b/#", "a/b")).toBe(true);
    expect(matches("a/#", "a")).toBe(true);
  });

  test("# not allowed in middle", () => {
    expect(matches("a/#/c", "a/b/c")).toBe(false);
  });

  test("empty segments", () => {
    expect(matches("a//c", "a//c")).toBe(true);
    expect(matches("a/+/c", "a//c")).toBe(false);
    expect(matches("", "")).toBe(true);
  });
});
