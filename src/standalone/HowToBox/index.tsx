import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import GroupBox from "../GroupBox";
import { ClassNameMap } from "@mui/styles/withStyles";
import useCCTranslations from "../../utils/useCCTranslations";
import { TFunction } from "i18next";

export interface HowToBoxProps {
	/**
	 * Box title label
	 */
	titleLabel?: React.ReactNode;
	/**
	 * How to entries
	 */
	labels:
		| string[]
		| React.ReactNodeArray
		| string
		| React.ReactNode
		| undefined;
	/**
	 * Custom CSS styles
	 */
	classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles(
	{
		groupBox: {
			paddingLeft: "1.5rem",
		},
	},
	{ name: "CcHowToBox" },
);

const HowToBox = (props: HowToBoxProps) => {
	const { titleLabel, labels } = props;
	const { t } = useCCTranslations();
	const classes = useStyles(props);

	if (!labels) return <></>;

	return (
		<GroupBox label={titleLabel ?? t("standalone.how-it-works.title")}>
			<ul className={classes.groupBox}>
				{Array.isArray(labels) ? (
					labels.map((label: string | React.ReactNode, i: number) => (
						<li key={i.toString(16)}>{label}</li>
					))
				) : (
					<li>{labels}</li>
				)}
			</ul>
		</GroupBox>
	);
};

export interface HowToBoxTranslateProps
	extends Omit<HowToBoxProps, "titleLabel" | "labels"> {
	/**
	 * The i18n t function
	 */
	t: TFunction;
	/**
	 * i18n key passed to t function
	 */
	titleLabel?: string;
	/**
	 * i18n key passed to t function, used in combination with return object to obtain array of strings
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
	const content = useMemo(
		() => t(labels, { returnObjects: true }),
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
