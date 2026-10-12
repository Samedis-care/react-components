# Connectors have no type parameters

- **Date:** 2026-10-02
- **Kind:** type
- **Scope:** `backend-integration/Connector` (`Connector`, `ApiConnector`, `LazyConnector`)

## What changed

- `Connector`, `ApiConnector` and `LazyConnector` have no type parameters.
- Their `model` parameters are `ModelUnknown`.
- They return `ModelGetResponse<ModelUnknown>`: what a connector returns is the server's data,
  before the model deserializes it into its records.

## Why

The type parameters only typed the `model` argument, and with models typed by their fields
(see [Models are typed by their fields](2026-10-02-models-typed-by-their-fields.md)) they
would have tied every connector to one model's field definitions.

## Migration

- `extends ApiConnector<KeyT, VisibilityT, CustomT>` becomes `extends ApiConnector`, an app's
  connector class drops the same parameters.
- `model?: Model<KeyT, VisibilityT, CustomT>` in an overriding method becomes
  `model?: ModelUnknown`, `ModelGetResponse<KeyT>` becomes `ModelGetResponse<ModelUnknown>`.
- `new LazyConnector<...>(connector, ...)` drops its type arguments.
