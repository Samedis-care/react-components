# HowToBoxTranslate is removed; `translatedStrings` turns a translated list into entries

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `standalone/HowToBox` (`HowToBoxTranslate`, `HowToBoxTranslateProps`), `utils`
  (`translatedStrings`, new)

## What changed

`HowToBoxTranslate` and its props type `HowToBoxTranslateProps` no longer exist. They are
gone from `standalone/HowToBox` and from the package root. `HowToBox` itself is unchanged.

The new helper `translatedStrings(value)`, exported from the package root, turns what
`t(key, { returnObjects: true })` returned into a `string[]`:

- an array gives its strings, an object the strings among its values in key order;
- a string gives itself as the only entry, so a missing key (which `t` returns as the key)
  shows once instead of one entry per character;
- a number gives its text;
- nested groups and any other value give no entries, instead of crashing the render.

## Why

`HowToBoxTranslate` passed nothing but `returnObjects` to `t`: no interpolation values, no
markup, and no rich entry next to the translated ones, so a how-to with a download link could
not use it. Its `titleLabel` and `labels` were translation keys, unlike the same props of
`HowToBox`. An app now translates with its own `t` and passes the result to `HowToBox`, as to
any MUI component; `translatedStrings` makes the step from a translated list to entries safe.

## Migration

**Required for every app that imports `HowToBoxTranslate` or `HowToBoxTranslateProps`.**
Without this change, the import fails to compile, and the component is `undefined` at runtime,
so React throws ("Element type is invalid") where the box would render.

Translate the title and the entries with the app's own `t` and render `HowToBox`:

```tsx
// before
<HowToBoxTranslate t={t} titleLabel={"how-to.title"} labels={"how-to.steps"} />
// now
<HowToBox
	titleLabel={t("how-to.title")}
	labels={translatedStrings(t("how-to.steps", { returnObjects: true }))}
/>
```

An omitted `titleLabel` still shows the default "How it works", and `null` or `""` none.

Recommended for every app that spreads or casts the result of `t(key, { returnObjects: true })`
into a list (`...(t(key, { returnObjects: true }) as string[])`): a key that holds an object
throws there, and a missing key becomes one entry per character. Use the helper instead; options
such as interpolation values go to `t`, and rich entries mix freely:

```tsx
<HowToBox
	labels={[
		<Trans
			key={"link"}
			t={t}
			i18nKey={"how-to.link"}
			components={{ dl: <Link href={templateUrl} /> }}
		/>,
		...translatedStrings(t("how-to.steps", { returnObjects: true, count })),
	]}
/>
```
