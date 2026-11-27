import React, { useCallback, useId, useMemo, useState } from "react";
import {
	Grid,
	IconButton,
	InputAdornment,
	styled,
	TextFieldProps,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import useCCTranslations, {
	useCCLanguagesTranslations,
} from "../../../utils/useCCTranslations";
import { useCurrentLanguage } from "../../../utils/useCurrentLocale";
import { Translate } from "@mui/icons-material";
import { TextFieldCC } from "../MuiFieldState";
import focusRing from "../../../utils/internal/focusRing";
import visuallyHidden from "../../../utils/internal/visuallyHidden";
import uniqueArray from "../../../utils/uniqueArray";

// src/assets/data/languages.json
export type MultiLanguageInputSupportedLanguages =
	| "aa"
	| "ab"
	| "ae"
	| "af"
	| "ak"
	| "am"
	| "an"
	| "ar"
	| "as"
	| "av"
	| "ay"
	| "az"
	| "ba"
	| "be"
	| "bg"
	| "bi"
	| "bm"
	| "bn"
	| "bo"
	| "br"
	| "bs"
	| "ca"
	| "ce"
	| "ch"
	| "co"
	| "cr"
	| "cs"
	| "cu"
	| "cv"
	| "cy"
	| "da"
	| "de"
	| "dv"
	| "dz"
	| "ee"
	| "el"
	| "en"
	| "eo"
	| "es"
	| "et"
	| "eu"
	| "fa"
	| "ff"
	| "fi"
	| "fj"
	| "fo"
	| "fr"
	| "fy"
	| "ga"
	| "gd"
	| "gl"
	| "gn"
	| "gu"
	| "gv"
	| "ha"
	| "he"
	| "hi"
	| "ho"
	| "hr"
	| "ht"
	| "hu"
	| "hy"
	| "hz"
	| "ia"
	| "id"
	| "ie"
	| "ig"
	| "ii"
	| "ik"
	| "io"
	| "is"
	| "it"
	| "iu"
	| "ja"
	| "jv"
	| "ka"
	| "kg"
	| "ki"
	| "kj"
	| "kk"
	| "kl"
	| "km"
	| "kn"
	| "ko"
	| "kr"
	| "ks"
	| "ku"
	| "kv"
	| "kw"
	| "ky"
	| "la"
	| "lb"
	| "lg"
	| "li"
	| "ln"
	| "lo"
	| "lt"
	| "lu"
	| "lv"
	| "mg"
	| "mh"
	| "mi"
	| "mk"
	| "ml"
	| "mn"
	| "mr"
	| "ms"
	| "mt"
	| "my"
	| "na"
	| "nb"
	| "nd"
	| "ne"
	| "ng"
	| "nl"
	| "nn"
	| "no"
	| "nr"
	| "nv"
	| "ny"
	| "oc"
	| "oj"
	| "om"
	| "or"
	| "os"
	| "pa"
	| "pi"
	| "pl"
	| "ps"
	| "pt"
	| "qu"
	| "rm"
	| "rn"
	| "ro"
	| "ru"
	| "rw"
	| "sa"
	| "sc"
	| "sd"
	| "se"
	| "sg"
	| "sh"
	| "si"
	| "sk"
	| "sl"
	| "sm"
	| "sn"
	| "so"
	| "sq"
	| "sr"
	| "ss"
	| "st"
	| "su"
	| "sv"
	| "sw"
	| "ta"
	| "te"
	| "tg"
	| "th"
	| "ti"
	| "tk"
	| "tl"
	| "tn"
	| "to"
	| "tr"
	| "ts"
	| "tt"
	| "tw"
	| "ty"
	| "ug"
	| "uk"
	| "ur"
	| "uz"
	| "ve"
	| "vi"
	| "vo"
	| "wa"
	| "wo"
	| "xh"
	| "yi"
	| "yo"
	| "za"
	| "zh"
	| "zu";

export type MultiLanguageInputProps = Omit<
	TextFieldProps,
	| "value"
	| "onChange"
	| "onBlur"
	| "InputProps"
	| "label"
	| "name"
	| "required"
	| "fullWidth"
> & {
	/**
	 * The languages that can be edited: the default language first, then the
	 * others in this order. The default language is `defaultLanguage` when it is
	 * in this list; otherwise the components-care UI language when it is in this
	 * list and `ignoreI18nLocale` is not set; otherwise the first entry. It is
	 * the labelled and required field, and it follows later changes of these
	 * props and of the UI language.
	 *
	 * In single-line mode the other languages' fields are shown below the
	 * default one while the translate button is pressed. Until the user presses
	 * it or types, they are also shown while the default language has no text
	 * and another language has, so a text kept in another language is not
	 * hidden. In multiline mode the textarea shows the default language until
	 * another language's button below it is pressed, and again when that
	 * language is no longer in this list.
	 *
	 * A language listed twice is shown once, at its first position. While the
	 * list is empty, e.g. while an app loads its languages, the field shows
	 * disabled with its label (and the asterisk of `required`), without a
	 * language code, translate button or language buttons, until a language
	 * arrives.
	 */
	enabledLanguages: MultiLanguageInputSupportedLanguages[];
	/**
	 * The language the record has to be filled in, e.g. the language its
	 * backend keeps the main text in: the default language, whatever the UI
	 * language. Its field is shown first, labelled and marked `required` for
	 * every viewer. Ignored while it is `null` or `undefined` or not in
	 * `enabledLanguages`; the default language is then the UI language or
	 * `enabledLanguages[0]` (see `enabledLanguages`). Wins over
	 * `ignoreI18nLocale`.
	 * @default undefined
	 */
	defaultLanguage?: MultiLanguageInputSupportedLanguages | null;
	/**
	 * Make `enabledLanguages[0]` the default language instead of the UI
	 * language. `defaultLanguage` wins over it.
	 * @default false
	 */
	ignoreI18nLocale?: boolean;
	/**
	 * The text per language, keyed by language code, e.g.
	 * `{ en: "Pump", de: "Pumpe" }`. Use `{}` for no text; must not be `null`
	 * or `undefined`. A language without a key (or with `null`) shows an empty
	 * field. Keys of languages that are not in `enabledLanguages` are kept by
	 * `onChange`.
	 */
	values: Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
	/**
	 * Change event
	 * @param newValues New values
	 */
	onChange: (
		newValues: Partial<Record<MultiLanguageInputSupportedLanguages, string>>,
	) => void;
	/**
	 * Label of the default language's field (single-line) or of the textarea
	 * (multiline), and the name of the group around all language fields. Each
	 * field is named with the label and its language, e.g. "Title (German)":
	 * the labelled field reads the language with its label (visually hidden),
	 * the other languages' fields, which show only their code, carry the name as
	 * `aria-label`. Without a label each field is named with its language only.
	 * In single-line mode the toggle is named and tooltipped after the label,
	 * e.g. "Show translations of Title"; without a label it keeps the generic
	 * name.
	 */
	label?: string;
	/**
	 * Disable red translate icon if translation is incomplete
	 */
	disableIncompleteMarker?: boolean;
	/**
	 * Name of the control (used for form engine)
	 */
	name?: string;
	/**
	 * Marks the default language's field as required: an asterisk after the
	 * label and the native `required` attribute (in multiline mode while the
	 * default language is shown). Display only, like MUI's `required`: nothing
	 * is validated. Pair it with a validator that checks the same language,
	 * e.g. `validateLocalizedPresenceFor([language])` with `defaultLanguage`
	 * set to that language; without `defaultLanguage` the required field is the
	 * viewer's UI language, which differs from viewer to viewer.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Blur event handler
	 */
	onBlur?: React.FocusEventHandler;
	/**
	 * Display error
	 */
	error?: boolean;
	/**
	 * Display warning
	 */
	warning?: boolean;
	/**
	 * Does the value differ from the server-side value?
	 * @remarks Presentational only; set by the form engine from `RenderParams.dirty`.
	 */
	dirty?: boolean;
};

/**
 * The `ownerState` of the `languageLabel` theme slot (a language button below
 * a multiline field).
 */
export interface MultiLanguageInputLanguageLabelOwnerState {
	/** The button's language is the one the textarea edits (pressed) */
	active: boolean;
}

/** The language buttons below a multiline field */
const LanguageSwitcher = styled(ToggleButtonGroup, {
	name: "CcMultiLanguageInput",
	slot: "languageSwitcher",
})(({ theme }) => ({
	flexWrap: "wrap",
	marginTop: theme.spacing(0.5),
}));

/** One language button of the multiline switcher, showing the language code */
const LanguageLabel = styled(ToggleButton, {
	name: "CcMultiLanguageInput",
	slot: "languageLabel",
})<{ ownerState: MultiLanguageInputLanguageLabelOwnerState }>(({ theme }) => ({
	// compact (about 29px high), the codes in the case they are written in
	padding: theme.spacing(0.25, 1),
	minWidth: 32,
	textTransform: "none",
	// inside the button: its neighbours overlap its border
	"&.Mui-focusVisible": focusRing(theme, -2),
}));

/**
 * The translate button of a single-line field. MUI shows its keyboard focus
 * only as a faint ripple, which forced colors drop, so it draws the library's
 * focus ring (MUI's own when the theme sets `focusVisible`).
 */
const TranslateButton = styled(IconButton)(({ theme }) => ({
	"&.Mui-focusVisible": focusRing(theme, 0),
}));

/**
 * Whether a language's text is more than whitespace
 * @param text The language's entry in `values`
 */
const hasText = (text: string | null | undefined) => !!text?.trim();

/** The field's language name, read with its label but not shown */
const LabelLanguageName = styled("span")(visuallyHidden);

const LanguageLabelInputAdornment = styled(Typography, {
	name: "CcMultiLanguageInput",
	slot: "languageLabelInputAdornment",
})({});

/**
 * Groups the other languages' fields for the toggle's `aria-controls`.
 * `display: contents` keeps the fields the grid items of the container, so
 * the wrapper takes no space of its own while it is empty and the expanded
 * fields keep the spacing they have.
 */
const OtherLanguages = styled("div")({
	display: "contents",
});

/**
 * Theme slots of `CcMultiLanguageInput`:
 * - `languageSwitcher`: the group of language buttons below a multiline field
 *   (a `ToggleButtonGroup`);
 * - `languageLabel`: one language button of that group (a `ToggleButton`,
 *   gets {@link MultiLanguageInputLanguageLabelOwnerState});
 * - `languageLabelInputAdornment`: the code adornment of a single-line field.
 */
export type MultiLanguageInputClassKey =
	"languageSwitcher" | "languageLabel" | "languageLabelInputAdornment";

const MultiLanguageInput = (inProps: MultiLanguageInputProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiLanguageInput" });
	const {
		enabledLanguages,
		values,
		onChange,
		name,
		onBlur,
		label,
		disableIncompleteMarker,
		required,
		defaultLanguage: recordLanguage,
		ignoreI18nLocale,
		warning,
		dirty,
		autoFocus,
		...textFieldProps
	} = props;
	const { t } = useCCLanguagesTranslations();
	const { t: tCC } = useCCTranslations();
	const language = useCurrentLanguage();
	// a language listed twice gets one field (and one button)
	const languages = useMemo(
		() => uniqueArray(enabledLanguages),
		[enabledLanguages],
	);

	// determine default language: the record's, the UI's, the first enabled;
	// null while no language is enabled, which shows a disabled field
	const i18nLang = language as MultiLanguageInputSupportedLanguages;
	const defaultLanguage: MultiLanguageInputSupportedLanguages | null =
		recordLanguage && languages.includes(recordLanguage)
			? recordLanguage
			: !ignoreI18nLocale && languages.includes(i18nLang)
				? i18nLang
				: (languages[0] ?? null);

	// single-line: whether the other languages' fields are shown, fixed once
	// the user presses the translate button or types; null before that
	const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
	// until then they are shown while only other languages have text, so a
	// text kept in another language is not hidden behind the toggle
	const onlyOthersFilled =
		!hasText(defaultLanguage && values[defaultLanguage]) &&
		languages.some((lng) => lng !== defaultLanguage && hasText(values[lng]));
	const expanded = userExpanded ?? onlyOthersFilled;
	// the language code clicked in the multiline label, null until one is
	const [pickedLanguage, setPickedLanguage] =
		useState<MultiLanguageInputSupportedLanguages | null>(null);
	// the language the multiline textarea edits: the picked one while it is
	// enabled, otherwise (and in single-line mode) the default language
	const activeLanguage =
		textFieldProps.multiline &&
		pickedLanguage &&
		languages.includes(pickedLanguage)
			? pickedLanguage
			: defaultLanguage;
	const toggleExpanded = useCallback(
		() => setUserExpanded((prev) => !(prev ?? onlyOthersFilled)),
		[onlyOthersFilled],
	);
	// names the fields the toggle shows, for its aria-controls; unique per
	// instance, so two fields on a form don't claim the same id
	const otherLanguagesId = useId();
	// the toggle says which field it belongs to: a form with a localized title
	// and description has two buttons that would otherwise read the same
	const toggleLabel = label
		? tCC("standalone.uikit.multi-language-input.show-translations-of", {
				label,
			})
		: tCC("standalone.uikit.multi-language-input.toggle-languages");

	const incomplete =
		!textFieldProps.disabled &&
		!disableIncompleteMarker &&
		languages.map((lng) => (values[lng] ?? "").trim()).find((e) => !e) != null;

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const nameSplit = evt.target.name.split("-");
			const lang = nameSplit[
				nameSplit.length - 1
			] as MultiLanguageInputSupportedLanguages;
			if (!languages.includes(lang)) {
				throw new Error("Language not supported");
			}
			const newValue = {
				...values,
				[lang]: evt.target.value,
			};
			if (!evt.target.value) delete newValue[lang];
			// the fields stay as they are while the user types: emptying the
			// default language does not show the others, filling it does not
			// hide them
			setUserExpanded((prev) => prev ?? onlyOthersFilled);
			onChange(newValue);
		},
		[languages, onChange, values, onlyOthersFilled],
	);

	const getLanguageName = (lang: string) =>
		[
			t(lang, {
				defaultValue: "",
			}),
			lang !== i18nLang && t(lang + "-native", { defaultValue: "" }),
		]
			.filter((e) => e)
			.join(" ");

	const handleLanguageSwitch = useCallback(
		(
			_evt: React.MouseEvent<HTMLElement>,
			lang: MultiLanguageInputSupportedLanguages | null,
		) => {
			// null: the pressed button was pressed again, which keeps its language
			if (lang) setPickedLanguage(lang);
		},
		[],
	);

	// a field's language in the UI language, e.g. "German"
	const getFieldLanguageName = (
		lang: MultiLanguageInputSupportedLanguages | null,
	) => (lang ? t(lang, { defaultValue: lang }) : "");

	// the default language's field and the textarea show the label; the other
	// languages' fields show only their code, so their name is an aria-label
	const showsLabel = (lang: MultiLanguageInputSupportedLanguages | null) =>
		!!label && (!!textFieldProps.multiline || lang === defaultLanguage);

	// lang null: no language is enabled, so the field is shown disabled, with
	// nothing to name it after, save to or switch to
	const renderLanguage = (
		lang: MultiLanguageInputSupportedLanguages | null,
		focus: boolean,
	) => (
		<TextFieldCC
			{...textFieldProps}
			disabled={lang ? textFieldProps.disabled : true}
			warning={warning}
			dirty={dirty}
			autoFocus={focus}
			fullWidth
			label={
				showsLabel(lang) ? (
					<>
						{label}
						{lang && (
							<LabelLanguageName>
								{" "}
								({getFieldLanguageName(lang)})
							</LabelLanguageName>
						)}
					</>
				) : undefined
			}
			required={
				defaultLanguage === lang && activeLanguage === defaultLanguage
					? required
					: undefined
			}
			value={(lang && values[lang]) ?? ""}
			onChange={lang ? handleChange : undefined}
			name={lang ? `${name ?? "mli"}-${lang}` : undefined}
			slotProps={{
				inputLabel: {
					...textFieldProps.slotProps?.inputLabel,
					shrink: textFieldProps.multiline
						? true
						: ((textFieldProps.slotProps?.inputLabel as Record<string, unknown>)
								?.shrink as boolean | undefined),
				},
				htmlInput: showsLabel(lang)
					? undefined
					: {
							"aria-label": label
								? `${label} (${getFieldLanguageName(lang)})`
								: getFieldLanguageName(lang) || undefined,
						},
				input: {
					startAdornment:
						lang && !textFieldProps.multiline ? (
							<InputAdornment position={"start"}>
								<Tooltip title={getLanguageName(lang)}>
									<LanguageLabelInputAdornment
										variant={"caption"}
										color={"textSecondary"}
									>
										{lang}
									</LanguageLabelInputAdornment>
								</Tooltip>
							</InputAdornment>
						) : undefined,
					endAdornment:
						lang && lang === defaultLanguage && !textFieldProps.multiline ? (
							<InputAdornment position={"end"}>
								<Tooltip title={toggleLabel}>
									<TranslateButton
										onClick={toggleExpanded}
										size="large"
										aria-label={toggleLabel}
										aria-expanded={expanded}
										aria-controls={otherLanguagesId}
									>
										<Translate
											color={
												expanded ? "primary" : incomplete ? "error" : undefined
											}
										/>
									</TranslateButton>
								</Tooltip>
							</InputAdornment>
						) : undefined,
				},
			}}
		/>
	);

	return (
		<Grid
			container
			spacing={2}
			data-name={name}
			onBlur={onBlur}
			role="group"
			aria-label={label || undefined}
		>
			<Grid size={12}>
				{renderLanguage(
					textFieldProps.multiline ? activeLanguage : defaultLanguage,
					!!autoFocus,
				)}
				{textFieldProps.multiline && defaultLanguage && (
					<LanguageSwitcher
						exclusive
						size="small"
						value={activeLanguage}
						onChange={handleLanguageSwitch}
						aria-label={
							label
								? tCC("standalone.uikit.multi-language-input.language-of", {
										label,
									})
								: tCC("standalone.uikit.multi-language-input.language")
						}
					>
						{[
							defaultLanguage,
							...languages.filter((lang) => lang !== defaultLanguage),
						].map((lang) => (
							<Tooltip key={lang} title={getLanguageName(lang)}>
								<LanguageLabel
									value={lang}
									data-lang={lang}
									ownerState={{ active: activeLanguage === lang }}
								>
									{lang}
								</LanguageLabel>
							</Tooltip>
						))}
					</LanguageSwitcher>
				)}
			</Grid>
			{!textFieldProps.multiline && (
				<OtherLanguages id={otherLanguagesId}>
					{expanded &&
						languages
							.filter((lang) => lang !== defaultLanguage)
							.map((lang) => (
								<Grid key={lang} size={12}>
									{renderLanguage(lang, false)}
								</Grid>
							))}
				</OtherLanguages>
			)}
		</Grid>
	);
};

export default React.memo(MultiLanguageInput);
