/**
 * The props of a button that opens a menu (WAI-ARIA menu button pattern)
 */
export interface MenuButtonProps {
    /**
     * The button's id, which names the menu
     */
    id: string;
    /**
     * Says that the button opens a menu
     */
    "aria-haspopup": "menu";
    /**
     * Is the menu open?
     */
    "aria-expanded": boolean;
    /**
     * The menu's id while it is open, else undefined
     */
    "aria-controls": string | undefined;
}
/**
 * The props of the menu's list (the element with role "menu"), for
 * `slotProps.list` of a MUI `Menu` or a `PopupMenu`
 */
export interface MenuButtonListProps {
    /**
     * The menu's id, which the button's aria-controls refers to
     */
    id: string;
    /**
     * The button's id: the button names the menu
     */
    "aria-labelledby": string;
}
/**
 * The menu's `slotProps` (of a MUI `Menu` or a `PopupMenu`) that
 * {@link useMenuButton} returns
 */
export interface MenuButtonMenuSlotProps {
    /**
     * The props of the menu's list
     */
    list: MenuButtonListProps;
}
/**
 * Wires a button to the menu it opens: the button says that it opens a menu,
 * whether the menu is open and, while it is, which element the menu is; the
 * menu is named by the button.
 * @param open Is the menu open?
 * @returns `buttonProps` for the element that opens the menu and `slotProps`
 * for the menu; both keep their identity while `open` does not change
 */
declare const useMenuButton: (open: boolean) => {
    buttonProps: MenuButtonProps;
    slotProps: MenuButtonMenuSlotProps;
};
export default useMenuButton;
