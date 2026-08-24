"use strict";

/**
 * RFC 4180 CSV parser written as an explicit state machine.
 *
 * A regex-per-line approach breaks the moment a quoted field contains the
 * delimiter or a newline, so this walks the input character by character and
 * tracks whether it is currently inside quotes.
 */

/**
 * Splits CSV text into an array of row arrays.
 *
 * @param {string} input raw CSV text
 * @param {{delimiter?: string, strict?: boolean}} [options] `strict` (default
 *   true) throws on an unterminated quoted field; pass false to accept the
 *   truncated value instead
 * @returns {string[][]} rows of raw string cells
 * @throws {SyntaxError} in strict mode, when a quoted field is never closed
 */
function parseRows(input, options = {}) {
  const delimiter = options.delimiter ?? ",";
  const strict = options.strict ?? true;
  if (delimiter.length !== 1) {
    throw new TypeError(`delimiter must be a single character, got ${JSON.stringify(delimiter)}`);
  }
  if (typeof input !== "string") {
    throw new TypeError(`expected a string, got ${typeof input}`);
  }

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let fieldWasQuoted = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        // A doubled quote inside a quoted field is a literal quote.
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "") {
      inQuotes = true;
      fieldWasQuoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
      fieldWasQuoted = false;
    } else if (char === "\n" || char === "\r") {
      // Consume CRLF as one terminator rather than emitting a blank row.
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      fieldWasQuoted = false;
    } else {
      field += char;
    }
  }

  // An unclosed quote means the document ended mid-field. Silently emitting the
  // truncated value hands back data that looks complete but is not, so this is
  // reported by default.
  if (inQuotes && strict) {
    throw new SyntaxError(
      `unterminated quoted field starting at row ${rows.length + 1}, column ${row.length + 1}`,
    );
  }

  // A trailing newline leaves nothing pending; anything else is a final field.
  if (field !== "" || fieldWasQuoted || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Parses CSV with a header row into objects keyed by column name.
 *
 * @param {string} input raw CSV text, first row treated as the header
 * @param {{delimiter?: string}} [options]
 * @returns {Record<string, string>[]}
 */
function parseObjects(input, options = {}) {
  const [header, ...rows] = parseRows(input, options);
  if (!header) return [];
  return rows.map((cells) => {
    const record = {};
    header.forEach((name, i) => {
      record[name] = cells[i] ?? "";
    });
    return record;
  });
}

module.exports = { parseRows, parseObjects };
