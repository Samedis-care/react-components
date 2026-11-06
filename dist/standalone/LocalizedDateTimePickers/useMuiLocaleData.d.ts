/**
 * The MUI picker texts (`localeText`) for the current components-care language.
 * Every library language MUI ships texts for gets MUI's translation (de, en, es,
 * fr, it, nl, ru); any other (uz, which MUI has no texts for) gets English. The
 * object is MUI's own, so it stays the same while the language does.
 * @returns The `localeText` to hand to a `LocalizationProvider`
 */
declare const useMuiLocaleData: () => Partial<import("@mui/x-date-pickers").PickersLocaleText> | undefined;
export default useMuiLocaleData;
