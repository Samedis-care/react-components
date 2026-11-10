import { useId, useMemo } from "react";
/**
 * Wires a button to the menu it opens: the button says that it opens a menu,
 * whether the menu is open and, while it is, which element the menu is; the
 * menu is named by the button.
 * @param open Is the menu open?
 * @returns `buttonProps` for the element that opens the menu and `slotProps`
 * for the menu; both keep their identity while `open` does not change
 */
const useMenuButton = (open) => {
    const buttonId = useId();
    const menuId = useId();
    const buttonProps = useMemo(() => ({
        id: buttonId,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : undefined,
    }), [buttonId, menuId, open]);
    const slotProps = useMemo(() => ({
        list: { id: menuId, "aria-labelledby": buttonId },
    }), [buttonId, menuId]);
    return { buttonProps, slotProps };
};
export default useMenuButton;
