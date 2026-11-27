import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface CurrencyInputProps extends TextFieldWithHelpProps {
    /**
     * The currency of the amount, an ISO 4217 code (`"EUR"`, `"JPY"`). It sets
     * how the amount is shown and the decimals it is rounded to on commit: 2 for
     * EUR, 0 for JPY. A well-formed code `Intl` doesn't know (`"XYZ"`) is shown
     * as the code, with two decimals.
     *
     * A currency that `Intl` rejects does not throw, and is reported (see
     * `disableErrorReporting`):
     * - a text that is not three letters (`"EURO"`, `"€"`) is shown as if it
     *   were a code, where the language puts one ("EURO 1,234.50" in en,
     *   "1.234,50 EURO" in de);
     * - a missing one (`""`, or `undefined` or `null` from untyped data) leaves
     *   the currency out: the plain amount ("1,234.50").
     *
     * Both round to two decimals, and the field reads back the text it shows.
     */
    currency: string;
    /**
     * The current value or null if not set
     */
    value: number | null;
    /**
     * Called once on the blur after the user edited the text, with the amount
     * rounded to the currency's minor units, or `null` for an emptied field
     * (nothing but the currency symbol left counts as empty).
     * Enter after an edit calls it too, before a form around the field submits:
     * the field then shows the amount the parent keeps, as after a blur, and
     * the next blur calls it only after a further edit.
     * Typing does not call it, emptying the field and the touch Clear button
     * included, and neither does a blur or Enter without an edit. `onBlur`, if
     * given, runs first on a blur. Not called when the text is no number
     * (`"abc"`, `"-"`, `"."`): the field keeps the previous amount and shows a
     * message in place of `helperText` until a valid edit or a new `value`,
     * `currency` or language.
     * @param evt The last change event of the edit, not the blur or keydown event
     * @param value The amount, or `null` for an empty field
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
    /**
     * Don't report a currency that `Intl` rejects (see `currency`), for an
     * amount whose currency may be missing on purpose.
     *
     * By default (`false`) each CurrencyInput reports it once while it shows an
     * amount, not again on a re-render with the same currency: to the error
     * reporter (source "CurrencyInput", extra `{ style: "currency", currency }`;
     * Sentry unless the app calls `configureErrorReporting`) and through
     * `console.error`. With `true` it does neither; the field is the same.
     */
    disableErrorReporting?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
