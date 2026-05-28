import { test } from "node:test";
import assert from "node:assert";
import { formatDuration, slugify } from "./format.js";

test("formatDuration: formats minutes less than 60", () => {
  const result = formatDuration(45);
  assert.strictEqual(result, "45 min");
});

test("formatDuration: formats exact hours", () => {
  const result = formatDuration(120);
  assert.strictEqual(result, "2 hr");
});

test("formatDuration: formats hours and minutes", () => {
  const result = formatDuration(90);
  assert.strictEqual(result, "1 hr 30 min");
});

test("slugify: converts text to URL-friendly slugs", () => {
  const result = slugify("Hello World!");
  assert.strictEqual(result, "hello-world");
});

test("slugify: trims trailing hyphens and handles special characters", () => {
  const result = slugify("---Learn DevOps 101!!---");
  assert.strictEqual(result, "learn-devops-101");
});
