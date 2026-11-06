import React from "react";
import type { IconButtonProps } from "@mui/material";
import { SmallestIconButton } from "../../Small";
import combineClassNames from "../../../utils/combineClassNames";

/**
 * The footer's icon button for an action that its own click makes unavailable
 * (Delete clears the selection it acts on). While disabled it stays in the tab
 * order, so keyboard focus stays on it instead of falling to the page: it is
 * marked aria-disabled, looks disabled (MUI's disabled state class) and does
 * not call onClick.
 * @remarks Takes the props of MUI's IconButton; ComponentWithLabel passes its
 *          disabled prop on to it
 */
const FocusableWhenDisabledIconButton = (props: IconButtonProps) => {
	const { disabled, onClick, className, ...other } = props;
	return (
		<SmallestIconButton
			{...other}
			aria-disabled={disabled || undefined}
			className={combineClassNames([className, disabled && "Mui-disabled"])}
			onClick={disabled ? undefined : onClick}
		/>
	);
};

export default React.memo(FocusableWhenDisabledIconButton);
