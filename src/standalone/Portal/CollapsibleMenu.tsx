import React, { CSSProperties, useCallback, useState } from "react";
import { Grid, IconButton, styled, useThemeProps } from "@mui/material";
import { DoubleArrow } from "@mui/icons-material";
import { usePortalLayoutContext } from "./Layout";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
import focusRing from "./focusRing";

export interface CollapsibleMenuProps {
	/**
	 * The actual menu (Menu/RoutedMenu)
	 *
	 * Hidden (`display: none`) while collapsed on desktop. The mobile layout has no
	 * collapse button, so there it is always shown; a menu collapsed on desktop is
	 * collapsed again when the layout returns to desktop.
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
})(({ theme }) => focusRing(theme.palette.primary.main));

export type CollapsibleMenuClassKey =
	"root" | "content" | "bar" | "iconOpen" | "iconClose" | "button";

const CollapsibleMenu = (inProps: CollapsibleMenuProps) => {
	const props = useThemeProps({ props: inProps, name: "CcCollapsibleMenu" });
	const { classes, className } = props;

	const [collapsed, setCollapsed] = useState(false);
	const { t } = useCCTranslations();
	const { mobile } = usePortalLayoutContext();
	// the mobile layout renders no button to expand the menu, so it is never hidden
	// there; `collapsed` stays as it is for the return to desktop
	const hidden = collapsed && !mobile;

	const toggleCollapsed = useCallback(
		() => setCollapsed((prev) => !prev),
		[setCollapsed],
	);

	const ArrowComp = collapsed ? IconOpen : IconClose;

	return (
		<Root
			container
			sx={{ justifyContent: "flex-start", alignItems: "stretch" }}
			wrap={"nowrap"}
			style={hidden ? { overflow: "visible" } : undefined} // this is needed to force update the scrollbar, otherwise we're wasting space with a scrollbar placeholder
			className={combineClassNames([className, classes?.root])}
		>
			<Content
				size={"grow"}
				style={{ width: props.width, display: hidden ? "none" : undefined }}
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
						aria-label={
							collapsed
								? t("standalone.portal.expand-menu")
								: t("standalone.portal.collapse-menu")
						}
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

/**
 * Desktop collapse for a menu, e.g. around the menu in PortalLayout's
 * `menuContent`: a button right of the menu ("Collapse menu" / "Expand menu")
 * hides the menu, leaving only the 48px button bar. In the mobile layout the
 * button is not rendered and the menu is always shown.
 *
 * Must be rendered inside a PortalLayout (it reads `usePortalLayoutContext`);
 * outside one it throws "PortalLayoutContext not set".
 */
export default React.memo(CollapsibleMenu);
