import React, { CSSProperties, useCallback, useState } from "react";
import { Grid, IconButton, styled, useThemeProps } from "@mui/material";
import { DoubleArrow } from "@mui/icons-material";
import { usePortalLayoutContext } from "./Layout";
import combineClassNames from "../../utils/combineClassNames";

export interface CollapsibleMenuProps {
	/**
	 * The actual menu (Menu/RoutedMenu)
	 */
	children: React.ReactNode;
	/**
	 * Width of the menu (excluding collapse area)
	 */
	width?: CSSProperties["width"];
	/**
	 * CSS class name
	 */
	className?: string;
	/**
	 * Custom styles (for collapse)
	 */
	classes?: Partial<Record<CollapsibleMenuClassKey, string>>;
}

const Root = styled(Grid, { name: "CcCollapsibleMenu", slot: "root" })({
	width: "100%",
	height: "100%",
	overflow: "auto",
});

const Content = styled(Grid, { name: "CcCollapsibleMenu", slot: "content" })({
	"& > div": {
		overflow: "unset",
	},
});

const Bar = styled(Grid, { name: "CcCollapsibleMenu", slot: "bar" })({
	position: "sticky",
	top: 0,
});

const IconOpen = styled(DoubleArrow, {
	name: "CcCollapsibleMenu",
	slot: "iconOpen",
})({});
const IconClose = styled(DoubleArrow, {
	name: "CcCollapsibleMenu",
	slot: "iconClose",
})({
	transform: "rotate(180deg)",
});

const StyledButton = styled(IconButton, {
	name: "CcCollapsibleMenu",
	slot: "button",
})({});

export type CollapsibleMenuClassKey =
	| "root"
	| "content"
	| "bar"
	| "iconOpen"
	| "iconClose"
	| "button";

const CollapsibleMenu = (inProps: CollapsibleMenuProps) => {
	const props = useThemeProps({ props: inProps, name: "CcCollapsibleMenu" });
	const { classes, className } = props;

	const [collapsed, setCollapsed] = useState(false);
	const { mobile } = usePortalLayoutContext();

	const toggleCollapsed = useCallback(
		() => setCollapsed((prev) => !prev),
		[setCollapsed],
	);

	const ArrowComp = collapsed ? IconOpen : IconClose;

	return (
		<Root
			container
			justifyContent={"flex-start"}
			alignItems={"stretch"}
			wrap={"nowrap"}
			style={collapsed ? { overflow: "visible" } : undefined} // this is needed to force update the scrollbar, otherwise we're wasting space with a scrollbar placeholder
			className={combineClassNames([className, classes?.root])}
		>
			<Content
				size={"grow"}
				style={{ width: props.width, display: collapsed ? "none" : undefined }}
				className={classes?.content}
				key={"content"}
			>
				{props.children}
			</Content>
			{!mobile && (
				<Bar key={"bar"} className={classes?.bar}>
					<StyledButton
						onClick={toggleCollapsed}
						className={classes?.button}
						size="large"
					>
						<ArrowComp
							className={collapsed ? classes?.iconOpen : classes?.iconClose}
						/>
					</StyledButton>
				</Bar>
			)}
		</Root>
	);
};

export default React.memo(CollapsibleMenu);
