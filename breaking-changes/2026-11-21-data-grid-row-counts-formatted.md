# The DataGrid footer formats its row counts for the language

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` and the grids built on it that show its footer (`BackendDataGrid`, `CRUD`); the `standalone.data-grid.footer.total` and `.filtered` translation keys

## What changed

- The footer's row counts group their digits the way the current language of the
  components-care i18n instance does: "Filtered: 1,234 Total: 12,345" in English,
  "Gefiltert: 1.234 Gesamt: 12.345" in German, "Filtré : 1 234 Total : 12 345" in French,
  instead of "Filtered: 1234 Total: 12345". The short form on phones too: "#1,234/12,345".
  Spanish and Italian group from five digits on ("1234", "12.345"), as their locale data says.
- Each text is one translation with placeholders, in every locale:
  `standalone.data-grid.footer.counts` (`"Total: {{TOTAL}}"`) and
  `standalone.data-grid.footer.counts-filtered` (`"Filtered: {{FILTERED}} Total: {{TOTAL}}"`).
  French puts a no-break space before the colon, and Russian says "Всего" instead of "Общий".
- The keys `standalone.data-grid.footer.total` and `standalone.data-grid.footer.filtered`
  are removed from every locale.

## Why

Large counts were hard to read without digit grouping, and the text was joined from two
translated words and the raw numbers in English order, so a language could neither reorder
it nor set its own spacing.

## Migration

Nothing to do; expect the grouped counts in screenshots and in tests that read the footer
text of a grid with 1000 rows or more ("Total: 1,234"). An app that overrides
`standalone.data-grid.footer.total` or `.filtered` in the components-care i18n instance: the
overrides no longer have an effect; override `counts` and `counts-filtered` instead, with
the `{{TOTAL}}` and `{{FILTERED}}` placeholders.
