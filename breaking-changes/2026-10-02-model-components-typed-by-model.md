# Selectors, DataGrid and CRUD are typed by their model

- **Date:** 2026-10-02
- **Kind:** type
- **Scope:** `backend-components/Selector`, `backend-components/DataGrid`, `backend-components/CRUD`, `backend-components/Form/CrudControls`, `backend-integration/Model/Types/Renderers` (the backend select renderers), `standalone/DataGrid` (the backend filters), `utils/generateLocalizedExcelImportTemplate`

## What changed

- The components and props types that took `KeyT, VisibilityT, CustomT` take the model `M`
  instead: `BackendSingleSelect`, `BackendMultiSelect`, `BackendMultipleSelect`,
  `BackendDataGridMultiSelect`, `CrudMultiSelect`, `FormCrudMultiSelect`, `FormSelectors`,
  `BackendDataGrid`, `CRUD`, the CRUD importer, the backend select renderers and
  `GridSingleSelectFilterBackend`/`GridMultiSelectFilterBackend`. The components infer it from
  `model`.
- `BackendMultiSelectWithTags`, `CrudMultiSelectWithGroups` and their renderer take
  `GroupModelT` and `DataModelT`.
- The callbacks get the model's records:
  - `modelToSelectorData` and `initialData` of the single and multi selects: `ModelRecord<M>`.
  - `convGroup`/`convData`/`initialData` of `BackendMultiSelectWithTags`: the group and data
    model's records, `getGroupDataEntries`: `ModelGetResponse<GroupModelT>`.
  - `deserializeModel` of `CrudMultiSelect`/`useCrudSelect`: `ModelRecord<M>`. `deserialize`
    still gets the connector's data.
- `UseCrudSelectParams<M, DataT>` and `UseCrudSelectResult<M, DataT>` take the model.
  `UseLazyCrudConnectorParams<ExtraT>`, `UseLazyCrudConnectorResult` and
  `useLazyCrudConnector` don't (they deal with connectors only).
- `generateLocalizedExcelImportTemplate` takes field names of the model, the CRUD importer's
  `importConfig` and `updateKey` too.
- `renderDataGridRecordUsingModel` takes any model.

## Why

The record callbacks got `Record<string, unknown>`, so a selector's conversion read every field
with a cast. With models typed by their fields (see
[Models are typed by their fields](2026-10-02-models-typed-by-their-fields.md)), they get the
records of the model they are given.

## Migration

- Drop explicit type arguments (`<KeyT, VisibilityT, CustomT, DataT>` becomes `<M, DataT>`,
  usually inferred) and type annotations of `Record<string, unknown>` on the callbacks.
- Index requests only return the fields visible in the overview: a callback that reads a field
  the overview doesn't load gets `undefined` for it, whatever `ModelRecord` says.
- A theme's default props for these components take `ModelUnknown` as the model.
