import {
	Drawer,
	drawerClasses,
	Paper,
	styled,
	useTheme,
	useThemeProps,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import combineClassNames from "../../../utils/combineClassNames";

export interface PortalLayoutMenuProps {
	/**
	 * Is the menu open? (if non-permanent)
	 */
	menuOpen: boolean;
	/**
	 * Is mobile view?
	 *
	 * false renders a full-height Paper, true a temporary Drawer. A change moves
	 * `items` from one to the other without remounting them.
	 */
	mobile: boolean;
	/**
	 * The width of the menu, in px
	 *
	 * In mobile view the drawer is never wider than the screen minus 56px, so a
	 * strip of backdrop stays to tap to close it.
	 */
	drawerWidth?: number;
	/**
	 * The id of the drawer's paper in mobile view
	 *
	 * The paper is the drawer's dialog element, which holds the items; the
	 * burger names it in its `aria-controls`. The drawer is kept mounted while
	 * closed, so the id is in the document for as long as the drawer is
	 * rendered. Not set on the desktop Paper. Undefined: no id.
	 */
	drawerId?: string;
	/**
	 * Callback to toggle the menu open/closed
	 */
	toggleMenu: () => void;
	/**
	 * The menu items
	 *
	 * Mounted once and kept mounted when `mobile` changes, so they keep their
	 * state (a menu's active entry and expanded groups, a collapsed
	 * CollapsibleMenu). They are rendered into an element with
	 * `display: contents` inside the Paper or the drawer's paper, so they lay out
	 * as the paper's children. Escape pressed in them closes the drawer
	 * (`toggleMenu`), as on the drawer itself.
	 */
	items: React.ReactNode;
	/**
	 * class name to apply to drawer/paper
	 */
	className?: string;
	/**
	 * CSS classes
	 */
	classes?: Partial<Record<PortalLayoutMenuClassKey, string>>;
}

const modalProps = {
	// Better open performance on mobile. It also keeps the drawer's paper, which
	// the burger names in its aria-controls, in the document while closed.
	keepMounted: true,
};

const MenuPaper = styled(Paper, {
	name: "CcPortalLayoutMenu",
	slot: "menuPaper",
})({
	height: "100%",
});

const MenuDrawer = styled(Drawer, {
	name: "CcPortalLayoutMenu",
	slot: "menuDrawer",
})({
	// leave a strip of backdrop to tap on any screen, also with drawerWidth
	// (Material: a modal navigation drawer is at most the screen width minus 56px)
	[`& .${drawerClasses.paper}`]: {
		maxWidth: "calc(100% - 56px)",
	},
});

export type PortalLayoutMenuClassKey = "menuPaper" | "menuDrawer";

/**
 * The element the items are rendered into. It is moved between the Paper and
 * the drawer's paper, and generates no box of its own, so the items lay out as
 * the paper's children.
 */
const createItemsRoot = () => {
	const element = document.createElement("div");
	element.style.display = "contents";
	return element;
};

// carries the drawer's Escape handling for the items, without a box of its own
const ItemsKeyScope = styled("div")({ display: "contents" });

const PortalLayoutMenu = (inProps: PortalLayoutMenuProps) => {
	const props = useThemeProps({ props: inProps, name: "CcPortalLayoutMenu" });
	const {
		menuOpen,
		toggleMenu,
		drawerWidth,
		className,
		classes,
		mobile,
		items,
		drawerId,
	} = props;
	const theme = useTheme();

	// The Paper (desktop) and the Drawer (mobile) are different elements: items
	// rendered as their children would be remounted at every switch and lose
	// their state. So the items are rendered once, into this element, which is
	// moved into whichever of the two is shown.
	const [itemsRoot] = useState(createItemsRoot);
	const hostRef = useCallback(
		(host: HTMLElement | null) => {
			if (host) host.appendChild(itemsRoot);
		},
		[itemsRoot],
	);

	// The items are not in the Drawer's React tree (see the portal below), so
	// the Drawer's Escape handling does not see their key presses: handle it
	// here as MUI's Modal does for its own content
	const handleItemsKeyDown = useCallback(
		(evt: React.KeyboardEvent) => {
			if (!mobile || !menuOpen) return;
			// 229: the key ends an IME composition
			if (evt.key !== "Escape" || evt.keyCode === 229) return;
			evt.stopPropagation();
			toggleMenu();
		},
		[mobile, menuOpen, toggleMenu],
	);

	const paperProps = useMemo(
		() => ({
			style: { width: drawerWidth },
		}),
		[drawerWidth],
	);
	const drawerSlotProps = useMemo(
		() => ({ paper: { ...paperProps, id: drawerId, ref: hostRef } }),
		[paperProps, drawerId, hostRef],
	);

	return (
		<>
			{mobile ? (
				<MenuDrawer
					variant={"temporary"}
					anchor={theme.direction === "rtl" ? "right" : "left"}
					open={menuOpen}
					onClose={toggleMenu}
					slotProps={drawerSlotProps}
					ModalProps={modalProps}
					className={combineClassNames([className, classes?.menuDrawer])}
				/>
			) : (
				<MenuPaper
					{...paperProps}
					ref={hostRef}
					className={combineClassNames([className, classes?.menuPaper])}
				/>
			)}
			{
				// The inner portal keeps the items mounted. The outer one, to
				// document.body (where the Drawer renders), tells React that the
				// items' events, which bubble through the drawer's elements, are
				// dispatched already: without it, React would dispatch them a
				// second time through the Drawer, to the handlers above this
				// component.
				createPortal(
					createPortal(
						<ItemsKeyScope onKeyDown={handleItemsKeyDown}>
							{items}
						</ItemsKeyScope>,
						itemsRoot,
					),
					document.body,
				)
			}
		</>
	);
};

export default React.memo(PortalLayoutMenu);
