import React, { useId } from "react";
import {
	Grid,
	IconButton,
	IconButtonProps,
	Typography,
	TypographyProps,
} from "@mui/material";

/**
 * Props of {@link IconButtonWithText}
 */
export interface IconButtonWithTextProps {
	/**
	 * Props of the IconButton. An `aria-label` or `aria-labelledby` here
	 * replaces the name taken from `text`, and the caption is then read as
	 * text of its own.
	 */
	IconButtonProps?: Omit<IconButtonProps, "children" | "onClick">;
	/**
	 * Props of the caption Typography, which defaults to variant "caption" and
	 * color "textSecondary"
	 */
	TypographyProps?: Omit<TypographyProps, "children" | "onClick">;
	/**
	 * Caption below the button, already translated: a string or any other node
	 * (no interactive content). It names the button (`aria-labelledby`) and is
	 * hidden from screen readers itself, so they read it once, as the button's
	 * name.
	 */
	text: TypographyProps["children"];
	/**
	 * The icon inside the IconButton
	 */
	icon: IconButtonProps["children"];
	/**
	 * Called with the click event by the button, and also by a click on the
	 * caption (mouse only: the caption is not focusable)
	 */
	onClick?: IconButtonProps["onClick"];
}

/**
 * A large IconButton with a caption below it, which names the button
 */
const IconButtonWithText = (props: IconButtonWithTextProps) => {
	const generatedId = useId();
	const captionId = props.TypographyProps?.id ?? generatedId;
	const namedByCaption =
		!props.IconButtonProps?.["aria-label"] &&
		!props.IconButtonProps?.["aria-labelledby"];
	return (
		<Grid container sx={{ flexDirection: "column", alignItems: "center" }}>
			<Grid>
				<IconButton
					onClick={props.onClick}
					aria-labelledby={namedByCaption ? captionId : undefined}
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
					aria-hidden={namedByCaption ? true : undefined}
					{...props.TypographyProps}
					id={captionId}
				>
					{props.text}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default React.memo(IconButtonWithText);
