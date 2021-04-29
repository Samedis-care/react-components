import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { GroupBox } from "../index";
import i18n from "../../i18n";
import { ClassNameMap } from "@material-ui/styles/withStyles";

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
	{ name: "CcHowToBox" }
);

const HowToBox = (props: HowToBoxProps) => {
	const { titleLabel, labels } = props;
	const { t } = useTranslation(undefined, { i18n });
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

export default React.memo(HowToBox);
