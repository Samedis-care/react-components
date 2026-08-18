# Selector load handlers must return a load result object

- **Date:** 2026-08-18
- **Kind:** type
- **Scope:** `standalone/Selector`, `backend-integration`

## What changed

Selector data load callbacks no longer return an array. They must return a
`BaseSelectorLoadResult<DataT>`:

```ts
export interface BaseSelectorLoadResult<DataT> {
	options: DataT[];
	/** total records matching the query; a notice is shown while it exceeds options.length */
	total?: number;
}

export type BaseSelectorLoadHandler<DataT> = (
	search: string,
	switchValue: boolean,
) => BaseSelectorLoadResult<DataT> | Promise<BaseSelectorLoadResult<DataT>>;
```

Affected props:

- `BaseSelectorProps.onLoad` (so also `SingleSelect`, `MultiSelect`, `MultiSelectWithoutGroup`)
- `MultiSelectWithoutGroupProps.loadDataOptions`
- `MultiSelectWithTagsProps.loadDataOptions`
- `MultiSelectWithTagsProps.loadGroupOptions`

`selectorLocalLoadHandler` returns the new shape too, so handlers built on it need no
change beyond how their result is read.

## Why

`onLoad` returned `DataT[]`, so the total match count that `model.index()` already
provides in its `ResponseMeta` was discarded at the selector boundary — a selector had
no way to know, let alone tell the user, that it was showing the first 25 of 312
records. See [the truncation notice entry](2026-08-18-selector-truncation-notice.md).

An array-or-object union was considered and rejected: it required a
`normalizeSelectorLoadResult` call at every boundary that post-processes options, and
made "did this source report truncation?" implicit. Requiring the object makes the
answer explicit at every call site.

## Migration

Wrap the returned array:

```ts
// before
onLoad={(query) => data.filter((e) => match(e, query))}

// after
onLoad={(query) => ({ options: data.filter((e) => match(e, query)) })}
```

For a local dataset, prefer the helper, which does prefix-before-substring matching
and dedup for you:

```ts
onLoad={selectorLocalLoadHandler(data)}
```

If you read the result of `selectorLocalLoadHandler` directly, take `.options`:

```ts
// before
const options = selectorLocalLoadHandler(data)(query);
// after
const { options } = selectorLocalLoadHandler(data)(query);
```

When wrapping another selector's load handler, `total` must keep counting the same
population as `options`. Mapping over the options is safe:

```ts
const result = await onLoad(query, switchValue);
return { ...result, options: result.options.map(markSelected) };
```

Filtering them is not — adjust `total` by however many you removed, or the selector
reports a truncation that isn't there:

```ts
const result = await onLoad(query, switchValue);
const options = result.options.filter(myFilter);
return {
	options,
	total:
		result.total != null
			? result.total - (result.options.length - options.length)
			: undefined,
};
```

Backend selectors set `total` themselves from `meta.filteredRows ?? meta.totalRows`; you
only need it for custom data sources that apply their own limit.
