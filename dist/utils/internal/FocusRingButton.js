import { Button, buttonClasses, styled } from "@mui/material";
import focusRing from "./focusRing";
/**
 * MUI's Button with CC's keyboard focus ring: while it has keyboard focus
 * (`Mui-focusVisible`), a 2px solid outline in `palette.primary.main`, 2px
 * outside the button, where MUI draws the ring of the theme's `focusVisible`.
 * Forced colors keep it. MUI's focus ripple stays, and a mouse click shows no
 * ring.
 *
 * When the theme sets MUI's `focusVisible` option, MUI's own ring is the one
 * shown.
 *
 * Takes MUI's Button props.
 */
const FocusRingButton = styled(Button)(({ theme }) => ({
    [`&.${buttonClasses.focusVisible}`]: focusRing(theme, 2),
}));
export default FocusRingButton;
