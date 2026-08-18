# Breaking changes

Backward compatibility is **not** a requirement in this library — prefer the clean
API over a compatible one. In exchange, every breaking change gets recorded here so
the consuming apps know what to adjust when they bump.

One file per change, so this never grows into a single unreadable log.

## Conventions

- File name: `YYYY-MM-DD-<slug>.md`, using the date the change landed.
- Newest first in the index below.
- **Behavioral** changes count, not just type changes. Record it if consumers could
  be surprised: new UI rendered by default, a changed default value, or a prop that
  was previously ignored starting to take effect.
- Each entry states **what changed**, **why**, and the **migration** step — even if
  the migration is "nothing to do, but expect the new footer in screenshots".

## Index

| Date       | Change                                                                                                         | Kind     |
| ---------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| 2026-08-18 | [additionalOptions moved out of the load path](2026-08-18-additional-options-outside-load-path.md)             | behavior |
| 2026-08-18 | [Selector load handlers must return a load result object](2026-08-18-selector-load-handler-contract.md)        | type     |
| 2026-08-18 | [Backend selectors show a truncation notice by default](2026-08-18-selector-truncation-notice.md)              | behavior |
| 2026-08-18 | [MultiSelectWithTags now honors forceQuery](2026-08-18-multi-select-with-tags-force-query.md)                  | behavior |
| 2026-08-18 | ["Start typing to search" is gated on forceQuery, not on lru](2026-08-18-selector-start-typing-text-gating.md) | behavior |
