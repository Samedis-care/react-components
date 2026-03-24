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
		<Grid>
			<IconButton
				onClick={props.onClick}
				aria-label={typeof props.text === "string" ? props.text : undefined}
				{...props.IconButtonProps}
				size="large"
			>
				{props.icon}
			</IconButton>
		</Grid>
		<Grid>
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
