import {
	AppBar,
	AppBarProps,
	IconButton,
	styled,
	Toolbar,
	ToolbarProps,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import React from "react";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../focusRing";

export interface PortalLayoutHeaderProps {
	/**
	 * Callback to toggle the menu drawer on mobile view
	 */
	toggleMenu: () => void;
	/**
	 * Show mobile view?
	 */
	mobile: boolean;
	/**
	 * The actual user-specified contents to display
	 */
	contents: React.ReactNode;
	/**
	 * CSS styles to apply
	 */
	customClasses?: {
		appBar?: AppBarProps["classes"];
		toolbar?: ToolbarProps["classes"];
	};
}

// on the AppBar (color "primary"), so the ring takes its text color
const MenuButton = styled(IconButton)(({ theme }) =>
	focusRing(theme.palette.primary.contrastText),
);

const PortalLayoutHeader = (props: PortalLayoutHeaderProps) => {
	const { mobile, customClasses, toggleMenu, contents } = props;
	const { t } = useCCTranslations();

	return (
		<AppBar position={"relative"} classes={customClasses?.appBar}>
			<Toolbar classes={customClasses?.toolbar}>
				{mobile && (
					<MenuButton
						onClick={toggleMenu}
						size="large"
						aria-label={t("standalone.portal.menu-toggle")}
					>
						<MenuIcon />
					</MenuButton>
				)}
				{contents}
			</Toolbar>
		</AppBar>
	);
};

export default React.memo(PortalLayoutHeader);
