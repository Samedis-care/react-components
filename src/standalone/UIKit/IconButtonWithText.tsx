import React from "react";
import {
	Grid,
	IconButton,
	IconButtonProps,
	Typography,
	TypographyProps,
} from "@mui/material";

export interface IconButtonWithTextProps {
	IconButtonProps?: Omit<IconButtonProps, "children" | "onClick">;
	TypographyProps?: Omit<TypographyProps, "children" | "onClick">;
	text: TypographyProps["children"];
	icon: IconButtonProps["children"];
	onClick?: IconButtonProps["onClick"];
}

const IconButtonWithText = (props: IconButtonWithTextProps) => (
	<Grid container direction={"column"} alignItems={"center"}>
		<Grid item>
			<IconButton
				onClick={props.onClick}
				{...props.IconButtonProps}
				size="large"
			>
				{props.icon}
			</IconButton>
		</Grid>
		<Grid item>
			<Typography
				variant={"caption"}
				color={"textSecondary"}
				onClick={props.onClick}
				{...props.TypographyProps}
			>
				{props.text}
			</Typography>
		</Grid>
	</Grid>
);

export default React.memo(IconButtonWithText);
