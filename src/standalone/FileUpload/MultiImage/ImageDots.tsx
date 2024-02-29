import React from "react";
import { Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import combineClassNames from "../../../utils/combineClassNames";
import makeThemeStyles from "../../../utils/makeThemeStyles";
import { Styles } from "@mui/styles";
import { ClassNameMap } from "@mui/styles/withStyles";

export interface ImageDotsProps {
	/**
	 * Total number of images
	 */
	total: number;
	/**
	 * Currently active image
	 */
	active: number;
	/**
	 * Set currently active image
	 * @param active Image index
	 */
	setActive: (active: number) => void;
	/**
	 * Optional style overrides
	 */
	classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
}

const useStyles = makeStyles(
	(theme) => ({
		activeImageDot: {
			backgroundColor: theme.palette.text.primary,
		},
		imageDot: {
			border: `1px solid ${theme.palette.text.primary}`,
			borderRadius: "100%",
			height: 12,
			width: 12,
			display: "inline-block",
			flex: "0 0 12px",
			marginRight: 12,
			cursor: "pointer",
		},
		imageDotContainerContainer: {
			overflow: "hidden",
			position: "relative",
			width: "100%",
			height: "100%",
			minHeight: 16,
		},
		imageDotContainer: {
			marginRight: 12,
			marginLeft: 12,
			width: "100%",
			height: "100%",
			position: "absolute",
			whiteSpace: "nowrap",
		},
	}),
	{ name: "CcImageDots" },
);

export type ImageDotsClassKey = keyof ReturnType<typeof useStyles>;

export type ImageDotsTheme = Partial<
	Styles<Theme, ImageDotsProps, ImageDotsClassKey>
>;

const useThemeStyles = makeThemeStyles<ImageDotsProps, ImageDotsClassKey>(
	(theme) => theme.componentsCare?.fileUpload?.multiImage?.dots,
	"CcImageDots",
	useStyles,
);

const ImageDots = (props: ImageDotsProps) => {
	const { total, active, setActive } = props;
	const classes = useThemeStyles(props);

	return (
		<>
			{total > 1 && (
				<div className={classes.imageDotContainerContainer}>
					<div className={classes.imageDotContainer}>
						{Array.from(Array(total).keys()).map((img, idx) => (
							<div
								key={idx}
								className={combineClassNames([
									active === idx && classes.activeImageDot,
									classes.imageDot,
								])}
								onClick={() => setActive(idx)}
							/>
						))}
					</div>
				</div>
			)}
		</>
	);
};

export default React.memo(ImageDots);
