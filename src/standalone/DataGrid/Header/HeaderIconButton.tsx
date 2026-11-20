import { buttonBaseClasses, IconButton, styled } from "@mui/material";
import focusRing from "../../../utils/internal/focusRing";

/**
 * MUI's IconButton with the library's keyboard focus ring, 2px outside the
 * button: the header's buttons below md ("Columns", "Reset", "Export",
 * "Import", the phone's "More options") and the phone's "Search". MUI shows
 * keyboard focus on an IconButton only as a faint ripple (unless the theme sets
 * its focusVisible ring), which forced colors drop.
 */
const HeaderIconButton = styled(IconButton)(({ theme }) => ({
	[`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, 2),
})) as typeof IconButton;

export default HeaderIconButton;
