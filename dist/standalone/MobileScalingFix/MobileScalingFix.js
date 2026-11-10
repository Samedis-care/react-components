import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect } from "react";
/**
 * One directive of a viewport meta's content: a name, optionally followed by
 * "=" and a value. Commas, semicolons and whitespace separate directives, and
 * spaces may surround the "=", as browsers read them.
 */
const VIEWPORT_DIRECTIVE = /([^\s,;=]+)(?:\s*=[\s=]*([^\s,;=]*))?/g;
/**
 * Sets the given directives in a viewport meta's content and keeps all
 * others. A directive the content already has (its name matched
 * case-insensitively) is replaced where it first appears, and a repeat of it
 * is dropped; one it lacks is appended.
 * @param content The meta's current content
 * @param directives The values to set, by lower-case directive name
 * @returns The new content, its directives separated by ", "
 */
const setViewportDirectives = (content, directives) => {
    const written = new Set();
    const parts = [];
    for (const [, name, value] of content.matchAll(VIEWPORT_DIRECTIVE)) {
        const key = name.toLowerCase();
        const newValue = directives.get(key);
        if (newValue === undefined) {
            parts.push(value === undefined ? name : `${name}=${value}`);
        }
        else if (!written.has(key)) {
            parts.push(`${key}=${newValue}`);
            written.add(key);
        }
    }
    directives.forEach((newValue, key) => {
        if (!written.has(key))
            parts.push(`${key}=${newValue}`);
    });
    return parts.join(", ");
};
/**
 * Sets `width` (`minWidth` or `device-width`) and `initial-scale=1` in the
 * page's `<meta name="viewport">`, plus `maximum-scale=1` when
 * `navigator.platform` contains "iPhone" or "iPod". Every other directive of
 * the meta, such as `viewport-fit` or `interactive-widget`, stays as the page
 * wrote it. Without a viewport meta, it appends one to `<head>`. Writes on
 * mount and whenever `minWidth` changes; renders nothing.
 *
 * On unmount it puts back the content the meta had before it mounted, or
 * removes the meta it appended. Each `minWidth` change starts from that
 * content too, so a change another script made to the meta while it was
 * mounted does not survive a `minWidth` change or the unmount.
 *
 * Framework renders it for the app (`disableMobileScalingFix`,
 * `mobileScalingFixProps`).
 */
const MobileScalingFix = (props) => {
    const { minWidth } = props;
    useEffect(() => {
        const pageMeta = document.querySelector("meta[name='viewport']");
        const directives = new Map([
            ["width", minWidth ? minWidth.toFixed() : "device-width"],
            ["initial-scale", "1"],
        ]);
        if (["iPhone", "iPod"].find((device) => navigator.platform.includes(device))) {
            directives.set("maximum-scale", "1"); // prevent scaling in on inputs
        }
        const meta = pageMeta ?? document.createElement("meta");
        if (!pageMeta) {
            meta.name = "viewport";
            document.head.appendChild(meta);
        }
        const previousContent = meta.content;
        meta.content = setViewportDirectives(previousContent, directives);
        return () => {
            if (pageMeta)
                meta.content = previousContent;
            else
                meta.remove();
        };
    }, [minWidth]);
    return _jsx(_Fragment, {});
};
export default React.memo(MobileScalingFix);
