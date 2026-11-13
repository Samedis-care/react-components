import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect } from "react";
import { GlobalStyles } from "@mui/material";
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
 * Whether the page runs on iOS or iPadOS, where WebKit zooms into a focused
 * text field whose font size is below 16px. iPadOS 13 and later report
 * "MacIntel" like a Mac, but with touch points.
 */
const isIOS = () => /iPhone|iPod|iPad/.test(navigator.platform) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
/** The input types that take no typing and open no picker */
const NON_TEXT_INPUT_TYPES = [
    "button",
    "checkbox",
    "color",
    "file",
    "hidden",
    "image",
    "radio",
    "range",
    "reset",
    "submit",
];
/**
 * Text fields: inputs that take typing or open a picker, selects, textareas
 * and contenteditable elements. `[contenteditable]` matches "false" too: a
 * MUI X date field's section list is contenteditable="false" while one
 * section is edited, so it and its separators get the sections' size.
 */
const TEXT_FIELDS = [
    "input" + NON_TEXT_INPUT_TYPES.map((type) => `:not([type=${type}])`).join(""),
    "select",
    "textarea",
    "[contenteditable]",
].join(", ");
/**
 * Gives every text field the font size it inherits, but at least 16px, so
 * focusing one does not zoom the page on iOS. `!important`, as it has to win
 * over a font size set on the field element itself.
 */
const iosTextFieldFontSize = (_jsx(GlobalStyles, { styles: { [TEXT_FIELDS]: { fontSize: "max(16px, 1em) !important" } } }));
/**
 * Sets `width` (`minWidth` or `device-width`) and `initial-scale=1` in the
 * page's `<meta name="viewport">`. Every other directive of the meta, such as
 * `viewport-fit` or `interactive-widget`, stays as the page wrote it; it adds
 * no zoom restriction (`maximum-scale`, `user-scalable`) of its own. Without a
 * viewport meta, it appends one to `<head>`. Writes on mount and whenever
 * `minWidth` changes.
 *
 * On iOS and iPadOS (`navigator.platform`), where WebKit zooms the page into
 * a focused text field whose font size is below 16px, it also renders a
 * global style: text fields (inputs that take typing or open a picker,
 * selects, textareas, contenteditable elements such as the sections of a
 * MUI X date field) get the font size they inherit, but at least 16px. It
 * takes precedence over a font size set on the field element itself, such
 * as a theme's `MuiInputBase` `input` override; a size above 16px set on the
 * field's container (`MuiInputBase` `root`, `slotProps.input`) is kept.
 * Elsewhere it renders nothing.
 *
 * On unmount it puts back the content the meta had before it mounted, or
 * removes the meta it appended, and removes the style. Each `minWidth` change
 * starts from that content too, so a change another script made to the meta
 * while it was mounted does not survive a `minWidth` change or the unmount.
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
    return isIOS() ? iosTextFieldFontSize : null;
};
export default React.memo(MobileScalingFix);
