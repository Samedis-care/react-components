import { buttonBaseClasses, IconButton, styled } from "@mui/material";
import focusRing from "../../utils/internal/focusRing";
/**
 * The button that opens a picker's calendar: MUI's default, an `IconButton`,
 * with the library's keyboard focus ring, a 2px outline in
 * `palette.primary.main`, which forced colors keep. MUI shows keyboard focus
 * on it only by a pulsing grey ripple, about 1.5:1 against the field.
 *
 * The ring runs 2px inside the button's edge, around the icon: the button is
 * 40px in every field size, so it reaches the border of a small outlined
 * field, and a ring at or outside its edge would run into that border. When
 * the theme sets `focusVisible`, MUI's ring is the one shown. A caller's
 * `slots.openPickerButton` replaces this button.
 */
const OpenPickerButton = styled(IconButton)(({ theme }) => ({
    [`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, -4),
}));
export default OpenPickerButton;
