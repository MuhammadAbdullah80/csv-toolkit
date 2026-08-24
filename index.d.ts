/** Options accepted by the parsing functions. */
export interface ParseOptions {
  /** Field separator. Must be a single character. Defaults to `","`. */
  delimiter?: string;
  /** Retain a leading UTF-8 BOM instead of stripping it. Defaults to `false`. */
  keepBom?: boolean;
}

/** Options accepted by the stringifying functions. */
export interface StringifyOptions {
  /** Field separator. Defaults to `","`. */
  delimiter?: string;
  /** Row terminator. Defaults to `"\n"`. */
  eol?: string;
  /** Pin the header order instead of deriving it from the records. */
  columns?: string[];
}

/**
 * Splits CSV text into rows of raw string cells.
 *
 * @throws {TypeError} if `input` is not a string, or `delimiter` is not exactly
 *   one character
 */
export function parseRows(input: string, options?: ParseOptions): string[][];

/**
 * Parses CSV with a header row into objects keyed by column name. Missing
 * trailing cells become empty strings. Returns `[]` for empty input.
 */
export function parseObjects(
  input: string,
  options?: ParseOptions,
): Record<string, string>[];

/** Serialises rows to CSV, quoting only the cells that require it. */
export function stringifyRows(
  rows: readonly unknown[][],
  options?: StringifyOptions,
): string;

/**
 * Serialises objects to CSV with a header row. Columns default to the union of
 * every record's keys, in first-seen order.
 */
export function stringifyObjects(
  records: readonly Record<string, unknown>[],
  options?: StringifyOptions,
): string;
