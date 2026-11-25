import React, { useMemo } from "react";
import GroupBox from "../GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";
import { TFunction } from "i18next";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

export interface HowToBoxProps {
	/**
	 * Box title label
	 */
	titleLabel?: React.ReactNode;
	/**
	 * How to entries. An array renders one list item per element; any other
	 * value renders as a single item.
	 *
	 * Entries that React renders as nothing (`undefined`, `null`, `""`, `false`
	 * and `true`) are skipped, so a conditional step (`[a, isAdmin && b, c]`)
	 * or an empty string in a translated array leaves no empty bullet. `0` is
	 * an entry and shows "0", as React renders it. An element is always an
	 * entry, even if its component renders nothing.
	 *
	 * Without entries the box renders nothing, not even its frame and title:
	 * a skipped value, an empty array and an array of skipped values hide it.
	 *
	 * A line break `"\n"` in an entry starts a new line inside the same item,
	 * which is the only way to break a line in a translated string. Other runs
	 * of white space collapse to one space, as in normal text.
	 *
	 * An entry wraps at spaces. A word wider than the entry, such as a long
	 * compound, a file name or a URL, breaks between any two characters, so it
	 * stays inside the frame and the page does not scroll sideways on a phone.
	 */
	labels: string[] | React.ReactNode[] | string | React.ReactNode | undefined;
	className?: string;
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<Record<HowToBoxClassKey, string>>;
}

/**
 * The props the root slot gets besides GroupBox's: HowToBox's `titleLabel`
 * and `labels`, so that theme `variants` can match them. They do not reach
 * the GroupBox.
 */
type HowToBoxRootProps = Pick<HowToBoxProps, "titleLabel" | "labels">;

/**
 * What MUI keeps off a root slot, plus HowToBox's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set<PropertyKey>([
	"titleLabel",
	"labels",
	"ownerState",
	"theme",
	"sx",
	"as",
	"classes",
]);

const GroupBoxStyled = styled(GroupBox, {
	name: "CcHowToBox",
	slot: "root",
	shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})<HowToBoxRootProps>({});

const UnorderedList = styled("ul", { name: "CcHowToBox", slot: "ul" })({
	paddingLeft: "1.5rem",
});

const ListItem = styled("li", { name: "CcHowToBox", slot: "li" })({
	whiteSpace: "pre-line",
	// a word wider than the entry (a German compound, a file name or a URL on
	// a phone) breaks inside, so it stays in the frame and does not widen the
	// page, also where the box sits in a flex row or a grid cell
	overflowWrap: "anywhere",
});

/**
 * Keys of the theme's `components.CcHowToBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the GroupBox `<fieldset>` frame
 * - `ul`: the list
 * - `li`: each entry. It sets `white-space: pre-line` and
 *   `overflow-wrap: anywhere`, so a word wider than the entry breaks inside
 *   it.
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. To style a box by its props, use theme `variants`, which apply to
 * the frame and reach the list and its entries through nested selectors.
 */
export type HowToBoxClassKey = "root" | "ul" | "li";

/** whether React renders the entry as nothing */
const isEmptyEntry = (entry: React.ReactNode) =>
	entry == null || typeof entry === "boolean" || entry === "";

const HowToBox = (inProps: HowToBoxProps) => {
	const props = useThemeProps({ props: inProps, name: "CcHowToBox" });
	const { titleLabel, labels, className, classes } = props;
	const { t } = useCCTranslations();

	const entries = (Array.isArray(labels) ? labels : [labels]).filter(
		(entry: React.ReactNode) => !isEmptyEntry(entry),
	);
	if (entries.length === 0) return <></>;

	return (
		<GroupBoxStyled
			titleLabel={titleLabel}
			labels={labels}
			label={titleLabel ?? t("standalone.how-it-works.title")}
			className={combineClassNames([className, classes?.root])}
		>
			<UnorderedList className={classes?.ul}>
				{entries.map((entry: React.ReactNode, i: number) => (
					<ListItem key={i} className={classes?.li}>
						{entry}
					</ListItem>
				))}
			</UnorderedList>
		</GroupBoxStyled>
	);
};

export interface HowToBoxTranslateProps extends Omit<
	HowToBoxProps,
	"titleLabel" | "labels"
> {
	/**
	 * The i18n t function
	 */
	t: TFunction;
	/**
	 * i18n key passed to t function
	 */
	titleLabel?: string;
	/**
	 * i18n key passed to t function, used in combination with return object to obtain array of strings.
	 * Empty strings in that array are skipped, and a key that holds an empty array renders nothing,
	 * like the `labels` of HowToBox.
	 *
	 * A key that holds an object gives one entry per value, in the object's key order, so a keyed
	 * list (`"steps": { "download": "…", "upload": "…" }`) works like an array. Only strings and
	 * numbers become entries: a group nested inside the array or object is skipped, so a key that
	 * names the parent of a group (`"import"` instead of `"import.steps"`) shows only the parent's
	 * own strings. A key that holds a string is one entry, and a missing key shows the key itself.
	 */
	labels: string;
}

/** whether a value from the translation resources can be shown as an entry */
const isTranslatedEntry = (value: unknown): value is string | number =>
	typeof value === "string" || typeof value === "number";

/**
 * The entries in what `t(key, { returnObjects: true })` returned: the strings
 * and numbers of an array, or of an object's values, in order; a string or
 * number is one entry. Nested groups and anything else are skipped, as React
 * cannot render a plain object.
 */
const translatedEntries = (value: unknown): (string | number)[] => {
	if (isTranslatedEntry(value)) return [value];
	if (value == null || typeof value !== "object") return [];
	return (Array.isArray(value) ? value : Object.values(value)).filter(
		isTranslatedEntry,
	);
};

/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export const HowToBoxTranslate = (props: HowToBoxTranslateProps) => {
	const { t, titleLabel, labels, ...other } = props;
	// memo content because it's an array which gets re-created every render
	const content = useMemo(
		() => translatedEntries(t(labels, { returnObjects: true })),
		[t, labels],
	);
	return (
		<HowToBox
			{...other}
			titleLabel={titleLabel ? t(titleLabel) : undefined}
			labels={content}
		/>
	);
};

/**
 * Instructions in a frame: a {@link GroupBox} titled "How it works" (or
 * `titleLabel`) around a bulleted list with one item per entry of `labels`.
 *
 * Theme: `components.CcHowToBox.defaultProps` ({@link HowToBoxProps}),
 * `styleOverrides` per {@link HowToBoxClassKey} slot, and `variants`, which
 * apply to the frame. A variant's `props` match `titleLabel` and `labels` as
 * HowToBox gets them, after the theme's default props; from
 * {@link HowToBoxTranslate} these are the translated title and entries. A
 * `props` function gets these props directly: there is no `ownerState`. A
 * variant reaches the list and its entries through nested selectors.
 *
 * @example
 * // a theme that sets the entries of boxes with their own title in bold
 * createTheme({ components: { CcHowToBox: { variants: [{
 *   props: ({ titleLabel }) => titleLabel != null,
 *   style: { "& li": { fontWeight: "bold" } },
 * }] } } });
 */
export default React.memo(HowToBox);
