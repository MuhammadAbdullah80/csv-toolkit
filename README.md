# csv-toolkit

Dependency-free CSV parsing and stringifying for Node. Written because the
split-on-comma approach in most quick scripts silently corrupts any file with a
quoted comma in it.

## Install

Drop it in — there are no dependencies.

```js
const { parseObjects, stringifyObjects } = require("csv-toolkit");
```

## API

| Function | Purpose |
|----------|---------|
| `parseRows(text, opts?)` | CSV text → array of row arrays |
| `parseObjects(text, opts?)` | CSV text with a header row → array of objects |
| `stringifyRows(rows, opts?)` | Row arrays → CSV text |
| `stringifyObjects(records, opts?)` | Objects → CSV text with a header row |

Options: `delimiter` (default `","`), `eol` (default `"\n"`), and `columns` to
pin the header order on `stringifyObjects`.

## What it gets right

- Delimiters, newlines and CRLF inside quoted fields
- Doubled `""` unescaped to a literal quote on read, re-escaped on write
- CRLF consumed as a single row terminator, not a blank row
- A single trailing newline ignored rather than yielding a phantom row
- Cells quoted on output only when they actually need it
- Sparse objects aligned to the union of all keys, in first-seen order

## Tests

```sh
npm test
```

17 tests covering the cases above plus a round-trip through awkward content.
