import { test } from "node:test";
import assert from "node:assert";
import { hashToInt } from "./hashToInt.js";

test("hashToInt: converts first 8 hex characters of a UUID to integer", () => {
  const uuid = "e8a8ff75-8224-4003-873f-1285f757769f";
  const result = hashToInt(uuid);
  
  // "e8a8ff75" in base 16 is 3903389557
  const expected = parseInt("e8a8ff75", 16);
  
  assert.strictEqual(result, expected);
});

test("hashToInt: strips hyphens correctly", () => {
  const result = hashToInt("1-2-3-4-5-6-7-8-a-b-c-d");
  const expected = parseInt("12345678", 16);
  assert.strictEqual(result, expected);
});
