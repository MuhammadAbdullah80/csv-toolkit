"use strict";

/**
 * Serialises rows back to RFC 4180 CSV, quoting only the cells that need it.
 */

/**
 * Quotes a single cell if it contains the delimiter, a quote, or a newline.
 *
 * @param {unknown} value
 * @param {string} delimiter
 * @returns {string}
 */
function escapeCell(value, delimiter) {
  const text = value === null || value === undefined ? "" : String(value);
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || text.includes("\n") || text.includes("\r");
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Turns an array of row arrays into CSV text.
 *
 * @param {unknown[][]} rows
 * @param {{delimiter?: string, eol?: string}} [options]
 * @returns {string}
 */
function stringifyRows(rows, options = {}) {
  const delimiter = options.delimiter ?? ",";
  const eol = options.eol ?? "\n";
  return rows.map((row) => row.map((cell) => escapeCell(cell, delimiter)).join(delimiter)).join(eol);
}

/**
 * Turns an array of objects into CSV text with a header row. Columns are the
 * union of every object's keys, in first-seen order, so sparse records line up.
 *
 * @param {Record<string, unknown>[]} records
 * @param {{delimiter?: string, eol?: string, columns?: string[]}} [options]
 * @returns {string}
 */
function stringifyObjects(records, options = {}) {
  const columns = options.columns ?? [...new Set(records.flatMap((r) => Object.keys(r)))];
  const rows = [columns, ...records.map((record) => columns.map((name) => record[name]))];
  return stringifyRows(rows, options);
}

module.exports = { stringifyRows, stringifyObjects, escapeCell };
