import React from "react";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";

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
	 * CSS class for root
	 */
	className?: string;
	/**
	 * Optional style overrides
	 */
	classes?: Partial<Record<ImageDotsClassKey, string>>;
}

const Root = styled("div", { name: "CcImageDots", slot: "root" })({
	overflow: "hidden",
	position: "relative",
	width: "100%",
	height: "100%",
	minHeight: 16,
});

const Container = styled("div", { name: "CcImageDots", slot: "container" })({
	marginRight: 12,
	marginLeft: 12,
	width: "100%",
	height: "100%",
	position: "absolute",
	whiteSpace: "nowrap",
});

const ImageDot = styled("div", { name: "CcImageDots", slot: "imageDot" })(
	({ theme }) => ({
		border: `1px solid ${theme.palette.text.primary}`,
		borderRadius: "100%",
		height: 12,
		width: 12,
		display: "inline-block",
		flex: "0 0 12px",
		marginRight: 12,
		cursor: "pointer",
		"&.Mui-active": {
			backgroundColor: theme.palette.text.primary,
		},
	}),
);

export type ImageDotsClassKey = "root" | "container" | "imageDot";

const ImageDots = (inProps: ImageDotsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcImageDots" });
	const { total, active, setActive, className, classes } = props;

	return (
		<>
			{total > 1 && (
				<Root className={combineClassNames([className, classes?.root])}>
					<Container className={classes?.container}>
						{Array.from(Array(total).keys()).map((img, idx) => (
							<ImageDot
								key={idx}
								className={combineClassNames([
									active === idx && "Mui-active",
									classes?.imageDot,
								])}
								onClick={() => setActive(idx)}
							/>
						))}
					</Container>
				</Root>
			)}
		</>
	);
};

export default React.memo(ImageDots);
