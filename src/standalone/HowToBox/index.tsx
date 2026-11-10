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
	 * Without entries the box renders nothing, not even its frame and title:
	 * `undefined`, `null`, `""`, `false` and an empty array hide it.
	 *
	 * A line break `"\n"` in an entry starts a new line inside the same item,
	 * which is the only way to break a line in a translated string. Other runs
	 * of white space collapse to one space, as in normal text.
	 */
	labels: string[] | React.ReactNode[] | string | React.ReactNode | undefined;
	className?: string;
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<Record<HowToBoxClassKey, string>>;
}

const GroupBoxStyled = styled(GroupBox, { name: "CcHowToBox", slot: "root" })(
	{},
);

const UnorderedList = styled("ul", { name: "CcHowToBox", slot: "ul" })({
	paddingLeft: "1.5rem",
});

const ListItem = styled("li", { name: "CcHowToBox", slot: "li" })({
	whiteSpace: "pre-line",
});

export type HowToBoxClassKey = "root" | "ul" | "li";

const HowToBox = (inProps: HowToBoxProps) => {
	const props = useThemeProps({ props: inProps, name: "CcHowToBox" });
	const { titleLabel, labels, className, classes } = props;
	const { t } = useCCTranslations();

	if (!labels || (Array.isArray(labels) && labels.length === 0)) return <></>;

	return (
		<GroupBoxStyled
			label={titleLabel ?? t("standalone.how-it-works.title")}
			className={combineClassNames([className, classes?.root])}
		>
			<UnorderedList className={classes?.ul}>
				{Array.isArray(labels) ? (
					labels.map((label: string | React.ReactNode, i: number) => (
						<ListItem key={i} className={classes?.li}>
							{label}
						</ListItem>
					))
				) : (
					<ListItem className={classes?.li}>{labels}</ListItem>
				)}
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
	 * A key that holds an empty array renders nothing, like an empty `labels` array of HowToBox.
	 */
	labels: string;
}

/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export const HowToBoxTranslate = (props: HowToBoxTranslateProps) => {
	const { t, titleLabel, labels, ...other } = props;
	// memo content because it's an array which gets re-created every render
	const content: string[] = useMemo(
		() => t(labels, { returnObjects: true }) as string[],
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

export default React.memo(HowToBox);
