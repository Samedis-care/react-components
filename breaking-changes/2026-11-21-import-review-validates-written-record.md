# The import review validates the record the import writes

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** CRUD import wizard (`backend-components/CRUD/Import`): the review
  (Step3ValidateReview, `useImportStep3Logic`) and CRUD's `importValidate` (the import
  wizard's `validate`)

## What changed

The review (step 3, Validation & Review) now checks the same record the import (step 4)
writes. A conversion (an `importConfig` entry or a script typed in Connect data) that
returns `null`, `""`, `0` or `false` puts that value into the reviewed record:

- The field's validators (the model field's `validate` and its type's) check it. A required
  field (`validatePresence`) whose conversion returns `null` or `""` is now a validation
  error in the review, and Next stays disabled until the file or the conversion is fixed.
- `importValidate` gets the field with that value in its `record`.
- The review grid shows the value: `false` in a boolean column, `0` in a number column.

A result of `undefined` is still left out of the record, in the review and in the import.

Each conversion now runs once per row in the review. Before, it ran twice for every truthy
result.

## Why

The review left every falsy result out of the record it validated, while the import wrote
it. A row with an empty required value passed the review, and then the backend refused it
(the import is not transactional, so the other rows were written) or stored the record
without the value.

## Migration

Nothing to do in the apps' code: no app passes `importConfig` or `importValidate`.

For a conversion script that returns `null` or `""` for a required field: such rows now
show their error in the review instead of failing during the import. `null` and `""` are
written as they are; a conversion that means "leave this field as it is" returns
`undefined`.

An `importValidate` callback must accept `null`, `""`, `0` and `false` for any field its
`record` has.
