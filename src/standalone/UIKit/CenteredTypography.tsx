import React from "react";
import {
	styled,
	Typography,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

export interface CenteredTypographyProps
	extends Omit<TypographyProps, "className" | "classes"> {
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<CenteredTypographyClassKey, string>>;
}

const Root = styled("div", { name: "CcCenteredTypography", slot: "root" })({
	position: "relative",
	height: "100%",
	width: "100%",
});

const Inner = styled("div", { name: "CcCenteredTypography", slot: "inner" })({
	height: 70,
	left: "50%",
	position: "absolute",
	textAlign: "center",
	top: "50%",
	transform: "translate(-50%, -50%)",
	width: "100%",
});

const StyledTypography = styled(Typography, {
	name: "CcCenteredTypography",
	slot: "typography",
})({});

export type CenteredTypographyClassKey = "root" | "inner" | "typography";

const CenteredTypography = (inProps: CenteredTypographyProps) => {
	const props = useThemeProps({ props: inProps, name: "CcCenteredTypography" });
	const { className, classes, ...typographyProps } = props;

	return (
		<Root className={combineClassNames([className, classes?.root])}>
			<Inner className={classes?.inner}>
				<StyledTypography
					{...typographyProps}
					className={classes?.typography}
				/>
			</Inner>
		</Root>
	);
};

export default React.memo(CenteredTypography);
