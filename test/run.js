"use strict";

const assert = require("node:assert/strict");
const { parseRows, parseObjects, stringifyRows, stringifyObjects } = require("../src");

let failures = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures++;
    console.log(`FAIL  ${name}\n      ${err.message}`);
  }
}

test("parses a simple grid", () => {
  assert.deepEqual(parseRows("a,b\n1,2"), [["a", "b"], ["1", "2"]]);
});

test("keeps delimiters inside quoted fields", () => {
  assert.deepEqual(parseRows('a,"b,c",d'), [["a", "b,c", "d"]]);
});

test("keeps newlines inside quoted fields", () => {
  assert.deepEqual(parseRows('a,"line1\nline2"'), [["a", "line1\nline2"]]);
});

test("unescapes doubled quotes", () => {
  assert.deepEqual(parseRows('"she said ""hi"""'), [['she said "hi"']]);
});

test("treats CRLF as one row terminator", () => {
  assert.deepEqual(parseRows("a,b\r\nc,d"), [["a", "b"], ["c", "d"]]);
});

test("ignores a single trailing newline", () => {
  assert.deepEqual(parseRows("a,b\n"), [["a", "b"]]);
});

test("preserves an empty quoted final field", () => {
  assert.deepEqual(parseRows('a,""'), [["a", ""]]);
});

test("supports an alternate delimiter", () => {
  assert.deepEqual(parseRows("a;b", { delimiter: ";" }), [["a", "b"]]);
});

test("rejects a multi-character delimiter", () => {
  assert.throws(() => parseRows("a", { delimiter: "::" }), TypeError);
});

test("rejects non-string input", () => {
  assert.throws(() => parseRows(42), TypeError);
});

test("maps rows onto header keys", () => {
  assert.deepEqual(parseObjects("name,age\nada,36"), [{ name: "ada", age: "36" }]);
});

test("fills missing trailing cells with empty strings", () => {
  assert.deepEqual(parseObjects("a,b\n1"), [{ a: "1", b: "" }]);
});

test("returns nothing for empty input", () => {
  assert.deepEqual(parseObjects(""), []);
});

test("quotes only the cells that need it", () => {
  assert.equal(stringifyRows([["plain", "has,comma"]]), 'plain,"has,comma"');
});

test("escapes embedded quotes on the way out", () => {
  assert.equal(stringifyRows([['say "hi"']]), '"say ""hi"""');
});

test("writes a header from the union of keys", () => {
  assert.equal(stringifyObjects([{ a: 1 }, { b: 2 }]), "a,b\n1,\n,2");
});

test("round-trips awkward content unchanged", () => {
  const original = [["id", "note"], ["1", 'multi\nline, with "quotes"']];
  assert.deepEqual(parseRows(stringifyRows(original)), original);
});

if (failures > 0) {
  console.log(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nall tests passed");
