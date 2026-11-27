import isPlainObject from "./isPlainObject";
/** whether a value of the translation resources is a text */
const isText = (value) => typeof value === "string" || typeof value === "number";
/**
 * The strings in what `t(key, { returnObjects: true })` returned, as a list
 * to show or spread into one, e.g. into the `labels` of a HowToBox next to
 * entries of the app's own, such as a `<Trans>` with a link.
 *
 * - An array gives its strings, in order.
 * - An object gives the strings among its values, in its key order, so a
 *   keyed list (`"steps": { "download": "…", "upload": "…" }`) works like
 *   an array.
 * - A string gives itself as the only entry. A missing key is a string,
 *   the key itself, as `t` returns it, so it shows once instead of one
 *   entry per character.
 * - A number gives its text, as one entry or as an entry of an array or
 *   object.
 *
 * Nested groups (an array or object inside the array or object) and any
 * other value give no entries, so a key that names the parent of a group
 * (`"import"` instead of `"import.steps"`) gives only the parent's own
 * strings. Empty strings are kept; HowToBox skips them.
 *
 * Interpolation values and other options go to `t` itself: i18next
 * interpolates every string of the array or object.
 *
 * @param value What `t(key, { returnObjects: true })` returned
 * @returns The strings, `[]` for none
 * @example
 * <HowToBox
 *   labels={[
 *     <Trans key={"link"} t={t} i18nKey={"how-to.link"}
 *       components={{ dl: <Link href={templateUrl} /> }} />,
 *     ...translatedStrings(t("how-to.steps", { returnObjects: true, count })),
 *   ]}
 * />
 */
const translatedStrings = (value) => {
    if (isText(value))
        return [String(value)];
    const values = Array.isArray(value)
        ? value
        : isPlainObject(value)
            ? Object.values(value)
            : [];
    return values.filter(isText).map(String);
};
export default translatedStrings;
