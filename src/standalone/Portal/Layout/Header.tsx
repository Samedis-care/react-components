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
import { usePortalLayoutContext } from "./index";

export interface PortalLayoutHeaderProps {
	/**
	 * Callback to toggle the menu drawer on mobile view
	 */
	toggleMenu: () => void;
	/**
	 * Show mobile view?
	 *
	 * true renders the burger button, which tells assistive technology whether
	 * the drawer is open (`aria-expanded`, from the layout's `menuOpen`) and
	 * which element the drawer is (`aria-controls`, `drawerId`). Its icon has
	 * the AppBar's text color (`color="inherit"`), whatever color the theme
	 * gives IconButtons.
	 */
	mobile: boolean;
	/**
	 * The id of the drawer the burger opens, named by the burger's
	 * `aria-controls`
	 *
	 * Set on the drawer's paper (PortalLayoutMenu's `drawerId`), which stays
	 * mounted while the drawer is closed, so the reference resolves whenever the
	 * burger is shown.
	 */
	drawerId: string;
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
	const { mobile, customClasses, toggleMenu, contents, drawerId } = props;
	const { t } = useCCTranslations();
	const { menuOpen } = usePortalLayoutContext();

	return (
		<AppBar position={"relative"} classes={customClasses?.appBar}>
			<Toolbar classes={customClasses?.toolbar}>
				{mobile && (
					<MenuButton
						// the AppBar's text color, as in MUI's AppBar examples: IconButton's
						// action color or a theme's default IconButton color can fall below
						// 3:1 on the AppBar's background
						color="inherit"
						onClick={toggleMenu}
						size="large"
						aria-label={t("standalone.portal.menu-toggle")}
						aria-expanded={menuOpen}
						aria-controls={drawerId}
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
