import { styled } from "@mui/material";
import React from "react";

export interface VerticalDividerProps {
	/**
	 * CSS class names to apply
	 */
	className?: string;
}

export type VerticalDividerClassKey = "root";

const VerticalDivider: React.ComponentType<
	React.HTMLAttributes<HTMLDivElement>
> = styled("div", {
	name: "CcVerticalDivider",
	slot: "root",
})(({ theme }) => ({
	display: "inline-block",
	borderRight: `1px solid ${theme.palette.divider}`,
	height: "100%",
	padding: "0",
	margin: "0 4px",
}));

export default VerticalDivider;
